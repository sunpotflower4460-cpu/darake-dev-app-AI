import type { PreviewTargetPage, PreviewUrlRecord, PreviewViewport } from './previewUrlStore';

export type ScreenshotTargetStatus = 'ready' | 'missing-url' | 'invalid-size';

export type ScreenshotTarget = {
  id: string;
  label: string;
  url: string;
  page: PreviewTargetPage;
  viewport: PreviewViewport;
  status: ScreenshotTargetStatus;
  note: string;
};

export type ScreenshotJobDraft = {
  title: string;
  status: 'not-ready' | 'draft-ready';
  message: string;
  baseUrl: string;
  targetCount: number;
  readyCount: number;
  blockedCount: number;
  targets: ScreenshotTarget[];
  safetyNotes: string[];
};

function joinUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const cleanPath = path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`;
  return `${cleanBase}${cleanPath === '/' ? '' : cleanPath}`;
}

function pickBaseUrl(record: PreviewUrlRecord): string {
  return record.previewUrl.trim() || record.localUrl.trim();
}

function targetStatus(baseUrl: string, viewport: PreviewViewport): ScreenshotTargetStatus {
  if (!baseUrl.trim()) return 'missing-url';
  if (viewport.width <= 0 || viewport.height <= 0) return 'invalid-size';
  return 'ready';
}

function targetNote(status: ScreenshotTargetStatus): string {
  if (status === 'missing-url') return 'Preview URLまたはLocal URLが必要です。';
  if (status === 'invalid-size') return 'viewportのwidth/heightが不正です。';
  return 'Phase 10.2では撮影せず、対象キューとして記録します。';
}

export function buildScreenshotJobDraft(record: PreviewUrlRecord): ScreenshotJobDraft {
  const baseUrl = pickBaseUrl(record);
  const targets = record.targetPages.flatMap((page) => record.viewports.map((viewport) => {
    const status = targetStatus(baseUrl, viewport);
    const label = `${page.label} / ${viewport.label}`;

    return {
      id: `${page.id}-${viewport.id}`,
      label,
      url: baseUrl ? joinUrl(baseUrl, page.path) : '',
      page,
      viewport,
      status,
      note: targetNote(status),
    } satisfies ScreenshotTarget;
  }));

  const readyCount = targets.filter((target) => target.status === 'ready').length;
  const blockedCount = targets.length - readyCount;
  const status = targets.length > 0 && readyCount === targets.length ? 'draft-ready' : 'not-ready';

  return {
    title: 'Screenshot Job Draft',
    status,
    message: status === 'draft-ready'
      ? 'スクショ対象キューを作成できます。ただしこの段階では撮影は実行しません。'
      : 'スクショ対象キューに不足があります。URLまたはviewportを確認してください。',
    baseUrl,
    targetCount: targets.length,
    readyCount,
    blockedCount,
    targets,
    safetyNotes: [
      'Phase 10.2ではスクショ撮影を実行しません。',
      '外部URLへのアクセスは行いません。',
      'GitHub Actionsや外部ワーカーは起動しません。',
      '画像ファイルは生成しません。',
      'Phase 10.3以降で機械チェックへ接続します。',
    ],
  };
}

export function formatScreenshotJobDraft(draft: ScreenshotJobDraft): string {
  return [
    `# ${draft.title}`,
    '',
    draft.message,
    '',
    `- status: ${draft.status}`,
    `- baseUrl: ${draft.baseUrl || '未入力'}`,
    `- targetCount: ${draft.targetCount}`,
    `- readyCount: ${draft.readyCount}`,
    `- blockedCount: ${draft.blockedCount}`,
    '',
    '## Targets',
    ...draft.targets.map((target) => `- [${target.status}] ${target.label}: ${target.url || 'URL未入力'} (${target.viewport.width}x${target.viewport.height})`),
    '',
    '## Safety Notes',
    ...draft.safetyNotes.map((note) => `- ${note}`),
  ].join('\n');
}
