import type {
  DarakeHealthCheckResult,
  DarakeHealthItem,
} from './darakeHealthCheck';

type DarakeHealthApiResponse = {
  ok: true;
  githubToken: 'set' | 'missing';
  issueCreateEnabled: boolean;
  allowedReposConfigured: boolean;
  agentAssignEnabled: boolean;
  runRegistryEnabled: boolean;
  runRegistryKvBound: boolean;
  scheduledAutopilotEnabled: boolean;
  telegramConfigured: boolean;
  webhookConfigured: boolean;
  prMergeEnabled: boolean;
};

function buildItems(res: DarakeHealthApiResponse): DarakeHealthItem[] {
  const hasToken = res.githubToken === 'set';

  return [
    {
      id: 'worker',
      label: 'Workerが動いている',
      status: 'ok',
      userMessage: 'Workerは正常に動いています。',
    },
    {
      id: 'github-token',
      label: 'GitHub Token',
      status: hasToken ? 'ok' : 'missing',
      userMessage: hasToken
        ? 'GitHub Tokenが設定されています。'
        : 'GitHub Issueを作るには、Cloudflare Worker SecretにGITHUB_TOKENが必要です。この画面にはTokenを入力しません。',
      nextAction: hasToken
        ? undefined
        : 'CloudflareダッシュボードでGITHUB_TOKENをSecretとして設定してください。',
    },
    {
      id: 'issue-create',
      label: 'Issue作成',
      status: !hasToken
        ? 'missing'
        : res.issueCreateEnabled
          ? 'ok'
          : 'disabled',
      userMessage: res.issueCreateEnabled
        ? 'Issue作成が有効です。'
        : 'Issue作成を有効にするには、GITHUB_ISSUE_CREATE_ENABLED=trueを設定してください。',
      nextAction: res.issueCreateEnabled
        ? undefined
        : 'GITHUB_ISSUE_CREATE_ENABLED=trueをCloudflareのEnvironment Variablesに設定してください。',
    },
    {
      id: 'allowed-repos',
      label: '許可リポジトリ',
      status: res.allowedReposConfigured ? 'ok' : 'warning',
      userMessage: res.allowedReposConfigured
        ? '許可リポジトリが設定されています。'
        : 'GITHUB_ALLOWED_REPOSが未設定です。全てのリポジトリが対象になります。',
    },
    {
      id: 'agent-assign',
      label: '自動修正依頼',
      status: !hasToken ? 'missing' : res.agentAssignEnabled ? 'ok' : 'disabled',
      userMessage: res.agentAssignEnabled
        ? '自動修正依頼が有効です。'
        : 'GITHUB_AGENT_ASSIGN_ENABLED=trueを設定すると、AIへの自動修正依頼ができます。',
    },
    {
      id: 'pr-watch',
      label: 'PR監視',
      status: hasToken ? 'ok' : 'missing',
      userMessage: hasToken
        ? 'PR監視に必要なTokenがあります。'
        : 'PR監視にはGITHUB_TOKENが必要です。',
    },
    {
      id: 'run-registry',
      label: '裏巡回',
      status: !res.runRegistryKvBound
        ? 'missing'
        : res.runRegistryEnabled
          ? 'ok'
          : 'disabled',
      userMessage:
        res.runRegistryEnabled && res.runRegistryKvBound
          ? '裏巡回レジストリが有効です。'
          : !res.runRegistryKvBound
            ? '画面を閉じても裏で確認するには、RUN_REGISTRY_KVが必要です。'
            : 'DARAKE_RUN_REGISTRY_ENABLED=trueを設定してください。',
      nextAction: !res.runRegistryKvBound
        ? 'CloudflareダッシュボードでRUN_REGISTRY_KVをKV Namespaceとしてバインドしてください。'
        : res.runRegistryEnabled
          ? undefined
          : 'DARAKE_RUN_REGISTRY_ENABLED=trueを設定してください。',
    },
    {
      id: 'scheduled-autopilot',
      label: 'Scheduled巡回',
      status: res.scheduledAutopilotEnabled ? 'ok' : 'disabled',
      userMessage: res.scheduledAutopilotEnabled
        ? 'Scheduled巡回が有効です。'
        : 'DARAKE_AUTOPILOT_SCHEDULE_ENABLED=trueを設定すると、定期的な確認ができます。',
    },
    {
      id: 'telegram',
      label: 'Telegram通知',
      status: res.telegramConfigured ? 'ok' : 'missing',
      userMessage: res.telegramConfigured
        ? 'Telegram通知が設定されています。'
        : '止まった時にTelegram通知したい場合は、TELEGRAM_BOT_TOKENとTELEGRAM_CHAT_IDを設定してください。',
    },
    {
      id: 'webhook',
      label: 'Webhook通知',
      status: res.webhookConfigured ? 'ok' : 'missing',
      userMessage: res.webhookConfigured
        ? 'Webhook通知が設定されています。'
        : 'Webhook通知したい場合は、NOTIFICATION_WEBHOOK_URLを設定してください。',
    },
    {
      id: 'pr-merge',
      label: '低リスク自動マージ',
      status: res.prMergeEnabled ? 'ok' : 'disabled',
      userMessage: res.prMergeEnabled
        ? '自動マージが有効です。'
        : 'GITHUB_PR_MERGE_ENABLED=trueを設定すると、低リスクPRを自動マージできます。',
    },
  ];
}

