// Friction Cut Visibility Policy
// Determines what to show/hide based on safety and friction audit results.
// This is UI display control only — no external API calls.

export type FrictionCutVisibilityRule = {
  id: string;
  label: string;
  defaultVisible: boolean;
  reason: string;
  neverHide: boolean;
};

export type FrictionCutVisibilityPolicy = {
  rules: FrictionCutVisibilityRule[];
  alwaysShow: string[];
  alwaysHide: string[];
  neverHide: string[];
};

export function getFrictionCutVisibilityPolicy(): FrictionCutVisibilityPolicy {
  const rules: FrictionCutVisibilityRule[] = [
    // Always hide by default (safe / draft / report)
    { id: 'success-report', label: '成功済みreport全文', defaultVisible: false, reason: 'safe — コピーボタンだけ表示', neverHide: false },
    { id: 'copy-only', label: 'コピー専用コンテンツ全文', defaultVisible: false, reason: 'コピーボタンだけ前面に出す', neverHide: false },
    { id: 'safe-draft', label: 'safe draftの全文', defaultVisible: false, reason: 'コピー時だけ展開', neverHide: false },
    { id: 'dry-run-detail', label: 'dry-run詳細ログ', defaultVisible: false, reason: 'passなら見なくていい', neverHide: false },
    { id: 'prompt-full-text', label: 'Cloud Agentプロンプト全文', defaultVisible: false, reason: 'コピーボタンで十分', neverHide: false },
    { id: 'issue-body', label: 'Issue本文全文', defaultVisible: false, reason: 'コピー時だけ展開', neverHide: false },
    { id: 'pr-body', label: 'PR本文全文', defaultVisible: false, reason: 'コピー時だけ展開', neverHide: false },
    { id: 'notification-payload', label: 'notification payload', defaultVisible: false, reason: 'dry-runで確認、通常非表示', neverHide: false },
    { id: 'localstorage-keys', label: 'localStorageキー一覧', defaultVisible: false, reason: 'Settings内のみ / デフォルト折りたたみ', neverHide: false },
    { id: 'optional-warning', label: 'optionalな警告', defaultVisible: false, reason: 'Morning Reportにまとめる', neverHide: false },
    { id: 'repeated-later', label: '繰り返しLaterになった項目', defaultVisible: false, reason: 'Summary表示のみ', neverHide: false },
    { id: 'repeated-ignored', label: '繰り返し無視された項目', defaultVisible: false, reason: 'Summary表示のみ', neverHide: false },

    // Always show (safety-critical)
    { id: 'blocked', label: 'ブロック状態', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'urgent', label: 'urgent確認', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'manual-gate', label: '手動ゲート', defaultVisible: true, reason: 'Review InboxかFinal Formに表示', neverHide: true },
    { id: 'secret-required', label: 'secret未設定警告', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'production-risk', label: 'production risk警告', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'app-store-submit', label: 'App Store Submit操作', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'billing', label: '課金・billing', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'auth', label: '認証・auth', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'db-change', label: 'DB変更', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'failed-ci-build', label: 'CI / build失敗', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
    { id: 'private-info-warning', label: 'プライベート情報警告', defaultVisible: true, reason: '安全上必ず表示', neverHide: true },
  ];

  const alwaysShow = rules.filter((r) => r.defaultVisible).map((r) => r.id);
  const alwaysHide = rules.filter((r) => !r.defaultVisible && !r.neverHide).map((r) => r.id);
  const neverHide = rules.filter((r) => r.neverHide).map((r) => r.id);

  return { rules, alwaysShow, alwaysHide, neverHide };
}

export function shouldShowByPolicy(itemId: string): boolean {
  const policy = getFrictionCutVisibilityPolicy();
  const rule = policy.rules.find((r) => r.id === itemId);
  if (!rule) return true; // unknown items visible by default
  return rule.defaultVisible;
}
