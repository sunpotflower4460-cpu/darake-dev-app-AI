import type { ScreenshotJobDraft, ScreenshotTarget } from './screenshotJobDraft';

export type ScreenshotCaptureStatus = 'not-captured' | 'captured' | 'warn' | 'failed';

export type ScreenshotResultEntry = {
  targetId: string;
  label: string;
  url: string;
  pagePath: string;
  viewportLabel: string;
  viewportWidth: number;
  viewportHeight: number;
  status: ScreenshotCaptureStatus;
  imagePath: string;
  capturedAt: string;
  note: string;
};

export type ScreenshotResultRecord = {
  title: string;
  savedAt?: string;
  sourceStatus: ScreenshotJobDraft['status'];
  entries: ScreenshotResultEntry[];
};

export type ScreenshotResultSummary = {
  total: number;
  notCaptured: number;
  captured: number;
  warn: number;
  failed: number;
  completionRate: number;
  status: 'empty' | 'waiting' | 'captured' | 'needs-review' | 'failed';
  message: string;
};

const KEY = 'darake.screenshotResultRecord.v1';

function entryFromTarget(target: ScreenshotTarget): ScreenshotResultEntry {
  return {
    targetId: target.id,
    label: target.label,
    url: target.url,
    pagePath: target.page.path,
    viewportLabel: target.viewport.label,
    viewportWidth: target.viewport.width,
    viewportHeight: target.viewport.height,
    status: 'not-captured',
    imagePath: '',
    capturedAt: '',
    note: target.note,
  };
}

export function buildInitialScreenshotResultRecord(draft: ScreenshotJobDraft): ScreenshotResultRecord {
  return {
    title: 'Screenshot Result Record',
    sourceStatus: draft.status,
    entries: draft.targets.map(entryFromTarget),
  };
}

export function loadScreenshotResultRecord(fallback: ScreenshotResultRecord): ScreenshotResultRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<ScreenshotResultRecord>;
    if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) return fallback;

    return {
      ...fallback,
      ...parsed,
      entries: parsed.entries as ScreenshotResultEntry[],
    };
  } catch {
    return fallback;
  }
}

export function saveScreenshotResultRecord(record: ScreenshotResultRecord): ScreenshotResultRecord {
  const next = {
    ...record,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return next;
  }

  return next;
}

export function clearScreenshotResultRecord(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}

export function updateScreenshotResultEntry(
  record: ScreenshotResultRecord,
  targetId: string,
  patch: Partial<Pick<ScreenshotResultEntry, 'status' | 'imagePath' | 'capturedAt' | 'note'>>,
): ScreenshotResultRecord {
  return {
    ...record,
    entries: record.entries.map((entry) => entry.targetId === targetId ? { ...entry, ...patch } : entry),
  };
}

export function summarizeScreenshotResult(record: ScreenshotResultRecord): ScreenshotResultSummary {
  const total = record.entries.length;
  const notCaptured = record.entries.filter((entry) => entry.status === 'not-captured').length;
  const captured = record.entries.filter((entry) => entry.status === 'captured').length;
  const warn = record.entries.filter((entry) => entry.status === 'warn').length;
  const failed = record.entries.filter((entry) => entry.status === 'failed').length;
  const completionRate = total === 0 ? 0 : Math.round(((total - notCaptured) / total) * 100);

  if (total === 0) {
    return {
      total,
      notCaptured,
      captured,
      warn,
      failed,
      completionRate,
      status: 'empty',
      message: 'スクショ対象がありません。',
    };
  }

  if (failed > 0) {
    return {
      total,
      notCaptured,
      captured,
      warn,
      failed,
      completionRate,
      status: 'failed',
      message: 'failedがあります。途中停止または再撮影候補です。',
    };
  }

  if (notCaptured > 0) {
    return {
      total,
      notCaptured,
      captured,
      warn,
      failed,
      completionRate,
      status: 'waiting',
      message: '未撮影の対象があります。将来の撮影結果をここへ記録します。',
    };
  }

  if (warn > 0) {
    return {
      total,
      notCaptured,
      captured,
      warn,
      failed,
      completionRate,
      status: 'needs-review',
      message: 'warnがあります。完成間近レポートで注意点として扱います。',
    };
  }

  return {
    total,
    notCaptured,
    captured,
    warn,
    failed,
    completionRate,
    status: 'captured',
    message: '記録上は全対象が撮影済みです。次のPhaseでUIチェック結果へ接続できます。',
  };
}

export function formatScreenshotResultRecord(record: ScreenshotResultRecord): string {
  const summary = summarizeScreenshotResult(record);

  return [
    `# ${record.title}`,
    '',
    summary.message,
    '',
    `- sourceStatus: ${record.sourceStatus}`,
    `- savedAt: ${record.savedAt || '未保存'}`,
    `- total: ${summary.total}`,
    `- notCaptured: ${summary.notCaptured}`,
    `- captured: ${summary.captured}`,
    `- warn: ${summary.warn}`,
    `- failed: ${summary.failed}`,
    `- completionRate: ${summary.completionRate}%`,
    '',
    '## Entries',
    ...record.entries.map((entry) => [
      `- [${entry.status}] ${entry.label}`,
      `  - url: ${entry.url || '未入力'}`,
      `  - viewport: ${entry.viewportWidth}x${entry.viewportHeight}`,
      `  - imagePath: ${entry.imagePath || '未入力'}`,
      `  - capturedAt: ${entry.capturedAt || '未入力'}`,
      `  - note: ${entry.note}`,
    ].join('\n')),
    '',
    '## Safety Notes',
    '- この記録は将来のスクショ実行結果を保存する器です。',
    '- Phase 10.7ではスクショ撮影や外部アクセスは行いません。',
  ].join('\n');
}
