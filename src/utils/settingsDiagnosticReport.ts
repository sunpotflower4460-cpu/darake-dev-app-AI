import type { SetupStatusResponse } from './setupStatusClient';

export type DiagnosticLevel = 'ok' | 'missing' | 'blocked';

export type DiagnosticItem = {
  id: string;
  label: string;
  level: DiagnosticLevel;
  required: boolean;
  note: string;
};

export type SettingsDiagnosticReport = {
  overall: 'all-ok' | 'partial' | 'not-ready';
  items: DiagnosticItem[];
  readyCount: number;
  totalCount: number;
  requiredReadyCount: number;
  requiredTotalCount: number;
  optionalMissingCount: number;
  footerMessage: string;
};

export function buildSettingsDiagnosticReport(
  status: SetupStatusResponse,
): SettingsDiagnosticReport {
  const items: DiagnosticItem[] = [
    {
      id: 'github-token',
      label: 'GitHub連携',
      level: status.githubToken === 'set' ? 'ok' : 'blocked',
      required: true,
      note:
        status.githubToken === 'set'
          ? '接続できています'
          : 'WORKER_GITHUB_TOKEN をGitHubに登録してください',
    },
    {
      id: 'issue-create',
      label: 'Issue自動作成',
      level: status.githubIssueCreateEnabled ? 'ok' : 'missing',
      required: true,
      note: status.githubIssueCreateEnabled
        ? '有効です'
        : 'GITHUB_ISSUE_CREATE_ENABLED を true にしてください',
    },
    {
      id: 'repo-configured',
      label: '作業場所',
      level: status.allowedReposConfigured ? 'ok' : 'missing',
      required: false,
      note: status.allowedReposConfigured
        ? 'リポジトリが設定されています'
        : 'GITHUB_ALLOWED_REPOS を設定することを推奨します',
    },
    {
      id: 'run-registry',
      label: 'Cloudflare KV',
      level: status.runRegistryKvBound ? 'ok' : 'missing',
      required: true,
      note: status.runRegistryKvBound
        ? 'KVが接続されています'
        : 'Cloudflare Setupを実行してください',
    },
    {
      id: 'schedule',
      label: '自動スケジュール',
      level: status.autopilotScheduleEnabled ? 'ok' : 'missing',
      required: false,
      note: status.autopilotScheduleEnabled
        ? '定期実行が有効です'
        : 'AUTOPILOT_SCHEDULE_ENABLED を true にすると定期チェックできます（任意）',
    },
    {
      id: 'telegram',
      label: 'Telegram通知',
      level: status.telegramConfigured ? 'ok' : 'missing',
      required: false,
      note: status.telegramConfigured
        ? '通知先が設定されています'
        : '必要なら TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID を設定してください（任意）',
    },
    {
      id: 'webhook',
      label: 'Webhook通知',
      level: status.webhookConfigured ? 'ok' : 'missing',
      required: false,
      note: status.webhookConfigured
        ? 'Webhook URL が設定されています'
        : '必要なら WEBHOOK_URL を設定してください（任意）',
    },
  ];

  const readyCount = items.filter((i) => i.level === 'ok').length;
  const requiredItems = items.filter((i) => i.required);
  const requiredReadyCount = requiredItems.filter((i) => i.level === 'ok').length;
  const hasRequiredItemsIncomplete = requiredItems.some((i) => i.level === 'blocked' || i.level === 'missing');
  const optionalMissingCount = items.filter((i) => !i.required && i.level !== 'ok').length;
  const overall: SettingsDiagnosticReport['overall'] = hasRequiredItemsIncomplete
    ? 'not-ready'
    : optionalMissingCount === 0
      ? 'all-ok'
      : 'partial';

  const footerMessage =
    overall === 'not-ready'
      ? '足りないのはこれだけです。上のリンクから設定できます。'
      : optionalMissingCount > 0
        ? '基本設定OK。アプリ作成を始められます。任意設定はあとでOKです。'
        : '基本設定OK。アプリ作成を始められます。';

  return {
    overall,
    items,
    readyCount,
    totalCount: items.length,
    requiredReadyCount,
    requiredTotalCount: requiredItems.length,
    optionalMissingCount,
    footerMessage,
  };
}

export function buildFallbackDiagnosticReport(): SettingsDiagnosticReport {
  return {
    overall: 'not-ready',
    items: [
      {
        id: 'worker-unreachable',
        label: 'Cloudflare Worker',
        level: 'blocked',
        required: true,
        note: 'Workerに接続できませんでした。セットアップを実行してください。',
      },
    ],
    readyCount: 0,
    totalCount: 1,
    requiredReadyCount: 0,
    requiredTotalCount: 1,
    optionalMissingCount: 0,
    footerMessage: 'Cloudflare Setupを実行すると自動で設定されます。',
  };
}
