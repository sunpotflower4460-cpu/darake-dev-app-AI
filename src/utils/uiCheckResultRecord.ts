import type { UiMachineCheckDraft, UiMachineCheckItem, UiMachineCheckTarget } from './uiMachineCheckDraft';

export type UiCheckResultValue = 'unchecked' | 'pass' | 'warn' | 'fail';

export type UiCheckResultEntry = {
  checkId: string;
  label: string;
  scope: 'global' | 'target';
  targetLabel?: string;
  expectedStatus: UiMachineCheckItem['status'];
  result: UiCheckResultValue;
  note: string;
};

export type UiCheckResultRecord = {
  title: string;
  savedAt?: string;
  sourceStatus: UiMachineCheckDraft['status'];
  entries: UiCheckResultEntry[];
};

export type UiCheckResultSummary = {
  total: number;
  unchecked: number;
  pass: number;
  warn: number;
  fail: number;
  completionRate: number;
  status: 'empty' | 'in-progress' | 'passed' | 'needs-review' | 'failed';
  message: string;
};

const KEY = 'darake.uiCheckResultRecord.v1';

function entryFromGlobal(check: UiMachineCheckItem): UiCheckResultEntry {
  return {
    checkId: check.id,
    label: check.label,
    scope: 'global',
    expectedStatus: check.status,
    result: 'unchecked',
    note: check.detail,
  };
}

function entriesFromTarget(target: UiMachineCheckTarget): UiCheckResultEntry[] {
  return target.checks.map((check) => ({
    checkId: check.id,
    label: check.label,
    scope: 'target',
    targetLabel: target.label,
    expectedStatus: check.status,
    result: 'unchecked',
    note: check.detail,
  }));
}

export function buildInitialUiCheckResultRecord(draft: UiMachineCheckDraft): UiCheckResultRecord {
  return {
    title: 'UI Check Result Record',
    sourceStatus: draft.status,
    entries: [
      ...draft.globalChecks.map(entryFromGlobal),
      ...draft.targets.flatMap(entriesFromTarget),
    ],
  };
}

export function loadUiCheckResultRecord(fallback: UiCheckResultRecord): UiCheckResultRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<UiCheckResultRecord>;
    if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) return fallback;

    return {
      ...fallback,
      ...parsed,
      entries: parsed.entries as UiCheckResultEntry[],
    };
  } catch {
    return fallback;
  }
}

export function saveUiCheckResultRecord(record: UiCheckResultRecord): UiCheckResultRecord {
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

export function clearUiCheckResultRecord(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}

export function updateUiCheckResultEntry(
  record: UiCheckResultRecord,
  checkId: string,
  result: UiCheckResultValue,
): UiCheckResultRecord {
  return {
    ...record,
    entries: record.entries.map((entry) => entry.checkId === checkId ? { ...entry, result } : entry),
  };
}

export function summarizeUiCheckResult(record: UiCheckResultRecord): UiCheckResultSummary {
  const total = record.entries.length;
  const unchecked = record.entries.filter((entry) => entry.result === 'unchecked').length;
  const pass = record.entries.filter((entry) => entry.result === 'pass').length;
  const warn = record.entries.filter((entry) => entry.result === 'warn').length;
  const fail = record.entries.filter((entry) => entry.result === 'fail').length;
  const completionRate = total === 0 ? 0 : Math.round(((total - unchecked) / total) * 100);

  if (total === 0) {
    return {
      total,
      unchecked,
      pass,
      warn,
      fail,
      completionRate,
      status: 'empty',
      message: '記録対象のチェックがありません。',
    };
  }

  if (fail > 0) {
    return {
      total,
      unchecked,
      pass,
      warn,
      fail,
      completionRate,
      status: 'failed',
      message: 'failがあります。途中停止または修正候補です。',
    };
  }

  if (unchecked > 0) {
    return {
      total,
      unchecked,
      pass,
      warn,
      fail,
      completionRate,
      status: 'in-progress',
      message: '未確認項目があります。結果を記録してください。',
    };
  }

  if (warn > 0) {
    return {
      total,
      unchecked,
      pass,
      warn,
      fail,
      completionRate,
      status: 'needs-review',
      message: 'warnがあります。Batch Gate Modeでは完成間近レポートへ回せます。',
    };
  }

  return {
    total,
    unchecked,
    pass,
    warn,
    fail,
    completionRate,
    status: 'passed',
    message: '記録上はすべてpassです。次のPhaseで実スクショ結果との接続へ進めます。',
  };
}

export function formatUiCheckResultRecord(record: UiCheckResultRecord): string {
  const summary = summarizeUiCheckResult(record);

  return [
    `# ${record.title}`,
    '',
    summary.message,
    '',
    `- sourceStatus: ${record.sourceStatus}`,
    `- savedAt: ${record.savedAt || '未保存'}`,
    `- total: ${summary.total}`,
    `- unchecked: ${summary.unchecked}`,
    `- pass: ${summary.pass}`,
    `- warn: ${summary.warn}`,
    `- fail: ${summary.fail}`,
    `- completionRate: ${summary.completionRate}%`,
    '',
    '## Entries',
    ...record.entries.map((entry) => {
      const target = entry.targetLabel ? ` / ${entry.targetLabel}` : '';
      return `- [${entry.result}] ${entry.scope}${target} / ${entry.label}: ${entry.note}`;
    }),
    '',
    '## Safety Notes',
    '- この記録は手動または将来の自動結果を保存する器です。',
    '- Phase 10.4ではスクショ撮影や外部アクセスは行いません。',
  ].join('\n');
}
