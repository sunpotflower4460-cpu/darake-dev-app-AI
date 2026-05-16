import type { SetupStatusResponse } from './setupStatusClient';

export type DiagnosticLevel = 'ok' | 'missing' | 'blocked';

export type DiagnosticItem = {
  id: string;
  label: string;
  level: DiagnosticLevel;
  note: string;
};

export type SettingsDiagnosticReport = {
  overall: 'all-ok' | 'partial' | 'not-ready';
  items: DiagnosticItem[];
  readyCount: number;
  totalCount: number;
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
      note:
        status.githubToken === 'set'
          ? '接続できています'
          : 'WORKER_GITHUB_TOKEN をGitHubに登録してください',
    },
    {
      id: 'issue-create',
      label: 'Issue自動作成',
      level: status.githubIssueCreateEnabled ? 'ok' : 'missing',
      note: status.githubIssueCreateEnabled
        ? '有効です'
        : 'GITHUB_ISSUE_CREATE_ENABLED を true にしてください',
    },
    {
      id: 'repo-configured',
      label: '作業場所',
      level: status.allowedReposConfigured ? 'ok' : 'missing',
      note: status.allowedReposConfigured
        ? 'リポジトリが設定されています'
        : 'GITHUB_ALLOWED_REPOS を設定することを推奨します',
    },
    {
      id: 'run-registry',
      label: 'Cloudflare KV',
      level: status.runRegistryKvBound ? 'ok' : 'missing',
      note: status.runRegistryKvBound
        ? 'KVが接続されています'
        : 'Cloudflare Setupを実行してください',
    },
    {
      id: 'schedule',
      label: '自動スケジュール',
      level: status.autopilotScheduleEnabled ? 'ok' : 'missing',
      note: status.autopilotScheduleEnabled
        ? '定期実行が有効です'
        : 'AUTOPILOT_SCHEDULE_ENABLED を true にすると定期チェックできます（任意）',
    },
  ];

  const readyCount = items.filter((i) => i.level === 'ok').length;
  const hasBlocked = items.some((i) => i.level === 'blocked');
  const overall: SettingsDiagnosticReport['overall'] = hasBlocked
    ? 'not-ready'
    : readyCount === items.length
      ? 'all-ok'
      : 'partial';

  const footerMessage =
    overall === 'all-ok'
      ? 'すべて準備できています。アプリ作成を始めましょう。'
      : overall === 'not-ready'
        ? '足りないのはこれだけです。上のリンクから設定できます。'
        : '基本の設定はできています。任意の項目は後でも大丈夫です。';

  return { overall, items, readyCount, totalCount: items.length, footerMessage };
}

export function buildFallbackDiagnosticReport(): SettingsDiagnosticReport {
  return {
    overall: 'not-ready',
    items: [
      {
        id: 'worker-unreachable',
        label: 'Cloudflare Worker',
        level: 'blocked',
        note: 'Workerに接続できませんでした。セットアップを実行してください。',
      },
    ],
    readyCount: 0,
    totalCount: 1,
    footerMessage: 'Cloudflare Setupを実行すると自動で設定されます。',
  };
}
