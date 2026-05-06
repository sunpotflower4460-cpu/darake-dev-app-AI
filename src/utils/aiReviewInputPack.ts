export type AiReviewTarget =
  | 'screenshot-ui'
  | 'pull-request'
  | 'store-copy'
  | 'submission-risk'
  | 'release-note'
  | 'rejection-response';

export type AiReviewInputPack = {
  title: string;
  target: AiReviewTarget;
  status: 'blocked' | 'ready-to-copy' | 'needs-review';
  context: string;
  reviewQuestions: string[];
  hardStops: string[];
  expectedOutputFormat: string;
  markdown: string;
};

const REVIEW_CONFIGS: Record<
  AiReviewTarget,
  Pick<AiReviewInputPack, 'title' | 'reviewQuestions' | 'hardStops' | 'expectedOutputFormat'>
> = {
  'screenshot-ui': {
    title: 'スクリーンショット UI レビュー',
    reviewQuestions: [
      '画面が真っ白になっていないか？',
      'ローディングが停止していないか？',
      'スマホ幅でレイアウトが破綻していないか？',
      '主要なCTAボタンが見えているか？',
      '文字が読めるか？',
      '余白が詰まりすぎていないか？',
      '変な横スクロールが出ていないか？',
      'プライベート情報が写っていないか？',
      'App Storeのスクショとして使えそうか？',
    ],
    hardStops: ['プライベート情報が写っている場合は使用不可'],
    expectedOutputFormat:
      '各質問に対して OK / NG / 要確認 で回答。NGの場合は理由と修正提案を記載。',
  },
  'pull-request': {
    title: 'Pull Request サマリー レビュー',
    reviewQuestions: [
      'どんな変更が含まれているか？',
      'セキュリティリスクはないか？',
      '外部API呼び出しや secret の漏れはないか？',
      'テストは適切か？',
      'ブレイキングチェンジはないか？',
      'レビューが必要な危険領域（DB/auth/billing/deploy）の変更はないか？',
    ],
    hardStops: ['secret・token が含まれる場合はマージ不可', 'DB/auth 変更は要レビュー'],
    expectedOutputFormat:
      '変更サマリー、リスク評価（低/中/高）、手動確認が必要な点のリスト。',
  },
  'store-copy': {
    title: 'ストア文面 レビュー',
    reviewQuestions: [
      'アプリの価値が30秒以内に伝わるか？',
      '競合と差別化できているか？',
      'キーワードが自然に含まれているか？',
      'App Store ガイドライン違反の表現はないか？',
      '誤解を招く表現はないか？',
      '日本語として自然か？',
    ],
    hardStops: [
      'App Store ガイドライン違反の表現がある場合は使用不可',
      '保証・断言表現（「必ず」「絶対に」など）は要注意',
    ],
    expectedOutputFormat:
      '改善提案を箇条書きで。OK箇所とNG箇所を明確に分けること。',
  },
  'submission-risk': {
    title: 'App Store 審査リスク レビュー',
    reviewQuestions: [
      '審査拒否リスクの高い機能はあるか？',
      'プライバシーポリシーは適切か？',
      '年齢レーティングは正しいか？',
      'コンテンツが App Store ガイドラインに準拠しているか？',
      'TestFlight テストは十分か？',
      '必須の権限説明（NSUsageDescription）は揃っているか？',
    ],
    hardStops: [
      'ガイドライン違反の機能がある場合は提出不可',
      'プライバシーポリシーがない場合は提出不可',
    ],
    expectedOutputFormat:
      'リスクレベル（高/中/低）、具体的な懸念点、対応策の提案。',
  },
  'release-note': {
    title: 'リリースノート レビュー',
    reviewQuestions: [
      'ユーザーに伝わる言葉で書かれているか？',
      'バグ修正・新機能・改善が区別されているか？',
      '技術的すぎる表現を避けているか？',
      '文字数は適切か（App Store は 4000文字以内）？',
      '日本語として自然か？',
    ],
    hardStops: [],
    expectedOutputFormat:
      '改善提案と修正例を提示。OK/NG を明確に。',
  },
  'rejection-response': {
    title: '審査拒否 対応文 レビュー',
    reviewQuestions: [
      '拒否理由を正確に理解した返答になっているか？',
      '修正内容を具体的に説明しているか？',
      '丁寧で専門的な文体か？',
      '追加の問題を指摘されそうな内容はないか？',
      '英語の場合、文法・表現は適切か？',
    ],
    hardStops: ['拒否理由への回答が的外れの場合は送信前に見直し必要'],
    expectedOutputFormat:
      '改善提案と修正案を提示。審査通過の可能性に対する評価も含めること。',
  },
};

export function buildAiReviewInputPack(
  target: AiReviewTarget,
  context: string,
): AiReviewInputPack {
  const config = REVIEW_CONFIGS[target];
  const markdown = buildAiReviewMarkdown(target, context, config);
  return {
    ...config,
    target,
    status: 'ready-to-copy',
    context,
    markdown,
  };
}

function buildAiReviewMarkdown(
  target: AiReviewTarget,
  context: string,
  config: Pick<AiReviewInputPack, 'title' | 'reviewQuestions' | 'hardStops' | 'expectedOutputFormat'>,
): string {
  return [
    `# AIレビュー依頼: ${config.title}`,
    '',
    '## コンテキスト',
    context || '（コンテキストを入力してください）',
    '',
    '## レビュー観点',
    ...config.reviewQuestions.map((q, i) => `${i + 1}. ${q}`),
    '',
    ...(config.hardStops.length > 0
      ? ['## ハードストップ（これがある場合は即中断）', ...config.hardStops.map((s) => `- ⛔ ${s}`), '']
      : []),
    '## 期待する出力形式',
    config.expectedOutputFormat,
    '',
    '## 安全方針',
    '- このプロンプトはコピーして外部AIに手動で渡してください',
    '- AIへの自動送信はしません',
    '- secret / token / 個人情報を含めないでください',
  ].join('\n');
}

const STORAGE_KEY = 'darake.aiReviewInputPacks.v1';

export type SavedAiReviewInputPack = AiReviewInputPack & { id: string; savedAt: string };

export function loadSavedAiReviewInputPacks(): SavedAiReviewInputPack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedAiReviewInputPack[];
  } catch {
    return [];
  }
}

export function saveSavedAiReviewInputPacks(packs: SavedAiReviewInputPack[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  } catch {
    // ignore
  }
}
