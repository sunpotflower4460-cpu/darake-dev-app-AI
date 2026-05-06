import type { GitHubExecutionRecord } from './githubExecutionRecord';

export type GitHubDryRunCompletionReport = {
  title: string;
  generatedAt: string;
  issueCandidates: string[];
  prCandidates: string[];
  workflowDispatchCandidates: string[];
  mergeCandidates: string[];
  blockedOperations: string[];
  executedRecords: GitHubExecutionRecord[];
  nextRecommendations: string[];
  summary: string;
};

export function buildGitHubDryRunCompletionReport(
  partial: Partial<GitHubDryRunCompletionReport>
): GitHubDryRunCompletionReport {
  return {
    title: 'GitHub Dry-run Completion Report',
    generatedAt: new Date().toISOString(),
    issueCandidates: [],
    prCandidates: [],
    workflowDispatchCandidates: [],
    mergeCandidates: [],
    blockedOperations: [],
    executedRecords: [],
    nextRecommendations: [
      'Issue作成dry-runで準備が整ったものを人間がGitHubで作成する',
      'PR作成dry-runで準備が整ったものを人間がGitHubで作成する',
      'merge dry-run gate を確認して問題なければ人間がmergeする',
      '実行記録を GitHub Execution Record に残す',
    ],
    summary: '',
    ...partial,
  };
}

export function formatGitHubDryRunCompletionReportMarkdown(
  report: GitHubDryRunCompletionReport
): string {
  const lines: string[] = [
    `# ${report.title}`,
    `生成日時: ${report.generatedAt}`,
    '',
    `## Issue 候補 (${report.issueCandidates.length}件)`,
    ...(report.issueCandidates.length > 0 ? report.issueCandidates.map((c) => `- ${c}`) : ['(なし)']),
    '',
    `## PR 候補 (${report.prCandidates.length}件)`,
    ...(report.prCandidates.length > 0 ? report.prCandidates.map((c) => `- ${c}`) : ['(なし)']),
    '',
    `## Workflow Dispatch 候補 (${report.workflowDispatchCandidates.length}件)`,
    ...(report.workflowDispatchCandidates.length > 0 ? report.workflowDispatchCandidates.map((c) => `- ${c}`) : ['(なし)']),
    '',
    `## Merge 候補 (${report.mergeCandidates.length}件)`,
    ...(report.mergeCandidates.length > 0 ? report.mergeCandidates.map((c) => `- ${c}`) : ['(なし)']),
    '',
    `## Blocked 操作 (${report.blockedOperations.length}件)`,
    ...(report.blockedOperations.length > 0 ? report.blockedOperations.map((c) => `- ⛔ ${c}`) : ['(なし)']),
    '',
    `## 実行済み記録 (${report.executedRecords.length}件)`,
    ...(report.executedRecords.length > 0
      ? report.executedRecords.map((r) => `- [${r.status}] ${r.title} (${r.operationType})`)
      : ['(なし)']),
    '',
    `## 次におすすめ`,
    ...report.nextRecommendations.map((r) => `- ${r}`),
    '',
    `> ⛔ すべて dry-run です。GitHub API は実行しません。`,
  ];
  return lines.join('\n');
}
