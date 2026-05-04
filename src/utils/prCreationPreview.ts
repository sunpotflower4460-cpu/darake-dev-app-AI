import type { CompletionReport } from './completionReport';
import type { ExecutionOrchestrationDraft } from './executionOrchestrationDraft';
import type { SavedAutoRunPlanQueue } from './savedAutoRunPlanQueue';
import type { SavedQueuePreflight } from './savedQueuePreflight';

export type PrPreviewStatus = 'not-ready' | 'preview-only' | 'low-risk-candidate' | 'blocked';

export type PrPreviewFilePlan = {
  path: string;
  changeType: 'create' | 'update' | 'review-only';
  reason: string;
  risk: 'safe-auto' | 'review-needed' | 'manual-gate' | 'blocked';
};

export type PrCreationPreview = {
  title: string;
  status: PrPreviewStatus;
  message: string;
  baseBranch: string;
  branchName: string;
  suggestedPrTitle: string;
  suggestedPrBody: string;
  labels: string[];
  canCreateAutomatically: boolean;
  checks: string[];
  warnings: string[];
  hardStops: string[];
  filePlan: PrPreviewFilePlan[];
};

const placeholderItems = new Set([
  'まだ自動進行候補はありません',
  '軽微な後回し項目はまだありません',
  '最後にまとめる手動項目はまだありません',
  '途中停止が必要な項目はまだありません',
]);

function normalizeSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);

  return slug || 'darake-app';
}

function realItems(items: string[]): string[] {
  return items.filter((item) => !placeholderItems.has(item));
}

function inferFilePlan(queue: SavedAutoRunPlanQueue): PrPreviewFilePlan[] {
  if (queue.items.length === 0) {
    return [
      {
        path: '未保存のAuto Run Plan',
        changeType: 'review-only',
        reason: '保存済みQueueがないため、PR候補をまだ作れません。',
        risk: 'manual-gate',
      },
    ];
  }

  return queue.items.map((item) => {
    if (item.status === 'blocked') {
      return {
        path: item.title,
        changeType: 'review-only',
        reason: 'blocked項目はPR作成前に停止候補として扱います。',
        risk: 'blocked',
      } satisfies PrPreviewFilePlan;
    }

    if (item.status === 'needs-review') {
      return {
        path: item.title,
        changeType: 'review-only',
        reason: 'Batch Gate Modeでは途中停止せず、PR本文の確認項目へまとめます。',
        risk: 'review-needed',
      } satisfies PrPreviewFilePlan;
    }

    return {
      path: item.title,
      changeType: 'update',
      reason: '低リスクの作業候補として、PR差分に含められる可能性があります。',
      risk: 'safe-auto',
    } satisfies PrPreviewFilePlan;
  });
}

function buildStatus(preflight: SavedQueuePreflight, draft: ExecutionOrchestrationDraft): PrPreviewStatus {
  if (preflight.status === 'empty' || draft.handoffMode === 'not-ready') return 'not-ready';
  if (preflight.status === 'hard-stop' || draft.handoffMode === 'blocked') return 'blocked';
  if (preflight.status === 'ready' && draft.handoffMode === 'ready') return 'low-risk-candidate';
  return 'preview-only';
}

function buildLabels(status: PrPreviewStatus): string[] {
  if (status === 'blocked') return ['pr-preview', 'blocked-review', 'manual-gate'];
  if (status === 'low-risk-candidate') return ['pr-preview', 'low-risk-candidate'];
  if (status === 'preview-only') return ['pr-preview', 'batch-gate', 'needs-review'];
  return ['pr-preview', 'not-ready'];
}

