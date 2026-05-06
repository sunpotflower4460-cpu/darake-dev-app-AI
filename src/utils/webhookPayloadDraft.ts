import { ExternalNotificationChannelType } from './externalNotificationChannels';

export type WebhookPayloadDraft = {
  title: string;
  status: 'draft-only' | 'blocked';
  channelType: ExternalNotificationChannelType;
  payloadJson: string;
  markdownMessage: string;
  requiredSecrets: string[];
  manualGate: string[];
  blockedReasons: string[];
};

const BLOCKED_REASONS = [
  'このアプリはWebhookを自動送信しません',
  'secret / token / webhook URLをこのアプリ内に保存しません',
  '送信は外部ツールで手動実行してください',
];

function buildTelegramPayload(message: string): string {
  return JSON.stringify(
    {
      chat_id: '<YOUR_CHAT_ID>',
      text: message,
      parse_mode: 'Markdown',
    },
    null,
    2,
  );
}

function buildDiscordPayload(message: string): string {
  return JSON.stringify(
    {
      content: message,
      username: 'だらけ管制室',
    },
    null,
    2,
  );
}

function buildSlackPayload(message: string): string {
  return JSON.stringify(
    {
      text: message,
    },
    null,
    2,
  );
}

function buildLinePayload(message: string): string {
  return JSON.stringify(
    {
      message,
    },
    null,
    2,
  );
}

function buildEmailPayload(message: string): string {
  return JSON.stringify(
    {
      to: '<YOUR_EMAIL>',
      subject: 'だらけ管制室 通知',
      body: message,
    },
    null,
    2,
  );
}

function buildGenericPayload(message: string): string {
  return JSON.stringify(
    {
      message,
      source: 'darake-dev-app-AI',
    },
    null,
    2,
  );
}

const SECRET_REQUIREMENTS: Record<ExternalNotificationChannelType, string[]> = {
  telegram: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
  discord: ['DISCORD_WEBHOOK_URL'],
  line: ['LINE_NOTIFY_TOKEN'],
  email: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_TO'],
  slack: ['SLACK_WEBHOOK_URL'],
  'manual-copy': [],
  other: [],
};

const MANUAL_GATE_STEPS: Record<ExternalNotificationChannelType, string[]> = {
  telegram: [
    '1. 外部secret管理ツールでBOT_TOKENとCHAT_IDを確認',
    '2. 以下のJSONをコピー',
    '3. curl または Bot管理ツールで手動送信',
  ],
  discord: [
    '1. 外部secret管理ツールでWEBHOOK_URLを確認',
    '2. 以下のJSONをコピー',
    '3. curl -H "Content-Type: application/json" -d \'<JSON>\' <WEBHOOK_URL> で送信',
  ],
  line: [
    '1. 外部secret管理ツールでLINE_NOTIFY_TOKENを確認',
    '2. メッセージをコピー',
    '3. curl -X POST https://notify-api.line.me/api/notify -H "Authorization: Bearer <TOKEN>" -F "message=<MSG>" で送信',
  ],
  email: ['1. メールクライアントを開く', '2. 以下のメッセージをコピーして送信'],
  slack: [
    '1. 外部secret管理ツールでWEBHOOK_URLを確認',
    '2. 以下のJSONをコピー',
    '3. curl -X POST -H "Content-Type: application/json" -d \'<JSON>\' <WEBHOOK_URL> で送信',
  ],
  'manual-copy': ['1. 以下のメッセージをコピー', '2. 送信先に貼り付けて送信'],
  other: ['1. メッセージをコピー', '2. 手動で送信'],
};

export function buildWebhookPayloadDraft(
  channelType: ExternalNotificationChannelType,
  message: string,
  title: string,
): WebhookPayloadDraft {
  let payloadJson = '';
  switch (channelType) {
    case 'telegram':
      payloadJson = buildTelegramPayload(message);
      break;
    case 'discord':
      payloadJson = buildDiscordPayload(message);
      break;
    case 'slack':
      payloadJson = buildSlackPayload(message);
      break;
    case 'line':
      payloadJson = buildLinePayload(message);
      break;
    case 'email':
      payloadJson = buildEmailPayload(message);
      break;
    default:
      payloadJson = buildGenericPayload(message);
  }

  return {
    title,
    status: 'draft-only',
    channelType,
    payloadJson,
    markdownMessage: message,
    requiredSecrets: SECRET_REQUIREMENTS[channelType] ?? [],
    manualGate: MANUAL_GATE_STEPS[channelType] ?? ['1. メッセージをコピーして手動送信'],
    blockedReasons: BLOCKED_REASONS,
  };
}

export function formatWebhookPayloadDraftMarkdown(draft: WebhookPayloadDraft): string {
  return [
    `# Webhook Payload Draft: ${draft.title}`,
    `- status: ${draft.status}`,
    `- channelType: ${draft.channelType}`,
    '',
    '## Payload JSON（コピーして手動送信）',
    '```json',
    draft.payloadJson,
    '```',
    '',
    '## Markdownメッセージ',
    draft.markdownMessage,
    '',
    '## 必要なsecret（外部管理）',
    ...draft.requiredSecrets.map((s) => `- ${s}`),
    '',
    '## 手動送信手順',
    ...draft.manualGate.map((s) => `- ${s}`),
    '',
    '## ブロック理由',
    ...draft.blockedReasons.map((r) => `- ${r}`),
  ].join('\n');
}
