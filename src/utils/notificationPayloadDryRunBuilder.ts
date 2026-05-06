import type { NotificationDryRunTargetType } from './notificationDryRunTarget';

export type NotificationPayloadDryRunStatus = 'blocked' | 'ready-to-copy' | 'needs-review';

export type NotificationPayloadDryRun = {
  title: string;
  targetType: NotificationDryRunTargetType;
  status: NotificationPayloadDryRunStatus;
  severity: 'info' | 'success' | 'warning' | 'manual-gate' | 'blocked';
  shortMessage: string;
  markdownMessage: string;
  plainTextMessage: string;
  jsonPayload: string;
  requiredSecrets: string[];
  blockers: string[];
  warnings: string[];
  manualChecklist: string[];
};

const SECRET_MAP: Record<NotificationDryRunTargetType, string[]> = {
  telegram: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
  discord: ['DISCORD_WEBHOOK_URL'],
  line: ['LINE_NOTIFY_TOKEN'],
  email: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_TO'],
  slack: ['SLACK_WEBHOOK_URL'],
  'manual-copy': [],
  other: [],
};

const BLOCKERS_BASE = [
  'このアプリはWebhookを自動送信しません',
  'secret / token / webhook URLをこのアプリ内に保存しません',
];

function buildShortMessage(title: string, appName: string, action: string): string {
  return `だらけ管制室：${title}\nApp: ${appName}\nAction: ${action}`;
}

function buildMarkdownMessage(
  title: string,
  appName: string,
  phase: string,
  action: string,
  severity: string,
): string {
  return [
    `## 🔔 ${title}`,
    '',
    `**App**: ${appName}`,
    `**Phase**: ${phase}`,
    `**Severity**: ${severity}`,
    '',
    `**Action**: ${action}`,
    '',
    '---',
    '_だらけ管制室 — 手動コピー送信_',
  ].join('\n');
}

function buildPlainTextMessage(title: string, appName: string, action: string): string {
  return `【だらけ管制室】${title}\nApp: ${appName}\nAction: ${action}`;
}

function buildJsonPayload(
  targetType: NotificationDryRunTargetType,
  title: string,
  message: string,
): string {
  const base = { source: 'darake-dev-app-AI', title, message };
  switch (targetType) {
    case 'telegram':
      return JSON.stringify({ chat_id: '<YOUR_CHAT_ID>', text: message, parse_mode: 'Markdown' }, null, 2);
    case 'discord':
      return JSON.stringify({ content: message, username: 'だらけ管制室' }, null, 2);
    case 'slack':
      return JSON.stringify({ text: message }, null, 2);
    case 'line':
      return JSON.stringify({ message }, null, 2);
    case 'email':
      return JSON.stringify({ to: '<YOUR_EMAIL>', subject: `だらけ管制室 - ${title}`, body: message }, null, 2);
    default:
      return JSON.stringify(base, null, 2);
  }
}

export type NotificationPayloadDryRunInput = {
  title: string;
  appName: string;
  phase: string;
  action: string;
  severity: NotificationPayloadDryRun['severity'];
  targetType: NotificationDryRunTargetType;
};

export function buildNotificationPayloadDryRun(input: NotificationPayloadDryRunInput): NotificationPayloadDryRun {
  const { title, appName, phase, action, severity, targetType } = input;

  const shortMessage = buildShortMessage(title, appName, action);
  const markdownMessage = buildMarkdownMessage(title, appName, phase, action, severity);
  const plainTextMessage = buildPlainTextMessage(title, appName, action);
  const jsonPayload = buildJsonPayload(targetType, title, markdownMessage);
  const requiredSecrets = SECRET_MAP[targetType] ?? [];

  const blockers = [...BLOCKERS_BASE];
  if (requiredSecrets.length > 0) {
    blockers.push(`secretが必要です（外部管理）: ${requiredSecrets.join(', ')}`);
  }

  const warnings: string[] = [];
  if (severity === 'blocked') {
    warnings.push('severityがblockedです。人間が確認してください。');
  }
  if (severity === 'manual-gate') {
    warnings.push('manual gate操作が必要です。自動実行しないでください。');
  }

  const manualChecklist = [
    '通知文にsecret / token / webhook URLが含まれていないか確認する',
    'private情報（メールアドレス・電話番号等）が含まれていないか確認する',
    '送信先が正しいか確認する',
    '文面に誤りがないか確認する',
    '手動でコピーして送信する',
    '送信後に NotificationSentRecord に記録する',
  ];

  const status: NotificationPayloadDryRunStatus =
    targetType === 'manual-copy' ? 'ready-to-copy' : 'needs-review';

  return {
    title,
    targetType,
    status,
    severity,
    shortMessage,
    markdownMessage,
    plainTextMessage,
    jsonPayload,
    requiredSecrets,
    blockers,
    warnings,
    manualChecklist,
  };
}

export function formatNotificationPayloadDryRunMarkdown(payload: NotificationPayloadDryRun): string {
  return [
    `# Notification Payload Dry-run: ${payload.title}`,
    `- targetType: ${payload.targetType}`,
    `- status: ${payload.status}`,
    `- severity: ${payload.severity}`,
    '',
    '## Short Message（Telegram / LINE向け）',
    payload.shortMessage,
    '',
    '## Markdown Message（Discord / Slack / Email向け）',
    payload.markdownMessage,
    '',
    '## Plain Text（手動コピー向け）',
    payload.plainTextMessage,
    '',
    '## JSON Payload（Webhook用 — 送信しない）',
    '```json',
    payload.jsonPayload,
    '```',
    '',
    '## 必要なsecret（外部管理）',
    payload.requiredSecrets.length > 0
      ? payload.requiredSecrets.map((s) => `- ${s}`).join('\n')
      : '- なし',
    '',
    '## Manual Checklist',
    payload.manualChecklist.map((c) => `- [ ] ${c}`).join('\n'),
    '',
    '## Blockers',
    payload.blockers.map((b) => `- ${b}`).join('\n'),
  ].join('\n');
}
