export type SafetyCategory = 'always-stop' | 'always-allow' | 'ask-human';
export type SafetyDecision = 'stop' | 'ask' | 'allow' | 'unknown';

export type SafetyRule = {
  id: string;
  label: string;
  example: string;
  category: SafetyCategory;
  keywords: string[];
};

export const SAFETY_RULES: SafetyRule[] = [
  // Always stop
  {
    id: 'billing', label: '課金・支払い処理', example: 'Apple Pay, Stripe決済', category: 'always-stop',
    keywords: ['課金', '支払い', 'billing', 'stripe', 'apple pay', '決済', '購入', 'payment'],
  },
  {
    id: 'appstore-submit', label: 'App Store / Play Store 提出', example: '審査申請ボタン', category: 'always-stop',
    keywords: ['app store', 'play store', '審査', '申請', 'submit', '提出', 'appstore', 'testflight'],
  },
  {
    id: 'production-deploy', label: '本番デプロイ実行', example: 'npm run deploy --production', category: 'always-stop',
    keywords: ['本番デプロイ', '本番公開', 'production', 'deploy --production', '本番リリース', 'release to prod'],
  },
  {
    id: 'secret-write', label: 'Secret / Token の書き込み・変更', example: 'wrangler secret put', category: 'always-stop',
    keywords: ['secret', 'token', 'wrangler secret', 'api key', 'apikey', 'apiキー', '秘密鍵', 'credential'],
  },
  {
    id: 'main-force-push', label: 'mainブランチへの強制プッシュ', example: 'git push --force origin main', category: 'always-stop',
    keywords: ['force push', '--force', 'mainに強制', 'mainへの強制', 'force origin main', 'mainに直接push', 'mainに直接プッシュ', 'direct push to main', 'push origin main'],
  },
  {
    id: 'large-refactor', label: '大規模リファクタ（100ファイル超）', example: '全コンポーネントのリネーム', category: 'always-stop',
    keywords: ['大規模リファクタ', '全ファイル', '一括リネーム', '大規模変更', 'large refactor'],
  },
  {
    id: 'db-production', label: '本番DBの直接変更', example: 'DROP TABLE, 本番migration実行', category: 'always-stop',
    keywords: ['本番db', '本番データベース', 'drop table', 'truncate', '本番migration', 'production db'],
  },
  {
    id: 'legal-privacy', label: '法律・規約・プライバシー判断', example: 'プライバシーポリシーの最終確認', category: 'always-stop',
    keywords: ['法律', '規約', 'プライバシー', 'privacy policy', '利用規約', 'terms of service', 'legal'],
  },
  // Ask human
  {
    id: 'merge-pr', label: 'PRのマージ実行', example: 'gh pr merge', category: 'ask-human',
    keywords: ['マージ', 'merge', 'pr merge', 'prをマージ', 'pull requestをマージ', 'マージする', 'gh pr merge'],
  },
  {
    id: 'external-api', label: '外部APIの本番呼び出し', example: 'Stripe API, Twilio SMS', category: 'ask-human',
    keywords: ['外部api', 'external api', 'twilio', 'sendgrid', '本番api', 'api呼び出し', '外部サービス'],
  },
  {
    id: 'repo-settings', label: 'リポジトリ設定の変更', example: 'Branch protection rules', category: 'ask-human',
    keywords: ['リポジトリ設定', 'branch protection', 'repo settings', 'repository settings', '保護ルール'],
  },
  // Always allow
  {
    id: 'readme', label: 'README / docs 更新', example: 'README.md, docs/*.md', category: 'always-allow',
    keywords: ['readme', 'docs', 'ドキュメント', '説明文', 'markdown'],
  },
  {
    id: 'ui-text', label: 'UI文言の改善', example: 'ボタンラベル, エラーメッセージ', category: 'always-allow',
    keywords: ['ui文言', 'ボタンラベル', 'ボタン文言', 'エラーメッセージ', 'テキスト変更', 'label', 'ui text'],
  },
  {
    id: 'component-add', label: '小さなコンポーネント追加', example: '新しいパネル, カード', category: 'always-allow',
    keywords: ['コンポーネント追加', 'パネル追加', 'カード追加', 'component', 'add panel', '新しいパネル'],
  },
  {
    id: 'test-add', label: 'テスト追加', example: '単体テスト, E2Eテスト', category: 'always-allow',
    keywords: ['テスト追加', 'test追加', 'e2e', '単体テスト', 'unit test', 'add test'],
  },
  {
    id: 'css-fix', label: 'CSSスタイル修正', example: '余白, 色, フォント調整', category: 'always-allow',
    keywords: ['css', 'スタイル修正', '余白', 'margin', 'padding', 'フォント', 'color'],
  },
  {
    id: 'pr-create', label: '安全なPR作成（featureブランチ）', example: 'git push origin feature/xxx', category: 'always-allow',
    keywords: ['pr作成', 'pull request作成', 'feature branch', 'プッシュ', 'git push', 'pr を作'],
  },
  {
    id: 'ci-check', label: 'CI確認・typecheck・build', example: 'npm run typecheck', category: 'always-allow',
    keywords: ['ci確認', 'typecheck', 'build確認', 'npm run', 'ビルド確認', 'ci check'],
  },
  {
    id: 'issue-draft', label: 'Issue下書き・コピー', example: 'Issue本文のクリップボードコピー', category: 'always-allow',
    keywords: ['issue下書き', 'issue作成', 'コピー', 'issue draft', 'クリップボード'],
  },
];

