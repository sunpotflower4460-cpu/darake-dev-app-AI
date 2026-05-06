import type { RegisteredApp } from './appRegistry';

export type PortfolioDashboard = {
  totalApps: number;
  ideaCount: number;
  developmentCount: number;
  submissionPrepCount: number;
  releasedCount: number;
  blockedCount: number;
  dreamCoreCount: number;
  todayApps: RegisteredApp[];
  staleApps: RegisteredApp[];
  nextProgressApps: RegisteredApp[];
};

const STALE_DAYS = 7;

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function buildPortfolioDashboard(apps: RegisteredApp[]): PortfolioDashboard {
  const ideaCount = apps.filter((a) => a.lifecycleStage === 'idea').length;
  const developmentCount = apps.filter((a) => a.lifecycleStage === 'development').length;
  const submissionPrepCount = apps.filter((a) => a.lifecycleStage === 'submission-prep').length;
  const releasedCount = apps.filter((a) => a.lifecycleStage === 'released').length;
  const blockedCount = apps.filter((a) => a.riskLevel === 'blocked').length;
  const dreamCoreCount = apps.filter((a) => a.priority === 'dream-core').length;

  const todayApps = apps.filter(
    (a) => a.riskLevel === 'blocked' || a.riskLevel === 'manual-gate' || a.priority === 'dream-core',
  );

  const staleApps = apps.filter((a) => daysSince(a.lastUpdatedAt) >= STALE_DAYS);

  const nextProgressApps = apps.filter(
    (a) =>
      a.lifecycleStage === 'development' ||
      a.lifecycleStage === 'testing' ||
      a.lifecycleStage === 'submission-prep',
  );

  return {
    totalApps: apps.length,
    ideaCount,
    developmentCount,
    submissionPrepCount,
    releasedCount,
    blockedCount,
    dreamCoreCount,
    todayApps,
    staleApps,
    nextProgressApps,
  };
}

export function formatPortfolioDashboardMarkdown(dash: PortfolioDashboard): string {
  return [
    '# ポートフォリオ ダッシュボード',
    '',
    `- **全アプリ数**: ${dash.totalApps}`,
    `- **アイデア**: ${dash.ideaCount}`,
    `- **開発中**: ${dash.developmentCount}`,
    `- **提出準備中**: ${dash.submissionPrepCount}`,
    `- **公開済み**: ${dash.releasedCount}`,
    `- **ブロック中**: ${dash.blockedCount}`,
    `- **dream-core**: ${dash.dreamCoreCount}`,
    '',
    '## 今日見るべきもの',
    ...dash.todayApps.map((a) => `- ${a.name} (${a.lifecycleStage})`),
    dash.todayApps.length === 0 ? '（なし）' : '',
    '',
    '## 放置気味のアプリ',
    ...dash.staleApps.map((a) => `- ${a.name}`),
    dash.staleApps.length === 0 ? '（なし）' : '',
    '',
    '## 次に進めると良いアプリ',
    ...dash.nextProgressApps.map((a) => `- ${a.name} (${a.nextAction || '要確認'})`),
    dash.nextProgressApps.length === 0 ? '（なし）' : '',
  ].join('\n');
}
