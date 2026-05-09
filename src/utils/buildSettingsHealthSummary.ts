import type { SettingsHealthResponse, SettingsHealthSummary, SettingsHealthItem } from './settingsHealth';

export function buildSettingsHealthSummary(input: SettingsHealthResponse): SettingsHealthSummary {
  const items: SettingsHealthItem[] = [];

  // GitHub token
  if (input.github.tokenConfigured) {
    items.push({
      id: 'github-token',
      title: 'GitHub連携',
      level: 'ok',
      description: 'GitHub連携は準備できています',
    });
  } else {
    items.push({
      id: 'github-token',
      title: 'GitHub連携',
      level: 'blocked',
      description: 'GitHub連携の設定が必要です',
      nextActionLabel: 'GITHUB_TOKENをCloudflare Secretに設定してください',
    });
  }

  // GitHub allowlist
  if (input.github.repoAllowlistConfigured) {
    items.push({
      id: 'github-allowlist',
      title: 'リポジトリ許可リスト',
      level: 'ok',
      description: 'リポジトリ許可リストが設定されています',
    });
  } else {
    items.push({
      id: 'github-allowlist',
      title: 'リポジトリ許可リスト',
      level: 'warning',
      description: '全リポジトリが許可された状態です',
      nextActionLabel: 'GITHUB_ALLOWED_REPOSで制限することを推奨します',
    });
  }

  // Issue create
  if (input.github.issueCreateEnabled) {
    items.push({
      id: 'github-issue-create',
      title: 'Issue自動作成',
      level: 'ok',
      description: 'Issue作成が有効です',
    });
  } else {
    items.push({
      id: 'github-issue-create',
      title: 'Issue自動作成',
      level: 'missing',
      description: 'Issue自動作成はまだOFFです',
      nextActionLabel: 'GITHUB_ISSUE_CREATE_ENABLED=true を設定してください',
    });
  }

  // Auto merge
  if (input.github.mergeEnabled) {
    items.push({
      id: 'github-merge',
      title: '自動マージ',
      level: 'ok',
      description: '自動マージが有効です',
    });
  } else {
    items.push({
      id: 'github-merge',
      title: '自動マージ',
      level: 'missing',
      description: '自動マージはまだOFFです',
      nextActionLabel: 'GITHUB_AGENT_ASSIGN_ENABLED=true を設定してください',
    });
  }

  // KV
  if (input.kv.configured) {
    items.push({
      id: 'kv-configured',
      title: '裏巡回ストレージ（KV）',
      level: 'ok',
      description: 'KVストレージが設定されています',
    });
  } else {
    items.push({
      id: 'kv-configured',
      title: '裏巡回ストレージ（KV）',
      level: 'missing',
      description: '裏巡回の保存設定がまだありません',
      nextActionLabel: 'RUN_REGISTRY_KVをCloudflare KVとバインドしてください',
    });
  }

  // Run registry enabled
  if (input.kv.runRegistryEnabled) {
    items.push({
      id: 'kv-registry-enabled',
      title: '裏巡回機能',
      level: 'ok',
      description: '裏巡回機能が有効です',
    });
  } else {
    items.push({
      id: 'kv-registry-enabled',
      title: '裏巡回機能',
      level: 'missing',
      description: '裏巡回機能はまだOFFです',
      nextActionLabel: 'DARAKE_RUN_REGISTRY_ENABLED=true を設定してください',
    });
  }

  // Telegram
  if (input.notifications.telegramConfigured) {
    items.push({
      id: 'telegram',
      title: 'Telegram通知',
      level: 'ok',
      description: 'Telegram通知が設定されています',
    });
  } else {
    items.push({
      id: 'telegram',
      title: 'Telegram通知',
      level: 'missing',
      description: '通知設定がまだありません',
      nextActionLabel: 'TELEGRAM_BOT_TOKEN と TELEGRAM_CHAT_ID を設定してください',
    });
  }

  // Webhook
  if (input.notifications.webhookConfigured) {
    items.push({
      id: 'webhook',
      title: 'Webhook通知',
      level: 'ok',
      description: 'Webhook通知が設定されています',
    });
  } else {
    items.push({
      id: 'webhook',
      title: 'Webhook通知',
      level: 'warning',
      description: 'Webhook通知は未設定です（任意）',
      nextActionLabel: 'NOTIFICATION_WEBHOOK_URL を設定してください（省略可）',
    });
  }

  // Cron
  if (input.cron.scheduleEnabled) {
    items.push({
      id: 'cron',
      title: '定期実行',
      level: 'ok',
      description: '定期実行が有効です',
    });
  } else {
    items.push({
      id: 'cron',
      title: '定期実行',
      level: 'missing',
      description: '定期実行がまだOFFです',
      nextActionLabel: 'DARAKE_AUTOPILOT_SCHEDULE_ENABLED=true を設定してください',
    });
  }

  const readyCount = items.filter((i) => i.level === 'ok').length;
  const missingCount = items.filter((i) => i.level === 'missing').length;
  const blockedCount = items.filter((i) => i.level === 'blocked').length;

  let overall: SettingsHealthSummary['overall'];
  if (blockedCount > 0) {
    overall = 'blocked';
  } else if (missingCount === 0) {
    overall = 'ready';
  } else if (missingCount <= 2) {
    overall = 'mostly-ready';
  } else {
    overall = 'needs-setup';
  }

  return {
    overall,
    items,
    readyCount,
    missingCount,
    blockedCount,
    updatedAt: new Date().toISOString(),
  };
}
