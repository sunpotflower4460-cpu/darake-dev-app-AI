export type ManualSendTarget = 'telegram' | 'discord' | 'line' | 'email' | 'slack' | 'other';

export type ManualNotificationSendGuide = {
  target: ManualSendTarget;
  label: string;
  steps: string[];
  copyText: string;
  warnings: string[];
};

export function buildManualNotificationSendGuide(
  target: ManualSendTarget,
  message: string,
): ManualNotificationSendGuide {
  const guides: Record<ManualSendTarget, Omit<ManualNotificationSendGuide, 'copyText'>> = {
    telegram: {
      target: 'telegram',
      label: 'Telegram に手動送信',
      steps: [
        '1. Telegram アプリを開く',
        '2. 送信先のチャットまたはチャンネルを開く',
        '3. 以下のメッセージをコピーして貼り付ける',
        '4. 送信する',
      ],
      warnings: ['Bot API を自動実行しません', 'token はこのアプリに入力しないでください'],
    },
    discord: {
      target: 'discord',
      label: 'Discord に手動送信',
      steps: [
        '1. Discord アプリを開く',
        '2. 送信先のチャンネルを開く',
        '3. 以下のメッセージをコピーして貼り付ける',
        '4. 送信する',
      ],
      warnings: ['Webhook URL を自動実行しません', 'Webhook URL はこのアプリに入力しないでください'],
    },
    line: {
      target: 'line',
      label: 'LINE に手動送信',
      steps: [
        '1. LINE アプリを開く',
        '2. 送信先のトークを開く',
        '3. 以下のメッセージをコピーして貼り付ける',
        '4. 送信する',
      ],
      warnings: ['LINE Notify token はこのアプリに入力しないでください'],
    },
    email: {
      target: 'email',
      label: 'Email に手動送信',
      steps: [
        '1. メールクライアントを開く',
        '2. 新規メールを作成する',
        '3. 件名: だらけ管制室 通知',
        '4. 以下のメッセージをコピーして本文に貼り付ける',
        '5. 送信する',
      ],
      warnings: ['SMTP設定はこのアプリでは行いません'],
    },
    slack: {
      target: 'slack',
      label: 'Slack に手動送信',
      steps: [
        '1. Slack アプリを開く',
        '2. 送信先のチャンネルを開く',
        '3. 以下のメッセージをコピーして貼り付ける',
        '4. 送信する',
      ],
      warnings: ['Webhook URL を自動実行しません', 'Webhook URL はこのアプリに入力しないでください'],
    },
    other: {
      target: 'other',
      label: '手動送信（その他）',
      steps: [
        '1. 送信先アプリを開く',
        '2. 以下のメッセージをコピーして貼り付ける',
        '3. 送信する',
      ],
      warnings: ['外部APIは自動実行しません'],
    },
  };

  const guide = guides[target];
  return {
    ...guide,
    copyText: message,
  };
}

export function formatManualNotificationSendGuideMarkdown(guide: ManualNotificationSendGuide): string {
  return [
    `# ${guide.label}`,
    '',
    '## 手順',
    ...guide.steps.map((s) => `- ${s}`),
    '',
    '## 送信メッセージ（コピー用）',
    '```',
    guide.copyText,
    '```',
    '',
    '## 注意',
    ...guide.warnings.map((w) => `- ⚠️ ${w}`),
  ].join('\n');
}
