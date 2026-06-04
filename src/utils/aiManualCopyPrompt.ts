import type { AiExecutionCandidateDraft } from './aiExecutionCandidateDraft';
import type { AiProviderId } from './aiProviderCandidates';

export type AiManualCopyPromptInput = {
  draft: AiExecutionCandidateDraft;
  purpose: string;
  notDoingNow?: string[];
  additionalContext?: string;
};

const DEFAULT_NOT_DOING_NOW = [
  'OpenAI / Claude / Gemini APIの直接呼び出し',
  'GitHub Issueの自動作成',
  'PR作成やマージの自動化',
  'private情報の自動送信',
  'AI回答の自動反映',
];

const PROVIDER_FOCUS: Record<AiProviderId, string> = {
  openai: '総合レビュー向け。全体の抜け漏れ・優先順位の整理にフォーカスしてください。',
  anthropic: '長文設計レビュー向け。制約整理と設計上のトレードオフを丁寧に指摘してください。',
  'google-gemini': 'スクショ/UIレビュー向け。UIの分かりやすさ・一貫性・導線の改善を重視してください。',
  'xai-grok': '別視点レビュー向け。思い込みや見落としを突く代替視点を提示してください。',
  deepseek: 'コード補助向け。実装リスク、変更範囲、具体的な改善案を短く提示してください。',
  qwen: 'コード補助向け。バグ切り分けと修正候補の比較を分かりやすく提示してください。',
  'manual-ai': '既定の安全候補。外部AIの種類は任意ですが安全注意を最優先で守ってください。',
  other: '未評価候補。安全性未確認のため、回答は参考情報としてのみ扱ってください。',
};

export function buildAiManualCopyPrompt(input: AiManualCopyPromptInput): string {
  const purpose = input.purpose.trim() || '（ここにIssue / PR / 設計の目的を記入）';
  const notDoingNow = (input.notDoingNow?.length ? input.notDoingNow : DEFAULT_NOT_DOING_NOW).map((item) => item.trim()).filter(Boolean);
  const providerFocus = PROVIDER_FOCUS[input.draft.provider];
  const requiredSecrets = input.draft.requiredSecrets.length > 0 ? input.draft.requiredSecrets.join(', ') : 'なし（この候補はAPI key入力不要）';

  const lines = [
    '# 外部AIへの手動コピー用プロンプト',
    '',
    '## 安全注意（必読）',
    '- このアプリから外部AI APIへ送信はしません（manual copy only）。',
    '- API key / token / secret は貼らないでください。',
    '- private情報や個人情報は貼る前に人間が確認し、不要部分は削除してください。',
    '- AIの回答は自動採用せず、人間が確認してから採用してください。',
    '',
    '## このIssue / PR / 設計の目的',
    purpose,
    '',
    '## Provider別の注意',
    `- provider: ${input.draft.provider}`,
    `- focus: ${providerFocus}`,
    '',
    '## 前提情報',
    `- candidateTitle: ${input.draft.title}`,
    `- status: ${input.draft.status}`,
    `- taskType: ${input.draft.taskType}`,
    `- requiredSecrets: ${requiredSecrets}`,
    `- inputPayloadShape: ${input.draft.inputPayloadShape}`,
    `- outputExpectedShape: ${input.draft.outputExpectedShape}`,
    '',
    '## 出力してほしい形式',
    `- ${input.draft.outputExpectedShape}`,
    '- 不足情報があれば先に質問してください。',
    '- 根拠が弱い推測は推測と明示してください。',
    '',
    '## Manual Gate（必須）',
    ...input.draft.manualGates.map((gate) => `- ${gate}`),
    '',
    '## Safety Notes',
    ...input.draft.safetyNotes.map((note) => `- ${note}`),
    '',
    '## まだやらないこと',
    ...notDoingNow.map((item) => `- ${item}`),
  ];

  if (input.additionalContext?.trim()) {
    lines.push('', '## 追加コンテキスト', input.additionalContext.trim());
  }

  return lines.join('\n');
}

