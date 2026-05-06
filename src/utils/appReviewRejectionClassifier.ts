export type RejectionCategory =
  | 'metadata-issue'
  | 'privacy-issue'
  | 'login-test-account-issue'
  | 'crash-build-issue'
  | 'payment-iap-issue'
  | 'misleading-claim'
  | 'user-generated-content-issue'
  | 'ai-content-policy-issue'
  | 'screenshot-asset-issue'
  | 'unknown';

export type AppReviewRejectionClassification = {
  category: RejectionCategory;
  severity: 'low' | 'medium' | 'high';
  likelyFixType: 'metadata' | 'code' | 'asset' | 'privacy' | 'review-note' | 'unknown';
  suggestedActions: string[];
  manualGateRequired: boolean;
};

const KEYWORD_RULES: Array<{
  keywords: string[];
  category: RejectionCategory;
  severity: AppReviewRejectionClassification['severity'];
  likelyFixType: AppReviewRejectionClassification['likelyFixType'];
  suggestedActions: string[];
}> = [
  {
    keywords: ['metadata', 'description', 'subtitle', 'keyword', 'title'],
    category: 'metadata-issue',
    severity: 'low',
    likelyFixType: 'metadata',
    suggestedActions: [
      'メタデータを修正してApp Store Connectで更新する',
      '説明文・タイトルに誤解を招く表現がないか確認する',
    ],
  },
  {
    keywords: ['privacy', 'プライバシー', 'data', 'tracking', 'location'],
    category: 'privacy-issue',
    severity: 'high',
    likelyFixType: 'privacy',
    suggestedActions: [
      'プライバシーポリシーを確認・更新する',
      'App Store Connectのプライバシー設定を更新する',
      '収集データの種類を正確に申告する',
    ],
  },
  {
    keywords: ['login', 'account', 'test account', 'demo', 'sign in', 'ログイン', 'アカウント'],
    category: 'login-test-account-issue',
    severity: 'medium',
    likelyFixType: 'review-note',
    suggestedActions: [
      'テストアカウント情報を審査メモに追記する',
      'ログイン不要で主要機能が確認できる手順を審査メモに記載する',
    ],
  },
  {
    keywords: ['crash', 'bug', 'error', 'exception', 'クラッシュ', 'バグ'],
    category: 'crash-build-issue',
    severity: 'high',
    likelyFixType: 'code',
    suggestedActions: [
      'クラッシュログを確認して原因を修正する',
      '修正後に再ビルドしてTestFlightで確認する',
    ],
  },
  {
    keywords: ['iap', 'purchase', 'payment', 'subscription', 'billing', '課金', '購入'],
    category: 'payment-iap-issue',
    severity: 'high',
    likelyFixType: 'code',
    suggestedActions: [
      'IAP設定をApp Store Connectで確認する',
      'Sandboxテストで課金フローを再確認する',
    ],
  },
  {
    keywords: ['mislead', 'false', 'inaccurate', '誤解', '虚偽'],
    category: 'misleading-claim',
    severity: 'medium',
    likelyFixType: 'metadata',
    suggestedActions: [
      '誤解を招く表現を説明文から削除する',
      'スクショがアプリの実際の機能を正確に表しているか確認する',
    ],
  },
  {
    keywords: ['user generated', 'ugc', 'content', 'moderation', 'ユーザー投稿'],
    category: 'user-generated-content-issue',
    severity: 'medium',
    likelyFixType: 'code',
    suggestedActions: [
      'コンテンツモデレーション方針を審査メモに追記する',
      '不適切なコンテンツの報告機能を追加する',
    ],
  },
  {
    keywords: ['ai', 'generated', 'chatgpt', 'openai', 'llm', 'AI生成'],
    category: 'ai-content-policy-issue',
    severity: 'medium',
    likelyFixType: 'metadata',
    suggestedActions: [
      'AI生成コンテンツポリシーを明記する',
      '誤情報に関する免責事項を追加する',
    ],
  },
  {
    keywords: ['screenshot', 'image', 'asset', 'スクショ', '画像'],
    category: 'screenshot-asset-issue',
    severity: 'low',
    likelyFixType: 'asset',
    suggestedActions: [
      'スクショを差し替えてApp Store Connectにアップロードする',
      'スクショがアプリの実際の機能を示しているか確認する',
    ],
  },
];

export function classifyRejection(appleMessage: string, guidelineNumber: string): AppReviewRejectionClassification {
  const combinedText = `${appleMessage} ${guidelineNumber}`.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => combinedText.includes(kw.toLowerCase()))) {
      return {
        category: rule.category,
        severity: rule.severity,
        likelyFixType: rule.likelyFixType,
        suggestedActions: rule.suggestedActions,
        manualGateRequired: rule.severity === 'high',
      };
    }
  }

  return {
    category: 'unknown',
    severity: 'medium',
    likelyFixType: 'unknown',
    suggestedActions: [
      'Appleのリジェクトメッセージを詳しく確認する',
      '該当するガイドラインを確認する（https://developer.apple.com/app-store/review/guidelines/）',
      '必要に応じてAppleに質問・返信する',
    ],
    manualGateRequired: true,
  };
}

export const REJECTION_CATEGORY_LABELS: Record<RejectionCategory, string> = {
  'metadata-issue': 'メタデータの問題',
  'privacy-issue': 'プライバシーの問題',
  'login-test-account-issue': 'ログイン / テストアカウントの問題',
  'crash-build-issue': 'クラッシュ / ビルドの問題',
  'payment-iap-issue': '課金 / IAPの問題',
  'misleading-claim': '誤解を招く表現',
  'user-generated-content-issue': 'ユーザー生成コンテンツの問題',
  'ai-content-policy-issue': 'AI / コンテンツポリシーの問題',
  'screenshot-asset-issue': 'スクショ / アセットの問題',
  unknown: '不明',
};
