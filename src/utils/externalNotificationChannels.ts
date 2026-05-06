export type ExternalNotificationChannelType =
  | 'telegram'
  | 'discord'
  | 'line'
  | 'email'
  | 'slack'
  | 'manual-copy'
  | 'other';

export type ExternalNotificationChannel = {
  id: string;
  label: string;
  type: ExternalNotificationChannelType;
  status: 'draft' | 'manual-only' | 'candidate' | 'blocked';
  description: string;
  requiresSecret: boolean;
  secretHandlingPolicy: 'never-store' | 'external-secret-only';
  notes: string;
};

const STORAGE_KEY = 'darake.externalNotificationChannels.v1';

const DEFAULT_CHANNELS: ExternalNotificationChannel[] = [
  {
    id: 'telegram-1',
    label: 'Telegram Bot',
    type: 'telegram',
    status: 'candidate',
    description: 'Telegram Bot APIを使った通知候補。実送信にはBot tokenとchat IDが必要。',
    requiresSecret: true,
    secretHandlingPolicy: 'external-secret-only',
    notes: 'secret は GitHub Secrets 等の外部管理ツールで保管すること',
  },
  {
    id: 'discord-1',
    label: 'Discord Webhook',
    type: 'discord',
    status: 'candidate',
    description: 'Discord Incoming Webhookを使った通知候補。Webhook URLが必要。',
    requiresSecret: true,
    secretHandlingPolicy: 'external-secret-only',
    notes: 'Webhook URL は外部secret管理が必要。このアプリ内には保存しない',
  },
  {
    id: 'line-1',
    label: 'LINE Notify',
    type: 'line',
    status: 'candidate',
    description: 'LINE Notify APIを使った通知候補。Tokenが必要。',
    requiresSecret: true,
    secretHandlingPolicy: 'external-secret-only',
    notes: 'LINE Notify token は外部secret管理が必要',
  },
  {
    id: 'email-1',
    label: 'Email（手動）',
    type: 'email',
    status: 'manual-only',
    description: 'メール通知。現時点では手動コピー送信のみ。SMTPは別途設定が必要。',
    requiresSecret: false,
    secretHandlingPolicy: 'never-store',
    notes: '手動コピー送信のみ対応',
  },
  {
    id: 'slack-1',
    label: 'Slack Webhook',
    type: 'slack',
    status: 'candidate',
    description: 'Slack Incoming Webhookを使った通知候補。Webhook URLが必要。',
    requiresSecret: true,
    secretHandlingPolicy: 'external-secret-only',
    notes: 'Webhook URL は外部secret管理が必要',
  },
  {
    id: 'manual-copy-1',
    label: '手動コピー',
    type: 'manual-copy',
    status: 'manual-only',
    description: '通知文をコピーして手動で送信する方法。secret不要。',
    requiresSecret: false,
    secretHandlingPolicy: 'never-store',
    notes: 'secret不要。すぐ使える',
  },
];

export function buildInitialExternalNotificationChannel(): ExternalNotificationChannel {
  return {
    id: `channel-${Date.now()}`,
    label: '',
    type: 'manual-copy',
    status: 'draft',
    description: '',
    requiresSecret: false,
    secretHandlingPolicy: 'never-store',
    notes: '',
  };
}

export function loadExternalNotificationChannels(): ExternalNotificationChannel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CHANNELS;
    return JSON.parse(raw) as ExternalNotificationChannel[];
  } catch {
    return DEFAULT_CHANNELS;
  }
}

export function saveExternalNotificationChannels(channels: ExternalNotificationChannel[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
  } catch {
    // ignore
  }
}

export function summarizeExternalNotificationChannels(channels: ExternalNotificationChannel[]): string {
  const byStatus = {
    candidate: channels.filter((c) => c.status === 'candidate').length,
    'manual-only': channels.filter((c) => c.status === 'manual-only').length,
    draft: channels.filter((c) => c.status === 'draft').length,
    blocked: channels.filter((c) => c.status === 'blocked').length,
  };
  const needsSecret = channels.filter((c) => c.requiresSecret).length;
  return [
    `## 外部通知チャンネル一覧 (${channels.length}件)`,
    `- 候補: ${byStatus.candidate}件`,
    `- 手動のみ: ${byStatus['manual-only']}件`,
    `- 下書き: ${byStatus.draft}件`,
    `- ブロック: ${byStatus.blocked}件`,
    `- secret必要: ${needsSecret}件`,
  ].join('\n');
}

export function formatExternalNotificationChannels(channels: ExternalNotificationChannel[]): string {
  return channels
    .map((c) =>
      [
        `### ${c.label} (${c.type})`,
        `- status: ${c.status}`,
        `- requiresSecret: ${c.requiresSecret ? 'はい' : 'いいえ'}`,
        `- secretHandlingPolicy: ${c.secretHandlingPolicy}`,
        `- description: ${c.description}`,
        `- notes: ${c.notes}`,
      ].join('\n'),
    )
    .join('\n\n');
}
