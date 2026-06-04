import type { AiProviderId } from './aiProviderCandidates';
import type { AiTaskTypeId } from './aiTaskTypeRegistry';

export type AiExecutionCandidateDraft = {
  title: string;
  status: 'draft-only' | 'blocked';
  provider: AiProviderId;
  taskType: AiTaskTypeId;
  requiredSecrets: string[];
  requiredExternalSetup: string[];
  inputPayloadShape: string;
  outputExpectedShape: string;
  manualGates: string[];
  blockedConditions: string[];
  safetyNotes: string[];
};

export const AI_EXECUTION_CANDIDATE_DRAFTS: AiExecutionCandidateDraft[] = [
  {
    title: 'Manual AI Safety Copy Candidate',
    status: 'draft-only',
    provider: 'manual-ai',
    taskType: 'phase-plan-review',
    requiredSecrets: [],
    requiredExternalSetup: ['外部AIサービス規約の人間確認', '貼り付け前のprivate情報スクラブ', 'manual approval flow'],
    inputPayloadShape: 'human-reviewed prompt + redacted issue/pr/design context',
    outputExpectedShape: 'summary + review points + optional alternatives',
    manualGates: ['送信前human approval', '回答の採用前human review'],
    blockedConditions: ['API key入力欄を作ろうとしている', 'このアプリから外部AIへ自動送信しようとしている'],
    safetyNotes: ['このPhaseの既定候補', 'manual copy only', 'API keyは不要でもprivate情報確認は必須'],
  },
  {
    title: 'OpenAI PR Review Candidate',
    status: 'draft-only',
    provider: 'openai',
    taskType: 'pr-review',
    requiredSecrets: ['OPENAI_API_KEY'],
    requiredExternalSetup: ['外部secret manager', '送信前のprivate情報スクラブ', '監査ログ方針'],
    inputPayloadShape: 'system + user prompt + redacted PR summary + optional diff excerpt',
    outputExpectedShape: 'summary + risk + must fix + merge recommendation',
    manualGates: ['差分のredaction確認', '送信前human approval', '受信後human review'],
    blockedConditions: ['このアプリ内にAPI keyを入力しようとしている', 'secretや個人情報が未除去', '自動送信を有効化しようとしている'],
    safetyNotes: ['このPhaseでは実行しない', 'API keyは外部で管理する', 'PR全文の外部送信は人間確認必須'],
  },
  {
    title: 'Claude Instruction Review Candidate',
    status: 'draft-only',
    provider: 'anthropic',
    taskType: 'cloud-agent-instruction-review',
    requiredSecrets: ['ANTHROPIC_API_KEY'],
    requiredExternalSetup: ['外部secret manager', '送信ログ管理', 'manual approval flow'],
    inputPayloadShape: 'instruction markdown + safety policy + manual gates',
    outputExpectedShape: 'missing guardrails + improved instruction draft + review notes',
    manualGates: ['secret未送信確認', '最終指示書を人間が比較'],
    blockedConditions: ['instructionにprivate repo情報が多すぎる', '自動実行を前提にしている'],
    safetyNotes: ['このPhaseではdraft-only', 'レビュー結果はそのまま採用しない'],
  },
  {
    title: 'Gemini Screenshot Review Candidate',
    status: 'draft-only',
    provider: 'google-gemini',
    taskType: 'screenshot-ui-review',
    requiredSecrets: ['GEMINI_API_KEY'],
    requiredExternalSetup: ['画像送信ポリシー確認', 'private情報マスク手順', '外部secret manager'],
    inputPayloadShape: 'prompt + screenshot metadata + optional human-attached image',
    outputExpectedShape: 'overall + findings + blockers + suggestions',
    manualGates: ['画像内private情報の事前確認', '画像添付は人間が行う', '受信結果をUI結果へ転記する前に確認'],
    blockedConditions: ['画像をアプリが自動添付しようとしている', 'private情報を含む画像', 'API実行をこのPhaseで有効化しようとしている'],
    safetyNotes: ['このPhaseでは画像自動送信をしない', 'manual copy / manual attach only'],
  },
  {
    title: 'Grok Phase Plan Review Candidate',
    status: 'draft-only',
    provider: 'xai-grok',
    taskType: 'phase-plan-review',
    requiredSecrets: ['XAI_API_KEY'],
    requiredExternalSetup: ['利用規約確認', '送信前レビュー', '外部secret manager'],
    inputPayloadShape: 'phase plan summary + current status + desired constraints',
    outputExpectedShape: 'alternative plan suggestions + risks + next phase options',
    manualGates: ['AI提案と現行repoの一致確認'],
    blockedConditions: ['repo秘密情報が未整理', 'AI提案を自動採用しようとしている'],
    safetyNotes: ['別視点の参考用途に限る', '最終計画は人間が決める'],
  },
  {
    title: 'DeepSeek Code Risk Candidate',
    status: 'draft-only',
    provider: 'deepseek',
    taskType: 'code-risk-review',
    requiredSecrets: ['DEEPSEEK_API_KEY'],
    requiredExternalSetup: ['redactionルール', '外部secret manager', '送信監査'],
    inputPayloadShape: 'risk prompt + redacted code excerpt + constraints',
    outputExpectedShape: 'risk classification + must fix + manual review points',
    manualGates: ['コード差分のredaction確認', 'セキュリティ判断は人間が再確認'],
    blockedConditions: ['未公開鍵・認証情報を含むコード', '自動修正フローに接続しようとしている'],
    safetyNotes: ['提案は補助用途のみ', 'このPhaseではAPI連携しない'],
  },
  {
    title: 'Qwen Bug Triage Candidate',
    status: 'draft-only',
    provider: 'qwen',
    taskType: 'bug-triage',
    requiredSecrets: ['QWEN_API_KEY'],
    requiredExternalSetup: ['bug report anonymization', '外部secret manager'],
    inputPayloadShape: 'bug summary + repro steps + sanitized logs',
    outputExpectedShape: 'severity + likely cause + next action',
    manualGates: ['ログ匿名化確認', '優先度は人間が最終決定'],
    blockedConditions: ['個人情報付きログ', '自動Issue作成に直結させる設計'],
    safetyNotes: ['triage補助に限定', 'GitHubや外部APIの実行は行わない'],
  },
];