function buildMessage(status: PrPreviewStatus): string {
  if (status === 'not-ready') return '保存済みAuto Run Planがまだないため、PR作成プレビューは未準備です。まずPlanを保存します。';
  if (status === 'blocked') return 'blocked項目があります。PR作成前に、該当作業を分離するか手動ゲートへ回す必要があります。';
  if (status === 'low-risk-candidate') return '低リスク中心のPR作成候補です。ただしこの画面ではPRを作成せず、内容確認とコピーだけを行います。';
  return 'PR作成前の確認プレビューです。needs-reviewやmanual-gateはPR本文へまとめ、実行判断は人間側で行います。';
}

function formatList(title: string, items: string[]): string[] {
  return [title, ...(items.length > 0 ? items.map((item) => `- ${item}`) : ['- なし'])];
}

export function buildPrCreationPreview(
  appName: string,
  queue: SavedAutoRunPlanQueue,
  preflight: SavedQueuePreflight,
  draft: ExecutionOrchestrationDraft,
  report: CompletionReport,
): PrCreationPreview {
  const normalizedAppName = appName.trim() || '未入力のアプリ';
  const status = buildStatus(preflight, draft);
  const safeItems = realItems(report.doneItems);
  const warnings = [...realItems(report.batchedNotes), ...realItems(report.manualItems)];
  const hardStops = realItems(report.hardStopItems);
  const branchName = `auto/${normalizeSlug(normalizedAppName)}-phase-preview`;
  const suggestedPrTitle = `[Auto Run] ${normalizedAppName}: ${status === 'low-risk-candidate' ? '低リスクPR候補' : 'PR作成プレビュー'}`;

  const bodyLines = [
    '# PR作成プレビュー',
    '',
    `対象アプリ: ${normalizedAppName}`,
    `status: ${status}`,
    `baseBranch: main`,
    `branchName: ${branchName}`,
    '',
    '## このPRで扱う予定',
    ...(safeItems.length > 0 ? safeItems.map((item) => `- ${item}`) : ['- まだ低リスク候補はありません']),
    '',
    ...formatList('## PR本文へまとめる確認項目', warnings),
    '',
    ...formatList('## 作成前に止める候補', hardStops),
    '',
    '## Safety Gate',
    '- このプレビューはPR作成前の確認用です。',
    '- アプリ内からPR作成・マージはしません。',
    '- secret / token / key は含めません。',
    '- 本番DB、認証、課金、公開判断、App Store提出は手動ゲートです。',
  ];

  return {
    title: status === 'low-risk-candidate' ? 'PR作成プレビュー：低リスク候補' : 'PR作成プレビュー',
    status,
    message: buildMessage(status),
    baseBranch: 'main',
    branchName,
    suggestedPrTitle,
    suggestedPrBody: bodyLines.join('\n'),
    labels: buildLabels(status),
    canCreateAutomatically: status === 'low-risk-candidate',
    checks: [
      `preflight: ${preflight.status}`,
      `handoffMode: ${draft.handoffMode}`,
      `queue items: ${queue.items.length}`,
      status === 'low-risk-candidate' ? 'PR作成候補' : 'PR作成は手動ゲート',
    ],
    warnings,
    hardStops,
    filePlan: inferFilePlan(queue),
  };
}

export function formatPrCreationPreview(preview: PrCreationPreview): string {
  return [
    `# ${preview.title}`,
    '',
    preview.message,
    '',
    `- status: ${preview.status}`,
    `- canCreateAutomatically: ${preview.canCreateAutomatically}`,
    `- baseBranch: ${preview.baseBranch}`,
    `- branchName: ${preview.branchName}`,
    '',
    `## Suggested PR Title`,
    preview.suggestedPrTitle,
    '',
    `## Labels`,
    preview.labels.map((label) => `- ${label}`).join('\n'),
    '',
    `## Checks`,
    preview.checks.map((check) => `- ${check}`).join('\n'),
    '',
    `## File Plan`,
    preview.filePlan.map((item) => `- ${item.changeType}: ${item.path} / ${item.risk} / ${item.reason}`).join('\n'),
    '',
    `## Suggested PR Body`,
    preview.suggestedPrBody,
  ].join('\n');
}
