export type SafetyCategory = 'always-stop' | 'always-allow' | 'ask-human';

export type SafetyRule = {
  id: string;
  label: string;
  example: string;
  category: SafetyCategory;
};

export const SAFETY_RULES: SafetyRule[] = [
  // Always stop
  { id: 'billing', label: '課金・支払い処理', example: 'Apple Pay, Stripe決済', category: 'always-stop' },
  { id: 'appstore-submit', label: 'App Store / Play Store 提出', example: '審査申請ボタン', category: 'always-stop' },
  { id: 'production-deploy', label: '本番デプロイ実行', example: 'npm run deploy --production', category: 'always-stop' },
  { id: 'secret-write', label: 'Secret / Token の書き込み・変更', example: 'wrangler secret put', category: 'always-stop' },
  { id: 'main-force-push', label: 'mainブランチへの強制プッシュ', example: 'git push --force origin main', category: 'always-stop' },
  { id: 'large-refactor', label: '大規模リファクタ（100ファイル超）', example: '全コンポーネントのリネーム', category: 'always-stop' },
  { id: 'db-production', label: '本番DBの直接変更', example: 'DROP TABLE, 本番migration実行', category: 'always-stop' },
  { id: 'legal-privacy', label: '法律・規約・プライバシー判断', example: 'プライバシーポリシーの最終確認', category: 'always-stop' },
  // Ask human
  { id: 'merge-pr', label: 'PRのマージ実行', example: 'gh pr merge', category: 'ask-human' },
  { id: 'external-api', label: '外部APIの本番呼び出し', example: 'Stripe API, Twilio SMS', category: 'ask-human' },
  { id: 'repo-settings', label: 'リポジトリ設定の変更', example: 'Branch protection rules', category: 'ask-human' },
  // Always allow
  { id: 'readme', label: 'README / docs 更新', example: 'README.md, docs/*.md', category: 'always-allow' },
  { id: 'ui-text', label: 'UI文言の改善', example: 'ボタンラベル, エラーメッセージ', category: 'always-allow' },
  { id: 'component-add', label: '小さなコンポーネント追加', example: '新しいパネル, カード', category: 'always-allow' },
  { id: 'test-add', label: 'テスト追加', example: '単体テスト, E2Eテスト', category: 'always-allow' },
  { id: 'css-fix', label: 'CSSスタイル修正', example: '余白, 色, フォント調整', category: 'always-allow' },
  { id: 'pr-create', label: '安全なPR作成（featureブランチ）', example: 'git push origin feature/xxx', category: 'always-allow' },
  { id: 'ci-check', label: 'CI確認・typecheck・build', example: 'npm run typecheck', category: 'always-allow' },
  { id: 'issue-draft', label: 'Issue下書き・コピー', example: 'Issue本文のクリップボードコピー', category: 'always-allow' },
];

export type SafetyGateCheck = {
  action: string;
  matchedRule: SafetyRule | null;
  decision: 'stop' | 'ask' | 'allow' | 'unknown';
  message: string;
};

export function checkActionSafety(action: string): SafetyGateCheck {
  const lower = action.toLowerCase();
  const matched = SAFETY_RULES.find((r) =>
    lower.includes(r.id) ||
    r.label.toLowerCase().split(/[\s・\/]+/).some((w) => w.length > 2 && lower.includes(w)),
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
