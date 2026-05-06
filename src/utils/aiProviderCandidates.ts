export type AiProviderId =
  | 'openai'
  | 'anthropic'
  | 'google-gemini'
  | 'xai-grok'
  | 'deepseek'
  | 'qwen'
  | 'manual-ai'
  | 'other';

export type AiProviderCandidate = {
  id: AiProviderId;
  label: string;
  status: 'manual-copy-only' | 'api-candidate' | 'blocked';
  bestFor: string[];
  weakFor: string[];
  requiresApiKey: boolean;
  secretPolicy: 'never-store' | 'external-secret-only';
  notes: string;
};

export const AI_PROVIDER_CANDIDATES: AiProviderCandidate[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    status: 'api-candidate',
    bestFor: ['総合レビュー', 'コード説明', 'ストア文面改善', '設計整理'],
    weakFor: ['添付画像の自動送信判断', 'このPhaseでの直接実行'],
    requiresApiKey: true,
    secretPolicy: 'external-secret-only',
    notes: '将来のAPI候補。今Phaseでは手動コピーのみで使い、API keyはこのアプリに入力しない。',
  },
  {
    id: 'anthropic',
    label: 'Claude',
    status: 'api-candidate',
    bestFor: ['長文レビュー', '設計批評', '仕様書整理'],
    weakFor: ['このPhaseでの直接実行', '秘密情報の貼り付け'],
    requiresApiKey: true,
    secretPolicy: 'external-secret-only',
    notes: '長文の指示書やレビュー候補向き。secret管理は外部secret manager前提。',
  },
  {
    id: 'google-gemini',
    label: 'Gemini',
    status: 'api-candidate',
    bestFor: ['スクショ/画像レビュー候補', 'UI確認', '軽い実装案'],
    weakFor: ['このPhaseでの画像自動送信', '本番情報の貼り付け'],
    requiresApiKey: true,
    secretPolicy: 'external-secret-only',
    notes: '画像系候補だが、このアプリから画像を自動送信しない。人間が外部AIに手動で貼る前提。',
  },
  {
    id: 'xai-grok',
    label: 'Grok',
    status: 'api-candidate',
    bestFor: ['率直レビュー', '別角度のツッコミ', '代替視点の確認'],
    weakFor: ['このPhaseでの直接実行', '根拠不明な断言の採用'],
    requiresApiKey: true,
    secretPolicy: 'external-secret-only',
    notes: '別視点レビュー候補。返答は必ず人間が確認してから採用する。',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    status: 'api-candidate',
    bestFor: ['コード系補助候補', '実装整理', 'レビューの補助'],
    weakFor: ['このPhaseでの直接実行', 'private情報の貼り付け'],
    requiresApiKey: true,
    secretPolicy: 'external-secret-only',
    notes: 'コード補助候補。API連携は将来案に留め、今はmanual copy only。',
  },
  {
    id: 'qwen',
    label: 'Qwen',
    status: 'api-candidate',
    bestFor: ['コード系補助候補', '要約', '代替表現の比較'],
    weakFor: ['このPhaseでの直接実行', '機密テキストの貼り付け'],
    requiresApiKey: true,
    secretPolicy: 'external-secret-only',
    notes: '補助的な比較候補。外部AIへ渡す内容は都度スクラブしてからコピーする。',
  },
  {
    id: 'manual-ai',
    label: 'Manual AI / 任意AI',
    status: 'manual-copy-only',
    bestFor: ['ユーザーが任意AIへ手動コピペ', 'API未使用の安全運用', '比較レビュー'],
    weakFor: ['自動実行', 'secret管理'],
    requiresApiKey: false,
    secretPolicy: 'never-store',
    notes: 'このPhaseで最も安全な既定候補。ユーザーが外部AIへ手動で貼り付ける。',
  },
  {
    id: 'other',
    label: 'Other / Human-reviewed only',
    status: 'blocked',
    bestFor: ['未評価プロバイダの比較検討'],
    weakFor: ['即時利用', '安全性未確認の送信'],
    requiresApiKey: true,
    secretPolicy: 'external-secret-only',
    notes: '安全方針・規約・送信先が未評価ならblocked扱い。人間レビューなしでは使わない。',
  },
];

export function getAiProviderCandidate(id: AiProviderId): AiProviderCandidate | undefined {
  return AI_PROVIDER_CANDIDATES.find((candidate) => candidate.id === id);
}

export function formatAiProviderCandidatesMarkdown(candidates: AiProviderCandidate[]): string {
  const lines: string[] = [
    '# AI Provider Candidates',
    '',
    '- この一覧は候補整理用です',
    '- このアプリはAI APIを呼びません',
    '- API key / token / secret は保存しません',
  ];

  candidates.forEach((candidate) => {
    lines.push('', `## ${candidate.label}`, `- id: ${candidate.id}`, `- status: ${candidate.status}`);
    lines.push(`- requiresApiKey: ${candidate.requiresApiKey ? 'yes' : 'no'}`);
    lines.push(`- secretPolicy: ${candidate.secretPolicy}`);
    lines.push('- bestFor:');
    candidate.bestFor.forEach((item) => lines.push(`  - ${item}`));
    lines.push('- weakFor:');
    candidate.weakFor.forEach((item) => lines.push(`  - ${item}`));
    lines.push(`- notes: ${candidate.notes}`);
  });

  return lines.join('\n');
}
