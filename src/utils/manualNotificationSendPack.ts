import type { NotificationDryRunTargetType } from './notificationDryRunTarget';

export type ManualNotificationSendPack = {
  title: string;
  status: 'blocked' | 'ready-to-send-manually' | 'needs-review';
  targetType: NotificationDryRunTargetType;
  messageToCopy: string;
  fallbackPlainText: string;
  sendSteps: string[];
  stopIf: string[];
  afterSendRecordTemplate: string;
};

const SEND_STEPS: Record<NotificationDryRunTargetType, string[]> = {
  telegram: [
    '1. Telegramを開く',
    '2. 対象チャットを開く',
    '3. messageToCopyを貼る',
    '4. URLやsecretが含まれていないか確認する',
    '5. 手動で送信する',
  ],
  discord: [
    '1. Discordを開く',
    '2. 対象チャンネルを開く',
    '3. markdownMessageを貼る',
    '4. 表示崩れを確認する',
    '5. 手動で送信する',
  ],
  line: [
    '1. LINEを開く',
    '2. 対象トークを開く',
    '3. plainTextMessageを貼る',
    '4. 長すぎないか確認する',
    '5. 手動で送信する',
  ],
  email: [
    '1. メールクライアントを開く',
    '2. 宛先を設定する',
    '3. messageToCopyを本文に貼る',
    '4. 件名を確認する',
    '5. 手動で送信する',
  ],
  slack: [
    '1. Slackを開く',
    '2. 対象チャンネルを開く',
    '3. markdownMessageを貼る',
    '4. メンション等が意図どおりか確認する',
    '5. 手動で送信する',
  ],
  'manual-copy': [
    '1. messageToCopyをコピーする',
    '2. 送信先に貼り付ける',
    '3. 内容を確認する',
    '4. 手動で送信する',
  ],
  other: [
    '1. messageToCopyをコピーする',
    '2. 送信先に貼り付ける',
    '3. 手動で送信する',
  ],
};

const STOP_IF = [
  '通知文にsecret / token / webhook URLが含まれている場合',
  'private情報（メールアドレス・電話番号等）が含まれている場合',
  '送信先が間違っている場合',
  'blockers が残っている場合',
  'Safety Gateがblockedの場合',
];

export function buildManualNotificationSendPack(
  title: string,
  targetType: NotificationDryRunTargetType,
  messageToCopy: string,
  fallbackPlainText: string,
  status: ManualNotificationSendPack['status'],
): ManualNotificationSendPack {
  const sentAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const afterSendRecordTemplate = [
    `## 送信記録テンプレート`,
    `- title: ${title}`,
    `- targetType: ${targetType}`,
    `- sentAt: ${sentAt}（実際の時刻に変更してください）`,
    `- sentBy: human`,
    `- status: sent-manually`,
    `- destinationLabel: （送信先を記入）`,
    `- followUpNeeded: false`,
    `- notes: （メモがあれば記入）`,
  ].join('\n');

  return {
    title,
    status,
    targetType,
    messageToCopy,
    fallbackPlainText,
    sendSteps: SEND_STEPS[targetType] ?? SEND_STEPS['manual-copy'],
    stopIf: STOP_IF,
    afterSendRecordTemplate,
  };
}

export function formatManualNotificationSendPackMarkdown(pack: ManualNotificationSendPack): string {
  return [
    `# Manual Notification Send Pack: ${pack.title}`,
    `- targetType: ${pack.targetType}`,
    `- status: ${pack.status}`,
    '',
    '## 送信メッセージ（コピーして送信）',
    pack.messageToCopy,
    '',
    '## Fallback Plain Text',
    pack.fallbackPlainText,
    '',
    '## 送信手順',
    pack.sendSteps.join('\n'),
    '',
    '## これが当てはまる場合は送らない',
    pack.stopIf.map((s) => `- ⛔ ${s}`).join('\n'),
    '',
    '## 送信後の記録テンプレート',
    pack.afterSendRecordTemplate,
  ].join('\n');
}