function calcReadinessScore(res: DarakeHealthApiResponse): number {
  const hasToken = res.githubToken === 'set';
  let score = 5; // worker responding (always true if we got here)
  if (hasToken) score += 25; // token is the most critical
  if (hasToken) score += 5; // PR watch/comment also requires token
  if (res.issueCreateEnabled) score += 15;
  if (res.allowedReposConfigured) score += 10;
  if (res.agentAssignEnabled) score += 5;
  if (res.prMergeEnabled) score += 5;
  if (res.runRegistryKvBound) score += 10;
  if (res.runRegistryEnabled) score += 5;
  if (res.scheduledAutopilotEnabled) score += 5;
  if (res.telegramConfigured || res.webhookConfigured) score += 5;
  return Math.min(100, score);
}

function determineOverall(
  score: number,
): DarakeHealthCheckResult['overall'] {
  if (score >= 90) return 'ready';
  if (score >= 70) return 'mostly-ready';
  if (score >= 50) return 'partial';
  return 'blocked';
}

function buildResult(res: DarakeHealthApiResponse): DarakeHealthCheckResult {
  const items = buildItems(res);
  const score = calcReadinessScore(res);
  const overall = determineOverall(score);

  const titles: Record<DarakeHealthCheckResult['overall'], string> = {
    ready: 'だらけ自動開発を始められます',
    'mostly-ready': 'かなり準備できています',
    partial: '一部機能で試せます',
    blocked: '最初だけ設定が必要です',
    unknown: '確認できませんでした',
  };

  const messages: Record<DarakeHealthCheckResult['overall'], string> = {
    ready: 'ほとんどの機能が使えます。',
    'mostly-ready':
      'Issue作成とPR監視は使えます。裏巡回や通知は後で設定できます。',
    partial:
      '一部だけ動きます。まずIssue作成設定を確認してください。',
    blocked:
      'GitHub TokenがWorker Secretに設定されていません。Cloudflare SecretにGITHUB_TOKENを追加してください。',
    unknown: '設定状態を確認できませんでした。',
  };

  const firstMissingNextAction =
    items.find((item) => item.status === 'missing' && item.nextAction)
      ?.nextAction ??
    items.find((item) => item.status === 'disabled' && item.nextAction)
      ?.nextAction;

  const nextActionLabel =
    firstMissingNextAction ??
    (overall === 'ready' ? 'この内容で作り始める' : '設定を確認してください');

  return {
    overall,
    title: titles[overall],
    userMessage: messages[overall],
    nextActionLabel,
    items,
    checkedAt: new Date().toISOString(),
    readinessScore: score,
  };
}

export async function fetchDarakeHealth(): Promise<DarakeHealthCheckResult> {
  const res = await fetch('/api/darake/health');
  if (!res.ok) throw new Error('health check fetch failed');
  const data = (await res.json()) as DarakeHealthApiResponse;
  if (!data.ok) throw new Error('health check response not ok');
  return buildResult(data);
}
