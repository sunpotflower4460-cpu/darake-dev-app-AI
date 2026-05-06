import type { AiProviderId } from './aiProviderCandidates';

export type AiTaskTypeId =
  | 'screenshot-ui-review'
  | 'pr-review'
  | 'code-risk-review'
  | 'store-copy-review'
  | 'app-store-risk-review'
  | 'release-note-draft'
  | 'rejection-response-review'
  | 'cloud-agent-instruction-review'
  | 'phase-plan-review'
  | 'bug-triage'
  | 'ux-copy-polish';

export type AiTaskType = {
  id: AiTaskTypeId;
  label: string;
  purpose: string;
  recommendedProviders: AiProviderId[];
  inputRequired: string[];
  expectedOutput: string[];
  privateInfoRisk: 'low' | 'medium' | 'high';
  manualCheckRequired: boolean;
};

export const AI_TASK_TYPE_REGISTRY: AiTaskType[] = [
  {
    id: 'screenshot-ui-review',
    label: 'Screenshot UI Review',
    purpose: 'スクリーンショットやUI確認観点を外部AIへ安全に渡す。',
    recommendedProviders: ['manual-ai', 'google-gemini', 'openai', 'anthropic'],
    inputRequired: ['スクリーンショット概要', '確認したい画面幅', 'UIで気になる点', 'private情報マスク確認'],
    expectedOutput: ['overall判定', 'findings一覧', 'blockers', 'suggestions', 'next action'],
    privateInfoRisk: 'high',
    manualCheckRequired: true,
  },
  {
    id: 'pr-review',
    label: 'PR Review',
    purpose: 'PR要約・変更点・懸念点のレビュー依頼を整える。',
    recommendedProviders: ['manual-ai', 'anthropic', 'openai', 'deepseek'],
    inputRequired: ['PR概要', '差分要約', '危険領域の有無', 'secret除去済みテキスト'],
    expectedOutput: ['summary', 'risk評価', 'must fix', 'nice to have', 'merge recommendation'],
    privateInfoRisk: 'high',
    manualCheckRequired: true,
  },
  {
    id: 'code-risk-review',
    label: 'Code Risk Review',
    purpose: 'コード差分のセキュリティ・運用リスク観点を点検する。',
    recommendedProviders: ['manual-ai', 'anthropic', 'openai', 'deepseek', 'qwen'],
    inputRequired: ['変更理由', '差分抜粋', '既知の制約', '守るべき安全方針'],
    expectedOutput: ['risk level', 'must fix', 'manual review points', 'safe to ship条件'],
    privateInfoRisk: 'high',
    manualCheckRequired: true,
  },
  {
    id: 'store-copy-review',
    label: 'Store Copy Review',
    purpose: 'ストア文面や説明文を改善するレビュー依頼を作る。',
    recommendedProviders: ['manual-ai', 'openai', 'anthropic', 'google-gemini'],
    inputRequired: ['subtitle', 'promotional text', 'description草案', 'キーワード候補'],
    expectedOutput: ['改善提案', '危険表現', 'よりよい文面案', 'manual check項目'],
    privateInfoRisk: 'medium',
    manualCheckRequired: true,
  },
  {
    id: 'app-store-risk-review',
    label: 'App Store Risk Review',
    purpose: 'App Store審査リスクの観点を整理してレビュー依頼を作る。',
    recommendedProviders: ['manual-ai', 'anthropic', 'openai', 'google-gemini'],
    inputRequired: ['メタデータ下書き', '年齢レーティング情報', 'privacy note', '審査メモ'],
    expectedOutput: ['risk level', 'possible review issues', 'metadata improvements', 'privacy notes'],
    privateInfoRisk: 'medium',
    manualCheckRequired: true,
  },
  {
    id: 'release-note-draft',
    label: 'Release Note Draft',
    purpose: 'リリースノート草案の改善依頼を作る。',
    recommendedProviders: ['manual-ai', 'openai', 'anthropic'],
    inputRequired: ['変更点サマリー', 'ユーザー向け説明', '避けたい表現'],
    expectedOutput: ['短い案', '丁寧な案', '注意表現', '最終確認項目'],
    privateInfoRisk: 'low',
    manualCheckRequired: true,
  },
  {
    id: 'rejection-response-review',
    label: 'Rejection Response Review',
    purpose: '審査拒否への返答文を見直すための依頼書を作る。',
    recommendedProviders: ['manual-ai', 'anthropic', 'openai'],
    inputRequired: ['拒否理由', '修正内容', '返答草案', 'App Review向け配慮点'],
    expectedOutput: ['improved draft', 'tone review', 'missing explanation', 'manual check required'],
    privateInfoRisk: 'high',
    manualCheckRequired: true,
  },
  {
    id: 'cloud-agent-instruction-review',
    label: 'Cloud Agent Instruction Review',
    purpose: 'Cloud Agent向け指示書の明確さと安全性を点検する。',
    recommendedProviders: ['manual-ai', 'anthropic', 'openai'],
    inputRequired: ['指示書本文', '禁止事項', '完了条件', 'manual gate条件'],
    expectedOutput: ['instruction clarity review', 'missing guardrails', 'improved structure', 'manual sign-off'],
    privateInfoRisk: 'medium',
    manualCheckRequired: true,
  },
  {
    id: 'phase-plan-review',
    label: 'Phase Plan Review',
    purpose: 'Phase計画や次Phase提案の妥当性をレビューする。',
    recommendedProviders: ['manual-ai', 'anthropic', 'openai', 'xai-grok'],
    inputRequired: ['phase plan本文', '現状', '次に避けたいこと'],
    expectedOutput: ['plan risks', 'missing tasks', 'phase split suggestion', 'manual checkpoints'],
    privateInfoRisk: 'low',
    manualCheckRequired: true,
  },
  {
    id: 'bug-triage',
    label: 'Bug Triage',
    purpose: '不具合報告を整理して優先度と次アクション候補を作る。',
    recommendedProviders: ['manual-ai', 'openai', 'anthropic', 'deepseek', 'qwen'],
    inputRequired: ['現象', '再現手順', '影響範囲', '既知の制約'],
    expectedOutput: ['severity', 'likely cause', 'triage questions', 'next action'],
    privateInfoRisk: 'medium',
    manualCheckRequired: true,
  },
  {
    id: 'ux-copy-polish',
    label: 'UX Copy Polish',
    purpose: 'UI文言や説明文の改善候補を安全に作る。',
    recommendedProviders: ['manual-ai', 'openai', 'anthropic', 'google-gemini'],
    inputRequired: ['現在の文言', '対象画面', 'トーン', '避けたい表現'],
    expectedOutput: ['short option', 'friendly option', 'risk note', 'manual selection advice'],
    privateInfoRisk: 'low',
    manualCheckRequired: true,
  },
];

export function getAiTaskTypeById(id: AiTaskTypeId): AiTaskType | undefined {
  return AI_TASK_TYPE_REGISTRY.find((taskType) => taskType.id === id);
}

export function formatAiTaskTypeRegistryMarkdown(taskTypes: AiTaskType[]): string {
  const lines: string[] = ['# AI Task Type Registry'];

  taskTypes.forEach((taskType) => {
    lines.push('', `## ${taskType.label}`, `- id: ${taskType.id}`, `- purpose: ${taskType.purpose}`);
    lines.push(`- recommendedProviders: ${taskType.recommendedProviders.join(', ')}`);
    lines.push(`- privateInfoRisk: ${taskType.privateInfoRisk}`);
    lines.push(`- manualCheckRequired: ${taskType.manualCheckRequired ? 'yes' : 'no'}`);
    lines.push('- inputRequired:');
    taskType.inputRequired.forEach((item) => lines.push(`  - ${item}`));
    lines.push('- expectedOutput:');
    taskType.expectedOutput.forEach((item) => lines.push(`  - ${item}`));
  });

  return lines.join('\n');
}
