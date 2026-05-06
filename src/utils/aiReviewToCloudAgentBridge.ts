import type { AiReviewTriageItem } from './aiReviewResultTriage';

export type AiReviewToCloudAgentBridge = {
  title: string;
  status: 'blocked' | 'ready-to-copy' | 'needs-review';
  instructionTitle: string;
  instructionBody: string;
  targetFiles: string[];
  doNotTouch: string[];
  doneConditions: string[];
  riskNotes: string[];
};

export function buildAiReviewToCloudAgentBridge(params: {
  sessionTitle: string;
  triageItems: AiReviewTriageItem[];
  targetFiles: string[];
  targetRepo: string;
  phaseLabel: string;
}): AiReviewToCloudAgentBridge {
  const { sessionTitle, triageItems, targetFiles, targetRepo, phaseLabel } = params;

  const actionItems = triageItems.filter(
    (i) => i.action === 'issue' || i.action === 'manual-fix'
  );
  const riskItems = triageItems.filter(
    (i) => i.category === 'blocker' || i.category === 'code-risk' || i.category === 'store-risk'
  );

  const blockers = riskItems.filter((i) => i.priority === 'high');
  const status: AiReviewToCloudAgentBridge['status'] =
    blockers.length > 0
      ? 'blocked'
      : actionItems.length === 0
      ? 'needs-review'
      : 'ready-to-copy';

  const instructionLines = [
    `# Cloud Agent 指示書: ${sessionTitle} → 修正`,
    `Phase: ${phaseLabel}`,
    `repo: ${targetRepo}`,
    '',
    `## AIレビュー結果に基づく修正`,
    ...actionItems.map((i) => `- [${i.category}][${i.priority}] ${i.text}`),
    '',
    `## 対象ファイル`,
    ...(targetFiles.length > 0 ? targetFiles.map((f) => `- ${f}`) : ['(未指定)']),
    '',
    `## 安全ルール`,
    '- GitHub APIを実行しない',
    '- secretを保存しない',
    '- 本番deployをしない',
    '- AI APIを呼ばない',
  ];

  return {
    title: `AI Review → Cloud Agent: ${sessionTitle}`,
    status,
    instructionTitle: `[${phaseLabel}] AIレビュー修正: ${sessionTitle}`,
    instructionBody: instructionLines.join('\n'),
    targetFiles,
    doNotTouch: ['secret / token / API key', '本番deploy処理'],
    doneConditions: [
      'typecheck 通過',
      'build 通過',
      'AIレビュー指摘が修正されている',
    ],
    riskNotes: riskItems.map((i) => `${i.category}: ${i.text}`),
  };
}

export function formatAiReviewToCloudAgentBridgeMarkdown(
  bridge: AiReviewToCloudAgentBridge
): string {
  return bridge.instructionBody;
}
