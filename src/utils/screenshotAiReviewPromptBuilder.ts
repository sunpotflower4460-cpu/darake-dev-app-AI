export type ScreenshotAiReviewPrompt = {
  title: string;
  checkpoints: string[];
  promptText: string;
  warnings: string[];
};

const REVIEW_CHECKPOINTS = [
  '真っ白画面ではない（コンテンツが表示されている）',
  'ローディングが停止していない（スピナー固まりなし）',
  'スマホ幅（375px程度）でレイアウトが破綻していない',
  '主要なCTAボタンが画面内に見える',
  '文字が十分に読める（コントラスト・サイズ）',
  '余白が詰まりすぎていない（窮屈でない）',
  '変な横スクロールが発生していない',
  'プライベート情報・個人情報が写っていない',
  'App Storeのスクリーンショットとして使えそうか',
  'UI要素が重なっていない',
  'フォントが崩れていない',
];

export function buildScreenshotAiReviewPrompt(screenshotDescription: string): ScreenshotAiReviewPrompt {
  const promptText = [
    '# スクリーンショット UIレビュー依頼',
    '',
    '以下のスクリーンショットをレビューしてください。',
    '',
    '## スクリーンショットの概要',
    screenshotDescription || '（スクリーンショットを添付してください）',
    '',
    '## チェックポイント',
    ...REVIEW_CHECKPOINTS.map((c, i) => `${i + 1}. ${c}`),
    '',
    '## 回答形式',
    '各チェックポイントに対して:',
    '- ✅ OK: 問題なし',
    '- ⚠️ 要確認: 軽微な問題がある',
    '- ❌ NG: 修正が必要',
    '',
    'NGの場合は理由と修正提案を記載してください。',
    '',
    '## 総合評価',
    'App Store スクリーンショットとして使用可能か？',
    '- 使用可能 / 修正後使用可能 / 使用不可',
    '',
    '## 安全上の注意',
    '- プライベート情報が写っている場合は即座に指摘してください',
    '- このプロンプトはコピーして外部AIに手動で渡してください',
    '- AIへの自動送信・画像の自動送信はしません',
  ].join('\n');

  return {
    title: 'スクリーンショット AIレビュー プロンプト',
    checkpoints: REVIEW_CHECKPOINTS,
    promptText,
    warnings: [
      'プライベート情報が写っている場合は使用不可',
      'このプロンプトをコピーして外部AIに手動で渡してください',
      '画像の自動送信はしません',
      'AIへの自動API呼び出しはしません',
    ],
  };
}

export function formatScreenshotAiReviewPromptMarkdown(prompt: ScreenshotAiReviewPrompt): string {
  return prompt.promptText;
}
