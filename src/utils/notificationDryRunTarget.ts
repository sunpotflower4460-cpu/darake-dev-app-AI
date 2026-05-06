export type NotificationDryRunTargetType =
  | 'telegram'
  | 'discord'
  | 'line'
  | 'email'
  | 'slack'
  | 'manual-copy'
  | 'other';

export type NotificationDryRunTarget = {
  id: string;
  label: string;
  type: NotificationDryRunTargetType;
  status: 'draft-only' | 'manual-copy-ready' | 'blocked';
  requiresSecret: boolean;
  secretPolicy: 'never-store' | 'external-secret-only';
  supportsMarkdown: boolean;
  supportsPlainText: boolean;
  supportsJsonPayload: boolean;
  notes: string;
};

export const DEFAULT_NOTIFICATION_DRY_RUN_TARGETS: NotificationDryRunTarget[] = [
  {
    id: 'target-manual-copy',
    label: '手動コピー',
    type: 'manual-copy',
    status: 'manual-copy-ready',
    requiresSecret: false,
    secretPolicy: 'never-store',
    supportsMarkdown: false,
    supportsPlainText: true,
    supportsJsonPayload: false,
    notes: 'secret不要。すぐ使える。最優先の通知手段。',
  },
  {
    id: 'target-telegram',
    label: 'Telegram Bot',
    type: 'telegram',
    status: 'draft-only',
    requiresSecret: true,
    secretPolicy: 'external-secret-only',
    supportsMarkdown: true,
    supportsPlainText: true,
    supportsJsonPayload: true,
    notes: 'bot token / chat id が必要。secretはGitHub Secrets等の外部ツールで管理する。アプリ内保存禁止。',
  },
  {
    id: 'target-discord',
    label: 'Discord Webhook',
    type: 'discord',
    status: 'draft-only',
    requiresSecret: true,
    secretPolicy: 'external-secret-only',
    supportsMarkdown: true,
    supportsPlainText: true,
    supportsJsonPayload: true,
    notes: 'Webhook URLが必要。アプリ内保存禁止。外部secret管理が必要。',
  },
  {
    id: 'target-line',
    label: 'LINE Notify',
    type: 'line',
    status: 'draft-only',
    requiresSecret: true,
    secretPolicy: 'external-secret-only',
    supportsMarkdown: false,
    supportsPlainText: true,
    supportsJsonPayload: true,
    notes: 'Channel Access Token等が必要。アプリ内保存禁止。短いplain textが適切。',
  },
  {
    id: 'target-email',
    label: 'Email（手動）',
    type: 'email',
    status: 'draft-only',
    requiresSecret: false,
    secretPolicy: 'never-store',
    supportsMarkdown: false,
    supportsPlainText: true,
    supportsJsonPayload: false,
    notes: 'SMTP / providerが別途必要。現時点は手動コピーのみ。',
  },
  {
    id: 'target-slack',
    label: 'Slack Webhook',
    type: 'slack',
    status: 'draft-only',
    requiresSecret: true,
    secretPolicy: 'external-secret-only',
    supportsMarkdown: true,
    supportsPlainText: true,
    supportsJsonPayload: true,
    notes: 'Webhook URL等が必要。アプリ内保存禁止。',
  },
];

export function buildDefaultNotificationDryRunTargets(): NotificationDryRunTarget[] {
  return DEFAULT_NOTIFICATION_DRY_RUN_TARGETS;
}

export function summarizeNotificationDryRunTargets(targets: NotificationDryRunTarget[]): string {
  const byStatus = {
    'manual-copy-ready': targets.filter((t) => t.status === 'manual-copy-ready').length,
    'draft-only': targets.filter((t) => t.status === 'draft-only').length,
    blocked: targets.filter((t) => t.status === 'blocked').length,
  };
  const needsSecret = targets.filter((t) => t.requiresSecret).length;
  return [
    `## 通知dry-runターゲット一覧 (${targets.length}件)`,
    `- manual-copy-ready: ${byStatus['manual-copy-ready']}件`,
    `- draft-only: ${byStatus['draft-only']}件`,
    `- blocked: ${byStatus.blocked}件`,
    `- secret必要: ${needsSecret}件 (外部管理のみ)`,
    '',
    '## 安全方針',
    '- secret / webhook URL はこのアプリ内に保存しません',
    '- 実送信は手動 / 外部ツールで行います',
  ].join('\n');
}

export function formatNotificationDryRunTargetsMarkdown(targets: NotificationDryRunTarget[]): string {
  const lines = ['# 通知dry-runターゲット', ''];
  targets.forEach((t) => {
    lines.push(
      `## ${t.label} (${t.type})`,
      `- status: ${t.status}`,
      `- requiresSecret: ${t.requiresSecret ? 'はい' : 'いいえ'}`,
      `- secretPolicy: ${t.secretPolicy}`,
      `- markdown対応: ${t.supportsMarkdown ? '✅' : '—'}`,
      `- plainText対応: ${t.supportsPlainText ? '✅' : '—'}`,
      `- jsonPayload対応: ${t.supportsJsonPayload ? '✅' : '—'}`,
      `- notes: ${t.notes}`,
      '',
    );
  });
  lines.push('## 安全方針', '- 外部送信なし・secret保存なし・すべてdry-run/manual-copy');
  return lines.join('\n');
}
