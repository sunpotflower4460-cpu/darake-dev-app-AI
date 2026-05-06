import type { AppReviewRejectionClassification } from './appReviewRejectionClassifier';

export type RejectionFixIssueDraft = {
  title: string;
  body: string;
  cloudAgentInstruction: string;
  manualGate: string;
  doneConditions: string[];
};

export function buildRejectionFixIssueDraft(
  guidelineNumber: string,
  affectedFeature: string,
  classification: AppReviewRejectionClassification,
  appleMessage: string,
): RejectionFixIssueDraft {
  const title = `[App Review対応] ${guidelineNumber ? `Guideline ${guidelineNumber}: ` : ''}${classification.category}`;

  const body = [
    '## リジェクト内容',
    '',
    `- ガイドライン番号: ${guidelineNumber || '不明'}`,
    `- 対象機能: ${affectedFeature || '不明'}`,
    `- 推定カテゴリ: ${classification.category}`,
    `- 推定severity: ${classification.severity}`,
    `- 修正タイプ: ${classification.likelyFixType}`,
    '',
    '## Appleのメッセージ（抜粋）',
    '',
    appleMessage || '（未入力）',
    '',
    '## 推奨される対応',
    '',
    ...classification.suggestedActions.map((a) => `- ${a}`),
    '',
    '## 完了条件',
    '',
    '- [ ] 上記対応を実施した',
    '- [ ] 修正PRがmergeされた',
    '- [ ] 再ビルドした',
    '- [ ] TestFlightで確認した',
    '- [ ] 再提出チェックリストを完了した',
    '',
    '## Safety Note',
    '- App Store ConnectへのSubmitは人間が行います',
    '- Appleへの返信は人間が行います',
  ].join('\n');

  const cloudAgentInstruction = [
    `上記のリジェクト対応を実施してください。`,
    `修正タイプ: ${classification.likelyFixType}`,
    `対象: ${affectedFeature || '不明'}`,
    classification.manualGateRequired
      ? `⚠️ manual gate必須: 修正前に人間が内容を確認してください。`
      : `修正後にPRを作成してください。`,
  ].join('\n');

  const manualGate = classification.manualGateRequired
    ? '⚠️ このIssueはseverity highです。修正内容を人間が確認してからmergeしてください。'
    : '修正PRを作成後、人間がCodeRabbitレビューを確認してmergeしてください。';

  const doneConditions = [
    'リジェクト内容に対応した修正が完了している',
    '修正PRがmergeされている',
    '再ビルドが完了している',
    'TestFlightで確認されている',
    '再提出チェックリストが完了している',
    'App Store ConnectでSubmit for Reviewを人間が行う準備ができている',
  ];

  return { title, body, cloudAgentInstruction, manualGate, doneConditions };
}
