import { loadGitHubOperationCandidates } from './githubOperationCandidate';
import { loadWorkflowDispatchCandidates } from './workflowDispatchCandidateDraft';

export type GitHubSemiAutomationCompletionReport = {
  totalCandidates: number;
  safeDraftOperations: string[];
  manualGateOperations: string[];
  blockedOperations: string[];
  workflowDrafts: string[];
  nextRecommendations: string[];
};

export function buildGitHubSemiAutomationCompletionReport(): GitHubSemiAutomationCompletionReport {
  const candidates = loadGitHubOperationCandidates();
  const workflows = loadWorkflowDispatchCandidates();

  const safeDraftOperations = candidates.filter((c) => c.risk === 'safe-draft').map((c) => c.title || c.type);
  const manualGateOperations = candidates.filter((c) => c.risk === 'manual-gate' || c.risk === 'review-needed').map((c) => c.title || c.type);
  const blockedOperations = candidates.filter((c) => c.risk === 'blocked').map((c) => c.title || c.type);
  const workflowDrafts = workflows.map((w) => `${w.workflowName} (${w.status})`);

  const nextRecommendations: string[] = [];
  if (safeDraftOperations.length > 0) {
    nextRecommendations.push('下書き操作を確認してGitHubで手動実行する');
  }
  if (manualGateOperations.length > 0) {
    nextRecommendations.push('手動ゲート操作のチェックリストを確認する');
  }
  if (blockedOperations.length > 0) {
    nextRecommendations.push('ブロック中の操作の原因を解決する');
  }
  nextRecommendations.push('PR Merge候補ゲートで全チェックを通過させる');
  nextRecommendations.push('Phase 26 で GitHub実行連携へ進む（manual gate前提）');

  return {
    totalCandidates: candidates.length,
    safeDraftOperations,
    manualGateOperations,
    blockedOperations,
    workflowDrafts,
    nextRecommendations,
  };
}

export function formatGitHubSemiAutomationCompletionReportMarkdown(
  report: GitHubSemiAutomationCompletionReport,
): string {
  return [
    '# GitHub半自動化 完成レポート',
    '',
    `- 総候補数: ${report.totalCandidates}`,
    `- 下書き操作: ${report.safeDraftOperations.length}件`,
    `- 手動ゲート: ${report.manualGateOperations.length}件`,
    `- ブロック: ${report.blockedOperations.length}件`,
    `- Workflowドラフト: ${report.workflowDrafts.length}件`,
    '',
    '## 下書き操作',
    report.safeDraftOperations.length > 0 ? report.safeDraftOperations.map((o) => `- ${o}`).join('\n') : '- なし',
    '',
    '## 手動ゲート操作',
    report.manualGateOperations.length > 0 ? report.manualGateOperations.map((o) => `- ${o}`).join('\n') : '- なし',
    '',
    '## Workflowドラフト',
    report.workflowDrafts.length > 0 ? report.workflowDrafts.map((w) => `- ${w}`).join('\n') : '- なし',
    '',
    '## 次のおすすめ',
    ...report.nextRecommendations.map((r) => `- ${r}`),
    '',
    '## 安全方針',
    '- 自動dispatch実行なし',
    '- 自動merge実行なし',
    '- 自動Issue/PR作成なし',
    '- 全操作は GitHub で手動実行',
  ].join('\n');
}
