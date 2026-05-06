import { AI_PROVIDER_CANDIDATES, getAiProviderCandidate } from './aiProviderCandidates';
import { AI_TASK_TYPE_REGISTRY, getAiTaskTypeById } from './aiTaskTypeRegistry';
import { getAiReviewOutputFormatByTaskType } from './aiReviewOutputFormats';
import type { AiProviderId } from './aiProviderCandidates';
import type { AiTaskTypeId } from './aiTaskTypeRegistry';

export type AiPromptPackStatus = 'blocked' | 'ready-to-copy' | 'needs-review';

export type AiPromptPack = {
  title: string;
  taskType: AiTaskTypeId;
  provider: AiProviderId;
  status: AiPromptPackStatus;
  systemLikeContext: string;
  userPrompt: string;
  expectedOutputFormat: string;
  privateInfoWarnings: string[];
  manualChecklist: string[];
  markdown: string;
};

const TASK_SOURCE_HINTS: Record<AiTaskTypeId, string[]> = {
  'screenshot-ui-review': ['AiReviewInputPack', 'ScreenshotAiReviewPromptBuilder', 'ScreenshotResultRecord', 'UiCheckResultRecord'],
  'pr-review': ['AiReviewInputPack', 'GitHubOperationCandidate', 'CurrentIntegrationAudit'],
  'code-risk-review': ['AiReviewInputPack', 'SafetyInvariantAudit', 'GitHubOperationCandidate'],
  'store-copy-review': ['Store Copy Draft', 'App Store Metadata Draft', 'StoreCopyTemplatePanel'],
  'app-store-risk-review': ['App Store Metadata Draft', 'PrivacyAgeRatingDraft', 'AppStorePrepCompletionReport'],
  'release-note-draft': ['AiReviewInputPack', 'ReleaseRecord', 'LaunchPromotionMemo'],
  'rejection-response-review': ['Rejection Response Draft', 'AppReviewResponseDraftPanel', 'RejectionFixIssueDraft'],
  'cloud-agent-instruction-review': ['Cloud Agent Instruction Generator', 'Darake Top Command', 'Safety Invariant Audit'],
  'phase-plan-review': ['Phase Completion Reports', 'Cloud Agent Instruction Generator', 'Phase24IntegrationCompletionReport'],
  'bug-triage': ['IssueDraft', 'IssueRecord', 'GitHubOperationCandidate'],
  'ux-copy-polish': ['Store Copy Draft', 'App Store Metadata Draft', 'StoreCopyTemplatePanel'],
};

function buildPrivateInfoWarnings(taskType: AiTaskTypeId, provider: AiProviderId): string[] {
  const warnings = [
    'secret / token / API key / webhook URL / password を貼り付けない',
    'private repo情報・個人情報・未公開URLは必要最小限にする',
    'このアプリから外部AIへ自動送信しない',
  ];

  if (taskType === 'screenshot-ui-review') {
    warnings.push('画像内に個人情報やテストアカウント情報が写っていないか確認する');
  }
  if (taskType === 'pr-review' || taskType === 'code-risk-review') {
    warnings.push('差分は必要最小限の抜粋にし、未公開実装を丸ごと送らない');
  }
  if (taskType === 'rejection-response-review') {
    warnings.push('審査向けアカウント情報を含める場合は人間が別経路で安全に管理する');
  }
  if (provider !== 'manual-ai') {
    warnings.push('API候補プロバイダでも今Phaseではmanual copy onlyで扱う');
  }

  return warnings;
}

export function buildAiPromptPack(
  taskTypeId: AiTaskTypeId,
  providerId: AiProviderId,
  sourceContext: string,
): AiPromptPack {
  const taskType = getAiTaskTypeById(taskTypeId) ?? AI_TASK_TYPE_REGISTRY[0];
  const provider = getAiProviderCandidate(providerId) ?? AI_PROVIDER_CANDIDATES[0];
  const outputFormat = getAiReviewOutputFormatByTaskType(taskType.id);
  const privateInfoWarnings = buildPrivateInfoWarnings(taskType.id, provider.id);
  const manualChecklist = [
    '貼る前にsecret / token / 個人情報を消したか確認する',
    'このアプリではAPI keyを入力しない',
    '必要ならスクショやPR要約は人間が外部AIへ手動で貼る',
    '返答は指定のoutput formatに沿っているか確認する',
    'AIの返答を採用する前に対象パネルへ貼る内容を人間が再確認する',
  ];

  const status: AiPromptPackStatus =
    provider.status === 'blocked'
      ? 'blocked'
      : sourceContext.trim().length === 0
        ? 'needs-review'
        : 'ready-to-copy';

  const systemLikeContext = [
    `You are helping with: ${taskType.label}`,
    `Purpose: ${taskType.purpose}`,
    `Provider hint: ${provider.label} / ${provider.status}`,
    'Do not execute APIs, GitHub operations, or App Store operations.',
    'Review only the text or screenshots that a human manually pasted.',
    'If private or secret information appears, tell the human to remove it before proceeding.',
    'Respond in the requested output format and call out manual-check-required items explicitly.',
  ].join('\n');

  const userPrompt = [
    `# ${taskType.label}`,
    '',
    '## Goal',
    taskType.purpose,
    '',
    '## Recommended Input',
    ...taskType.inputRequired.map((item) => `- ${item}`),
    '',
    '## Available Source Materials in the Control Room',
    ...TASK_SOURCE_HINTS[taskType.id].map((item) => `- ${item}`),
    '',
    '## Human-Pasted Context',
    sourceContext.trim() || '（ここに人間が確認済みの内容を貼る）',
    '',
    '## What to Return',
    ...(taskType.expectedOutput.map((item) => `- ${item}`)),
    '',
    '## Safety Notes',
    ...privateInfoWarnings.map((item) => `- ${item}`),
    '',
    'Please follow the output format exactly and clearly label anything that still needs human review.',
  ].join('\n');

  const expectedOutputFormat = outputFormat?.markdown ?? '## Summary\n...';

  const markdown = [
    `# AI Prompt Pack: ${taskType.label}`,
    '',
    `- provider: ${provider.label}`,
    `- providerStatus: ${provider.status}`,
    `- taskType: ${taskType.id}`,
    `- promptStatus: ${status}`,
    '',
    '## System-like Context',
    systemLikeContext,
    '',
    '## User Prompt',
    userPrompt,
    '',
    '## Expected Output Format',
    expectedOutputFormat,
    '',
    '## Private Info Warnings',
    ...privateInfoWarnings.map((item) => `- ${item}`),
    '',
    '## Manual Checklist',
    ...manualChecklist.map((item) => `- ${item}`),
  ].join('\n');

  return {
    title: `${taskType.label} / ${provider.label}`,
    taskType: taskType.id,
    provider: provider.id,
    status,
    systemLikeContext,
    userPrompt,
    expectedOutputFormat,
    privateInfoWarnings,
    manualChecklist,
    markdown,
  };
}
