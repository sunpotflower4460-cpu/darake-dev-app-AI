import type { CompletionReport } from './completionReport';
import type { ExecutionOrchestrationDraft } from './executionOrchestrationDraft';
import { formatExecutionOrchestrationDraft } from './executionOrchestrationDraft';
import type { SavedAutoRunPlanQueue } from './savedAutoRunPlanQueue';
import type { SavedQueuePreflight } from './savedQueuePreflight';

export type IssueHandoffTemplate = {
  title: string;
  body: string;
  labels: string[];
  safetyMode: 'copy-only' | 'manual-gate' | 'blocked-review';
};

function formatList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function buildLabels(draft: ExecutionOrchestrationDraft): string[] {
  if (draft.handoffMode === 'blocked') return ['auto-run-plan', 'blocked-review', 'manual-gate'];
  if (draft.handoffMode === 'batch-gate') return ['auto-run-plan', 'batch-gate', 'needs-review'];
  if (draft.handoffMode === 'ready') return ['auto-run-plan', 'ready'];
  return ['auto-run-plan', 'not-ready'];
}

function buildSafetyMode(draft: ExecutionOrchestrationDraft): IssueHandoffTemplate['safetyMode'] {
  if (draft.handoffMode === 'blocked') return 'blocked-review';
  if (draft.handoffMode === 'batch-gate') return 'manual-gate';
  return 'copy-only';
}

export function buildIssueHandoffTemplate(
  appName: string,
  queue: SavedAutoRunPlanQueue,
  preflight: SavedQueuePreflight,
  completionReport: CompletionReport,
  draft: ExecutionOrchestrationDraft,
): IssueHandoffTemplate {
  const normalizedAppName = appName.trim() || '未入力のアプリ';
  const title = `[Auto Run Plan] ${normalizedAppName} / ${draft.handoffMode}`;

  const body = [
    '# Auto Run Plan Handoff',
    '',
    `対象アプリ: ${normalizedAppName}`,
    `handoffMode: ${draft.handoffMode}`,
    `preflight: ${preflight.status}`,
    `savedAt: ${queue.savedAt}`,
    '',
    '## 実行パック下書き',
    formatExecutionOrchestrationDraft(draft),
    '',
    '## 固定Queue',
    queue.items.length > 0
      ? queue.items.map((item) => `- ${item.order}. ${item.title} / ${item.status} / ${item.riskLabel}`).join('\n')
      : '- 保存済みQueueなし',
    '',
    '## Completion Report要約',
    '### できたこと候補',
    formatList(completionReport.doneItems),
    '',
    '### 最後にまとめる注意点',
    formatList(completionReport.batchedNotes),
    '',
    '### 手動項目',
    formatList(completionReport.manualItems),
    '',
    '### 途中停止候補',
    formatList(completionReport.hardStopItems),
    '',
    '## Safety Gate',
    '- このIssueテンプレートはコピー用です。アプリ内からIssue作成はしません。',
    '- secret / token / key は貼らないでください。',
    '- 本番DB、認証、課金、公開判断、App Store提出は手動ゲートです。',
    '- blockedがある場合、該当地点で停止候補として扱います。',
  ].join('\n');

  return {
    title,
    body,
    labels: buildLabels(draft),
    safetyMode: buildSafetyMode(draft),
  };
}

export function formatIssueHandoffTemplate(template: IssueHandoffTemplate): string {
  return [
    `Title: ${template.title}`,
    `Labels: ${template.labels.join(', ')}`,
    `Safety Mode: ${template.safetyMode}`,
    '',
    template.body,
  ].join('\n');
}
