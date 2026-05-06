import { AiReviewTarget } from './aiReviewInputPack';
import { AiReviewResultStatus } from './aiReviewResultRecord';

export type AiReviewFixIssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AiReviewFixIssueDraft = {
  id: string;
  sourceReviewId: string;
  target: AiReviewTarget;
  issueTitle: string;
  issueBody: string;
  severity: AiReviewFixIssueSeverity;
  suggestedPhase: string;
  cloudAgentInstruction: string;
  doneConditions: string[];
  createdAt: string;
};

const STORAGE_KEY = 'darake.aiReviewFixIssueDrafts.v1';

export function buildAiReviewFixIssueDraft(params: {
  sourceReviewId: string;
  target: AiReviewTarget;
  summary: string;
  blockers: string[];
  suggestions: string[];
  status: AiReviewResultStatus;
}): AiReviewFixIssueDraft {
  const severity: AiReviewFixIssueSeverity =
    params.status === 'failed' && params.blockers.length > 0
      ? 'critical'
      : params.status === 'failed'
        ? 'high'
        : params.status === 'warn'
          ? 'medium'
          : 'low';

  const issueBody = [
    `## AIレビュー修正Issue`,
    ``,
    `### 対象`,
    `- target: ${params.target}`,
    `- severity: ${severity}`,
    ``,
    `### レビューサマリー`,
    params.summary || '（サマリーなし）',
    ``,
    `### Blockers`,
    params.blockers.length > 0 ? params.blockers.map((b) => `- 🔴 ${b}`).join('\n') : '- なし',
    ``,
    `### Suggestions`,
    params.suggestions.length > 0 ? params.suggestions.map((s) => `- 💡 ${s}`).join('\n') : '- なし',
    ``,
    `### 安全方針`,
    `- 外部APIは呼びません`,
    `- secretは保存しません`,
    `- 修正完了後は再度AIレビューを実施してください`,
  ].join('\n');

  const cloudAgentInstruction = [
    `# Cloud Agent 修正指示`,
    ``,
    `以下のAIレビュー結果を修正してください。`,
    ``,
    `## 対象`,
    `- target: ${params.target}`,
    `- severity: ${severity}`,
    ``,
    `## 修正が必要な点`,
    params.blockers.length > 0 ? params.blockers.map((b) => `- ${b}`).join('\n') : '（なし）',
    ``,
    `## 改善提案`,
    params.suggestions.length > 0 ? params.suggestions.map((s) => `- ${s}`).join('\n') : '（なし）',
    ``,
    `## 制約`,
    `- 外部APIを呼ばないこと`,
    `- secretを保存しないこと`,
    `- 既存機能を壊さないこと`,
    `- スマホ幅で確認すること`,
  ].join('\n');

  const doneConditions = [
    'AIレビューを再実行して passed になること',
    'typecheck が通ること',
    'build が通ること',
    ...(params.target === 'screenshot-ui' ? ['スクリーンショットが正常に表示されること'] : []),
    ...(params.target === 'pull-request' ? ['PR の全チェックが通ること'] : []),
    ...(params.target === 'store-copy' ? ['ストア文面が App Store ガイドライン準拠であること'] : []),
  ];

  return {
    id: `fix-issue-${Date.now()}`,
    sourceReviewId: params.sourceReviewId,
    target: params.target,
    issueTitle: `[AIレビュー修正][${severity}] ${params.target} の問題を修正する`,
    issueBody,
    severity,
    suggestedPhase: 'Phase XX（現在のフェーズ）',
    cloudAgentInstruction,
    doneConditions,
    createdAt: new Date().toISOString(),
  };
}

export function loadAiReviewFixIssueDrafts(): AiReviewFixIssueDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AiReviewFixIssueDraft[];
  } catch {
    return [];
  }
}

export function saveAiReviewFixIssueDrafts(drafts: AiReviewFixIssueDraft[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // ignore
  }
}

export function formatAiReviewFixIssueDraftMarkdown(draft: AiReviewFixIssueDraft): string {
  return [
    `# ${draft.issueTitle}`,
    '',
    draft.issueBody,
    '',
    '## 完了条件',
    ...draft.doneConditions.map((c) => `- [ ] ${c}`),
  ].join('\n');
}
