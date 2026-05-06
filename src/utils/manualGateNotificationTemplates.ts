import type { NotificationSeverity } from './notificationEventModel';

export type ManualGateNotificationTemplate = {
  id: string;
  label: string;
  severity: NotificationSeverity;
  shortMessage: string;
  detailedMessage: string;
  requiredHumanAction: string;
  safeNextStep: string;
};

export const MANUAL_GATE_NOTIFICATION_TEMPLATES: ManualGateNotificationTemplate[] = [
  {
    id: 'api-key-required',
    label: 'APIキーが必要',
    severity: 'manual-gate',
    shortMessage: '⚠️ APIキーの設定が必要です。このアプリはAPIキーを保存しません。',
    detailedMessage:
      'APIキーが必要な操作が発生しました。APIキーはCI側のsecret管理（GitHub Secrets等）で人間が設定してください。このアプリにAPIキーを入力しないでください。',
    requiredHumanAction: 'GitHub Secrets または CI設定でAPIキーを設定する',
    safeNextStep: 'CI設定を確認し、secretが登録されているか確認してください',
  },
  {
    id: 'auth-setup-required',
    label: '認証設定が必要',
    severity: 'manual-gate',
    shortMessage: '🔒 認証設定の確認が必要です。',
    detailedMessage:
      '認証フロー（ログイン、OAuth等）の設定確認が必要です。認証情報はこのアプリに保存しません。',
    requiredHumanAction: '認証設定・テストアカウントを確認する',
    safeNextStep: '認証フローをTestFlightで動作確認してください',
  },
  {
    id: 'billing-setup-required',
    label: '課金設定が必要',
    severity: 'blocked',
    shortMessage: '🔴 課金設定の確認が必要です。本番課金は手動確認です。',
    detailedMessage:
      'IAP（In-App Purchase）または課金設定の確認が必要です。課金設定はApp Store Connect上で人間が行います。',
    requiredHumanAction: 'App Store ConnectでIAP設定を確認する',
    safeNextStep: 'Sandboxテストで課金フローを確認してから本番設定してください',
  },
  {
    id: 'app-store-submit-confirmation',
    label: 'App Store提出前確認が必要',
    severity: 'manual-gate',
    shortMessage: '📋 App Store提出前の最終確認が必要です。',
    detailedMessage:
      'Submit for Reviewを行う前に、メタデータ・スクショ・プライバシー・年齢レーティングをすべて人間が確認してください。自動提出はしません。',
    requiredHumanAction: 'App Store Connectで全セクションを目視確認し、Submit for Reviewを人間が押す',
    safeNextStep: '提出管制室（Phase 13）の最終ゲートを確認してください',
  },
  {
    id: 'ci-failed',
    label: 'CI失敗',
    severity: 'blocked',
    shortMessage: '🔴 CIが失敗しています。ビルドを確認してください。',
    detailedMessage:
      'GitHub Actions CIが失敗しました。失敗ログを確認し、原因を特定して修正してください。',
    requiredHumanAction: 'CIログを確認し、失敗原因を修正する',
    safeNextStep: 'GitHub ActionsのWorkflow Runを開いてログを確認してください',
  },
  {
    id: 'screenshot-private-info',
    label: 'スクショにprivate情報の可能性',
    severity: 'warning',
    shortMessage: '⚠️ スクショにprivate情報が含まれている可能性があります。',
    detailedMessage:
      'キャプチャされたスクショにメールアドレス・電話番号・住所等の個人情報が含まれていないか確認してください。',
    requiredHumanAction: 'スクショを目視確認し、private情報があればマスク・差し替えする',
    safeNextStep: 'スクショ一覧を確認してApp Store用に安全な内容かを確認してください',
  },
  {
    id: 'ui-broken',
    label: 'UI崩れ',
    severity: 'warning',
    shortMessage: '⚠️ UIの崩れが検出されました。',
    detailedMessage:
      'UIチェックでレイアウト崩れが検出されました。修正PRを作成し、再確認してください。',
    requiredHumanAction: '崩れ箇所を特定し修正PRを作成する',
    safeNextStep: 'スクショを再キャプチャしてUI崩れが解消されたか確認してください',
  },
  {
    id: 'rejection-response-required',
    label: 'リジェクト対応が必要',
    severity: 'blocked',
    shortMessage: '🔴 App Reviewでリジェクトされました。対応が必要です。',
    detailedMessage:
      'App Reviewからリジェクト通知が届きました。リジェクト対応管制室（Phase 14）で内容を記録し、対応方針を決めてください。',
    requiredHumanAction: 'リジェクト内容を確認し、修正方針を決定する',
    safeNextStep: 'Phase 14のリジェクト対応管制室を開いてください',
  },
];

export function getManualGateTemplate(id: string): ManualGateNotificationTemplate | undefined {
  return MANUAL_GATE_NOTIFICATION_TEMPLATES.find((t) => t.id === id);
}

export function formatManualGateTemplate(template: ManualGateNotificationTemplate): string {
  return [
    `## ${template.label}`,
    '',
    template.detailedMessage,
    '',
    `**必要な人間のアクション**: ${template.requiredHumanAction}`,
    '',
    `**安全な次のステップ**: ${template.safeNextStep}`,
    '',
    `- severity: ${template.severity}`,
  ].join('\n');
}
