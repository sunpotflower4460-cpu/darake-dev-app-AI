import type { CompletionReport } from './completionReport';
import type { ExecutionOrchestrationDraft } from './executionOrchestrationDraft';
import type { IssueHandoffTemplate } from './issueHandoffTemplate';
import type { SavedAutoRunPlanQueue } from './savedAutoRunPlanQueue';
import type { SavedQueuePreflight } from './savedQueuePreflight';

export type ExternalAgentPrompt = {
  title: string;
  targetAgents: string[];
  prompt: string;
  safetyMode: 'copy-only' | 'batch-gate' | 'blocked-review' | 'not-ready';
  summary: string[];
};

function formatList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function buildSafetyMode(
  preflight: SavedQueuePreflight,
  draft: ExecutionOrchestrationDraft,
): ExternalAgentPrompt['safetyMode'] {
  if (preflight.status === 'empty' || draft.handoffMode === 'not-ready') return 'not-ready';
  if (draft.handoffMode === 'blocked') return 'blocked-review';
  if (draft.handoffMode === 'batch-gate') return 'batch-gate';
  return 'copy-only';
}

export function buildExternalAgentPrompt(
  appName: string,
  queue: SavedAutoRunPlanQueue,
  preflight: SavedQueuePreflight,
  completionReport: CompletionReport,
  draft: ExecutionOrchestrationDraft,
  issueTemplate: IssueHandoffTemplate,
): ExternalAgentPrompt {
  const normalizedAppName = appName.trim() || '未入力のアプリ';
  const safetyMode = buildSafetyMode(preflight, draft);
  const title = `[External Agent Prompt] ${normalizedAppName} / ${draft.handoffMode}`;
  const targetAgents = ['GitHub Copilot Coding Agent', 'Claude Code', 'OpenClaw', 'Cloud Agent'];

  const prompt = [
    `# ${title}`,
    '',
    'あなたはこのリポジトリの実装エージェントです。以下のAuto Run Planをもとに、安全ゲートを守りながら実装してください。',
    '',
    '## 最重要方針',
    '- できるところまで一括で進めてください。',
    '- 軽微な確認・低リスクな改善・後で見ればよい項目では途中停止しないでください。',
    '- どうしても進めないもの、secret / token / key、本番DB、認証、課金、公開判断、App Store提出は手動ゲートとして扱ってください。',
    '- blockedがある場合は、該当地点で停止候補として記録してください。',
    '- 途中で止まるより、完成間近で「できたこと / 残ったこと / 手動項目」をまとめて報告してください。',
    '',
    '## 対象',
    `- appName: ${normalizedAppName}`,
    `- handoffMode: ${draft.handoffMode}`,
    `- safetyMode: ${safetyMode}`,
    `- preflight: ${preflight.status}`,
    `- savedAt: ${queue.savedAt}`,
    '',
    '## 固定Queue',
    queue.items.length > 0
      ? queue.items.map((item) => `- ${item.order}. ${item.title} / ${item.status} / ${item.riskLabel}`).join('\n')
      : '- 保存済みQueueなし',
    '',
    '## 実行前チェック',
    formatList(preflight.checks),
    '',
    '## 実行パック要約',
    formatList(draft.payloadSummary),
    '',
    '## Safety Notes',
    formatList(draft.safetyNotes),
    '',
    '## Completion Reportの期待出力',
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
    '## Issue Handoff参照',
    `- Issue title: ${issueTemplate.title}`,
    `- Labels: ${issueTemplate.labels.join(', ')}`,
    `- Issue safetyMode: ${issueTemplate.safetyMode}`,
    '',
    '## 完了条件',
    '- Typecheck / Build / 既存CIを通すこと。',
    '- 変更内容をPhase単位で要約すること。',
    '- UI変更がある場合はスマホ表示を壊さないこと。',
    '- secret / token / key を要求しないこと。必要な場合は最後の手動項目へ回すこと。',
    '- 最後に「できたこと / 残ったこと / 手動が必要なこと」をまとめること。',
  ].join('\n');

  return {
    title,
    targetAgents,
    prompt,
    safetyMode,
    summary: [
      `targetAgents: ${targetAgents.length}`,
      `queueItems: ${queue.items.length}`,
      `preflight: ${preflight.status}`,
      `handoffMode: ${draft.handoffMode}`,
      `safetyMode: ${safetyMode}`,
    ],
  };
}

export function formatExternalAgentPrompt(prompt: ExternalAgentPrompt): string {
  return [
    `Title: ${prompt.title}`,
    `Target Agents: ${prompt.targetAgents.join(', ')}`,
    `Safety Mode: ${prompt.safetyMode}`,
    '',
    prompt.prompt,
  ].join('\n');
}
