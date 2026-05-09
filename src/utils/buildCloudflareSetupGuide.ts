import type { SettingsHealthSummary } from './settingsHealth';

/**
 * Generates a Cloudflare setup guide that lists only the missing/blocked settings.
 * Never includes token values — only variable names.
 */
export function buildCloudflareSetupGuide(summary: SettingsHealthSummary): string {
  const lines: string[] = [
    '# Cloudflare側で必要な設定',
    '不足している設定だけを表示しています。',
    '',
  ];

  const githubItems = summary.items.filter(
    (i) =>
      (i.level === 'missing' || i.level === 'blocked') &&
      (i.id === 'github-token' || i.id === 'github-allowlist' || i.id === 'github-issue-create' || i.id === 'github-merge'),
  );

  const kvItems = summary.items.filter(
    (i) =>
      (i.level === 'missing' || i.level === 'blocked') &&
      (i.id === 'kv-configured' || i.id === 'kv-registry-enabled'),
  );

  const notifItems = summary.items.filter(
    (i) =>
      (i.level === 'missing' || i.level === 'blocked') &&
      (i.id === 'telegram' || i.id === 'webhook'),
  );

  const cronItems = summary.items.filter(
    (i) => (i.level === 'missing' || i.level === 'blocked') && i.id === 'cron',
  );

  if (githubItems.length > 0) {
    lines.push('## GitHub連携');
    lines.push('設定してください：');
    if (githubItems.some((i) => i.id === 'github-token')) {
      lines.push('- GITHUB_TOKEN');
    }
    if (githubItems.some((i) => i.id === 'github-allowlist')) {
      lines.push('- GITHUB_ALLOWED_REPOS');
    }
    if (githubItems.some((i) => i.id === 'github-issue-create')) {
      lines.push('- GITHUB_ISSUE_CREATE_ENABLED=true');
    }
    if (githubItems.some((i) => i.id === 'github-merge')) {
      lines.push('- GITHUB_AGENT_ASSIGN_ENABLED=true');
    }
    lines.push('');
  }

  if (kvItems.length > 0) {
    lines.push('## 裏巡回');
    lines.push('設定してください：');
    if (kvItems.some((i) => i.id === 'kv-configured')) {
      lines.push('- RUN_REGISTRY_KV（KVバインディング）');
    }
    if (kvItems.some((i) => i.id === 'kv-registry-enabled')) {
      lines.push('- DARAKE_RUN_REGISTRY_ENABLED=true');
    }
    lines.push('');
  }

  if (notifItems.length > 0) {
    lines.push('## 通知');
    lines.push('設定してください：');
    if (notifItems.some((i) => i.id === 'telegram')) {
      lines.push('- TELEGRAM_BOT_TOKEN');
      lines.push('- TELEGRAM_CHAT_ID');
    }
    if (notifItems.some((i) => i.id === 'webhook')) {
      lines.push('- NOTIFICATION_WEBHOOK_URL（省略可）');
    }
    lines.push('');
  }

  if (cronItems.length > 0) {
    lines.push('## 定期実行');
    lines.push('設定してください：');
    lines.push('- DARAKE_AUTOPILOT_SCHEDULE_ENABLED=true');
    lines.push('');
  }

  if (githubItems.length === 0 && kvItems.length === 0 && notifItems.length === 0 && cronItems.length === 0) {
    lines.push('不足している設定はありません。');
  }

  return lines.join('\n');
}
