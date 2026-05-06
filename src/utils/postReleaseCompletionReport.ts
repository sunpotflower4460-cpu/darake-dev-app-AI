import type { ReleaseRecord } from './releaseRecord';
import type { PostReleaseFeedback } from './postReleaseFeedbackRecord';

export type PostReleaseCompletionReport = {
  isReleased: boolean;
  totalFeedbacks: number;
  criticalCount: number;
  nextUpdateCandidates: string[];
  issueDraftedCount: number;
  pendingCount: number;
  recommendations: string[];
};

export function buildPostReleaseCompletionReport(
  release: ReleaseRecord,
  feedbacks: PostReleaseFeedback[],
): PostReleaseCompletionReport {
  const appFeedbacks = feedbacks.filter((f) => !f.appId || f.appId === release.appId);
  const criticalCount = appFeedbacks.filter((f) => f.priority === 'critical').length;
  const issueDraftedCount = appFeedbacks.filter((f) => f.status === 'issue-drafted').length;
  const pendingCount = appFeedbacks.filter((f) => f.status === 'new' || f.status === 'triaged').length;

  const nextUpdateCandidates = [
    ...release.knownIssues,
    ...release.nextUpdateIdeas,
    ...appFeedbacks.filter((f) => f.category === 'feature-request').map((f) => f.title),
  ].filter(Boolean);

  const recommendations: string[] = [];
  if (criticalCount > 0) recommendations.push(`🔴 criticalなフィードバックが${criticalCount}件あります。Issue化を優先してください。`);
  if (pendingCount > 0) recommendations.push(`⚠️ 未対応フィードバックが${pendingCount}件あります。`);
  if (issueDraftedCount > 0) recommendations.push(`✅ Issue下書き済み: ${issueDraftedCount}件`);
  if (nextUpdateCandidates.length > 0) recommendations.push(`💡 次アップデート候補が${nextUpdateCandidates.length}件あります。`);
  if (recommendations.length === 0) recommendations.push('✨ 現在、対応が必要な項目はありません。');

  return {
    isReleased: release.status === 'released',
    totalFeedbacks: appFeedbacks.length,
    criticalCount,
    nextUpdateCandidates,
    issueDraftedCount,
    pendingCount,
    recommendations,
  };
}

export function formatPostReleaseCompletionReportMarkdown(
  release: ReleaseRecord,
  report: PostReleaseCompletionReport,
): string {
  return [
    `# 公開後運用レポート: ${release.appName} v${release.version}`,
    '',
    `- **公開済み**: ${report.isReleased ? 'YES' : 'NO'}`,
    `- **フィードバック合計**: ${report.totalFeedbacks}件`,
    `- **critical件数**: ${report.criticalCount}件`,
    `- **Issue化済み**: ${report.issueDraftedCount}件`,
    `- **未対応**: ${report.pendingCount}件`,
    '',
    '## 次アップデート候補',
    ...report.nextUpdateCandidates.map((c) => `- ${c}`),
    report.nextUpdateCandidates.length === 0 ? '（なし）' : '',
    '',
    '## おすすめ',
    ...report.recommendations.map((r) => `- ${r}`),
    '',
    '## Safety Note',
    '- App Store等への操作は自動実行しません',
  ].join('\n');
}
