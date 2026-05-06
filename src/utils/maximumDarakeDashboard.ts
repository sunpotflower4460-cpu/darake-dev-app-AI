// Phase 35.2: Maximum Darake Dashboard

export type MaximumDarakeDashboard = {
  title: string;
  status:
    | 'quiet'
    | 'running-safely'
    | 'needs-later-review'
    | 'needs-human-now'
    | 'blocked';
  headline: string;
  autoCompletedCount: number;
  batchedWarningCount: number;
  reviewInboxCount: number;
  urgentCount: number;
  oneThingToSee: string;
  recommendedHumanAction: string;
  detailsMarkdown: string;
};

export const DASHBOARD_STATUS_LABELS: Record<MaximumDarakeDashboard['status'], string> = {
  quiet: '静か（今は何もない）',
  'running-safely': 'だいたい順調',
  'needs-later-review': 'あとで見ればいい',
  'needs-human-now': '今すぐ人間が必要',
  blocked: 'ブロック中',
};

export const DASHBOARD_STATUS_ICONS: Record<MaximumDarakeDashboard['status'], string> = {
  quiet: '😴',
  'running-safely': '✅',
  'needs-later-review': '📋',
  'needs-human-now': '👤',
  blocked: '🚫',
};

export function buildMaximumDarakeDashboard(
  partial: Partial<MaximumDarakeDashboard> & Pick<MaximumDarakeDashboard, 'title'>
): MaximumDarakeDashboard {
  return {
    status: 'quiet',
    headline: '',
    autoCompletedCount: 0,
    batchedWarningCount: 0,
    reviewInboxCount: 0,
    urgentCount: 0,
    oneThingToSee: '',
    recommendedHumanAction: '',
    detailsMarkdown: '',
    ...partial,
  };
}

export function formatMaximumDarakeDashboardMarkdown(
  dashboard: MaximumDarakeDashboard
): string {
  const icon = DASHBOARD_STATUS_ICONS[dashboard.status];
  const statusLabel = DASHBOARD_STATUS_LABELS[dashboard.status];
  const lines = [
    `# ${dashboard.title}`,
    '',
    `**今の状態:** ${icon} ${statusLabel}`,
    `**ヘッドライン:** ${dashboard.headline || '（なし）'}`,
    '',
    `## サマリー`,
    `- 裏で進めたこと: **${dashboard.autoCompletedCount}件**`,
    `- warningまとめ: **${dashboard.batchedWarningCount}件**`,
    `- あとで見ればいいこと: **${dashboard.reviewInboxCount}件**`,
    `- 本当に見る必要があること: **${dashboard.urgentCount}件**`,
    '',
    `## 今見るべきもの`,
    dashboard.oneThingToSee || '（なし）',
    '',
    `## 推奨アクション`,
    dashboard.recommendedHumanAction || '（なし）',
  ];
  if (dashboard.detailsMarkdown) {
    lines.push('', '## 詳細', dashboard.detailsMarkdown);
  }
  return lines.join('\n');
}