export function formatAiExecutionCandidateDraftsMarkdown(
  drafts: AiExecutionCandidateDraft[],
): string {
  const lines: string[] = [
    '# AI Execution Candidate Drafts',
    '',
    '- API keyはこのアプリに入力しない',
    '- secretは外部secret manager / GitHub Secrets等で人間が管理する',
    '- このPhaseではAPI実行しない',
    '- private情報の送信は人間確認必須',
  ];

  drafts.forEach((draft) => {
    lines.push('', `## ${draft.title}`, `- status: ${draft.status}`, `- provider: ${draft.provider}`, `- taskType: ${draft.taskType}`);
    lines.push('- requiredSecrets:');
    draft.requiredSecrets.forEach((item) => lines.push(`  - ${item}`));
    lines.push('- requiredExternalSetup:');
    draft.requiredExternalSetup.forEach((item) => lines.push(`  - ${item}`));
    lines.push(`- inputPayloadShape: ${draft.inputPayloadShape}`);
    lines.push(`- outputExpectedShape: ${draft.outputExpectedShape}`);
    lines.push('- manualGates:');
    draft.manualGates.forEach((item) => lines.push(`  - ${item}`));
    lines.push('- blockedConditions:');
    draft.blockedConditions.forEach((item) => lines.push(`  - ${item}`));
    lines.push('- safetyNotes:');
    draft.safetyNotes.forEach((item) => lines.push(`  - ${item}`));
  });

  return lines.join('\n');
}
