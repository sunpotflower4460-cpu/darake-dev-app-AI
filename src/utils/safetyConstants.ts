// Shared safety constants used across Friction Cut and Rehearsal modules.
// These items must NEVER be auto-hidden or cut from the UI.

export const SAFETY_CRITICAL_KEYWORDS: string[] = [
  'secret',
  'production',
  'billing',
  'auth',
  'DB',
  'blocked',
  'CI失敗',
  'リジェクト',
];

export const DO_NOT_CUT_LABELS: string[] = [
  'blocked状態',
  'secret未設定の警告',
  'production risk警告',
  'App Store Submit操作',
  '課金・billing',
  '認証・auth',
  'DB変更',
  'CI / build失敗',
  'プライベート情報の警告',
  '本番デプロイ確認',
];

export function isSafetyCritical(text: string): boolean {
  return SAFETY_CRITICAL_KEYWORDS.some((kw) =>
    text.toLowerCase().includes(kw.toLowerCase()),
  );
}
