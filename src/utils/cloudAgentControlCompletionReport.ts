import type { CloudAgentJob } from './cloudAgentJob';
import type { CloudAgentResultRecord } from './cloudAgentResultRecord';

export type CloudAgentControlCompletionReport = {
  title: string;
  generatedAt: string;
  draftJobs: CloudAgentJob[];
  runningJobs: CloudAgentJob[];
  mergedJobs: CloudAgentJob[];
  failedJobs: CloudAgentJob[];
  retryRecommendations: string[];
  nextPhaseRecommendations: string[];
  todayTopJob: CloudAgentJob | null;
  resultRecords: CloudAgentResultRecord[];
};

export function buildCloudAgentControlCompletionReport(params: {
  jobs: CloudAgentJob[];
  resultRecords: CloudAgentResultRecord[];
}): CloudAgentControlCompletionReport {
  const { jobs, resultRecords } = params;

  const draftJobs = jobs.filter((j) => j.status === 'draft' || j.status === 'copied');
  const runningJobs = jobs.filter((j) => j.status === 'running' || j.status === 'sent-manually' || j.status === 'pr-created');
  const mergedJobs = jobs.filter((j) => j.status === 'merged' || j.status === 'done');
  const failedJobs = jobs.filter((j) => j.status === 'failed' || j.status === 'needs-retry');

  const retryRecommendations = failedJobs.map((j) => `「${j.title}」の再指示を生成する`);
  const nextPhaseRecommendations = [
    'Phase 30: だらけワンボタン候補を実装する',
    'Phase 31: Human Check Minimal Mode を実装する',
  ];

  const todayTopJob =
    failedJobs[0] ?? runningJobs[0] ?? draftJobs[0] ?? null;

  return {
    title: 'Cloud Agent Control Completion Report',
    generatedAt: new Date().toISOString(),
    draftJobs,
    runningJobs,
    mergedJobs,
    failedJobs,
    retryRecommendations,
    nextPhaseRecommendations,
    todayTopJob,
    resultRecords,
  };
}

export function formatCloudAgentControlCompletionReportMarkdown(
  report: CloudAgentControlCompletionReport
): string {
  const lines: string[] = [
    `# ${report.title}`,
    `生成日時: ${report.generatedAt}`,
    '',
    `## Draft Jobs (${report.draftJobs.length}件)`,
    ...(report.draftJobs.length > 0 ? report.draftJobs.map((j) => `- ${j.title}`) : ['(なし)']),
    '',
    `## Running Jobs (${report.runningJobs.length}件)`,
    ...(report.runningJobs.length > 0 ? report.runningJobs.map((j) => `- ${j.title}`) : ['(なし)']),
    '',
    `## Merged / Done Jobs (${report.mergedJobs.length}件)`,
    ...(report.mergedJobs.length > 0 ? report.mergedJobs.map((j) => `- ✅ ${j.title}`) : ['(なし)']),
    '',
    `## Failed Jobs (${report.failedJobs.length}件)`,
    ...(report.failedJobs.length > 0 ? report.failedJobs.map((j) => `- ❌ ${j.title}`) : ['(なし)']),
    '',
    `## Retry 候補`,
    ...(report.retryRecommendations.length > 0 ? report.retryRecommendations.map((r) => `- ${r}`) : ['(なし)']),
    '',
    `## Next Phase 候補`,
    ...report.nextPhaseRecommendations.map((r) => `- ${r}`),
    '',
    `## 今日やるべき1件`,
    report.todayTopJob ? `→ 「${report.todayTopJob.title}」(${report.todayTopJob.status})` : '(なし)',
  ];
  return lines.join('\n');
}