export type SafetyGateCheck = {
  action: string;
  matchedRule: SafetyRule | null;
  decision: SafetyDecision;
  message: string;
};

export type SafetyGateTestCase = {
  input: string;
  expected: SafetyDecision | SafetyDecision[];
};

export type SafetyGateTestResult = SafetyGateTestCase & {
  actual: SafetyDecision;
  passed: boolean;
};

export function checkActionSafety(action: string): SafetyGateCheck {
  const lower = action.toLowerCase();
  const matched = SAFETY_RULES.find((r) =>
    r.keywords.some((kw) => lower.includes(kw.toLowerCase())),
  );

  if (!matched) {
    return {
      action,
      matchedRule: null,
      decision: 'unknown',
      message: '該当ルールが見つかりませんでした。判断が難しい場合は確認してください。',
    };
  }

  const decision: SafetyGateCheck['decision'] =
    matched.category === 'always-stop'
      ? 'stop'
      : matched.category === 'ask-human'
        ? 'ask'
        : 'allow';

  const messages: Record<SafetyGateCheck['decision'], string> = {
    stop: '必ず止まります。人間が確認してください。',
    ask: '人間に確認してから進めてください。',
    allow: '安全に進められます。',
    unknown: '不明です。',
  };

  return { action, matchedRule: matched, decision, message: messages[decision] };
}

export const SAFETY_GATE_V2_TEST_CASES: SafetyGateTestCase[] = [
  { input: 'mainに直接pushして', expected: ['stop', 'ask'] },
  { input: '本番に上げて', expected: ['stop', 'ask'] },
  { input: 'App Storeに提出して', expected: ['stop', 'ask'] },
  { input: 'APIキーを書いて', expected: ['stop', 'ask'] },
  { input: 'wrangler secret putを実行して', expected: ['stop', 'ask'] },
  { input: 'Stripeの本番決済を有効にして', expected: ['stop', 'ask'] },
  { input: 'READMEを直して', expected: 'allow' },
  { input: 'ボタン文言を直して', expected: 'allow' },
  { input: 'テストを追加して', expected: 'allow' },
];

export function runSafetyGateV2TestCases(): SafetyGateTestResult[] {
  return SAFETY_GATE_V2_TEST_CASES.map((testCase) => {
    const actual = checkActionSafety(testCase.input).decision;
    const expected = Array.isArray(testCase.expected) ? testCase.expected : [testCase.expected];
    return {
      ...testCase,
      actual,
      passed: expected.includes(actual),
    };
  });
}
