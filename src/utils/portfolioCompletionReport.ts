import type { RegisteredApp } from './appRegistry';
import type { PortfolioDashboard } from './portfolioDashboard';

export type PortfolioCompletionReport = {
  totalApps: number;
  developing: number;
  submissionPrep: number;
  released: number;
  blocked: number;
  todayFocusApps: string[];
  nextRecommendations: string[];
  monthlyPolicy: string;
};

export function buildPortfolioCompletionReport(
  apps: RegisteredApp[],
  dash: PortfolioDashboard,
): PortfolioCompletionReport {
  const recommendations: string[] = [];

  if (dash.blockedCount > 0) recommendations.push(`🔴 ブロック中アプリを${dash.blockedCount}件解消してください`);
  if (dash.submissionPrepCount > 0) recommendations.push(`📦 ${dash.submissionPrepCount}件が提出準備中です`);
  if (dash.dreamCoreCount > 0) recommendations.push(`⭐ dream-coreアプリを優先して進めてください`);
  if (dash.staleApps.length > 0) recommendations.push(`💤 放置気味のアプリが${dash.staleApps.length}件あります`);
  if (recommendations.length === 0) recommendations.push('✨ 全アプリ順調です！次のアイデアを温めましょう');

  const monthlyPolicy =
    dash.blockedCount > 0
      ? '今月はブロック解消を最優先にしてください'
      : dash.submissionPrepCount > 0
        ? '今月は提出を完了させましょう'
        : dash.developmentCount > 0
          ? '今月は開発中アプリを1本完成に近づけましょう'
          : '今月は新しいアイデアを1件計画してみましょう';

  return {
    totalApps: apps.length,
    developing: dash.developmentCount,
    submissionPrep: dash.submissionPrepCount,
    released: dash.releasedCount,
    blocked: dash.blockedCount,
    todayFocusApps: dash.todayApps.map((a) => a.name),
    nextRecommendations: recommendations,
    monthlyPolicy,
  };
}

export function formatPortfolioCompletionReportMarkdown(report: PortfolioCompletionReport): string {
  return [
    '# ポートフォリオ 完成レポート',
    '',
    `- **全アプリ数**: ${report.totalApps}`,
    `- **開発中**: ${report.developing}`,
    `- **提出準備中**: ${report.submissionPrep}`,
    `- **公開済み**: ${report.released}`,
    `- **ブロック中**: ${report.blocked}`,
    '',
    '## 今日見るべきもの',
    ...report.todayFocusApps.map((a) => `- ${a}`),
    report.todayFocusApps.length === 0 ? '（なし）' : '',
    '',
    '## おすすめ',
    ...report.nextRecommendations.map((r) => `- ${r}`),
    '',
    `## 今月の方針`,
    report.monthlyPolicy,
    '',
    '## Safety Note',
    '- 外部API連携なし',
    '- 本番操作は手動で行ってください',
  ].join('\n');
}
