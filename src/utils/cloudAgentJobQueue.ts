import type { CloudAgentJob } from './cloudAgentJob';

export type CloudAgentJobQueue = {
  title: string;
  status: 'empty' | 'has-drafts' | 'has-running' | 'needs-attention';
  jobs: CloudAgentJob[];
  nextJob: CloudAgentJob | null;
  blockedJobs: CloudAgentJob[];
  nextActions: string[];
};

export function buildCloudAgentJobQueue(jobs: CloudAgentJob[]): CloudAgentJobQueue {
  const drafts = jobs.filter((j) => j.status === 'draft' || j.status === 'copied');
  const running = jobs.filter((j) => j.status === 'running' || j.status === 'sent-manually');
  const failed = jobs.filter((j) => j.status === 'failed' || j.status === 'needs-retry');

  let status: CloudAgentJobQueue['status'] = 'empty';
  if (failed.length > 0) status = 'needs-attention';
  else if (running.length > 0) status = 'has-running';
  else if (drafts.length > 0) status = 'has-drafts';

  const nextJob = drafts[0] ?? null;

  const nextActions: string[] = [];
  if (failed.length > 0) nextActions.push(`失敗ジョブ ${failed.length}件 の再指示を生成する`);
  if (running.length > 0) nextActions.push(`実行中ジョブ ${running.length}件 の結果を確認する`);
  if (nextJob) nextActions.push(`次のジョブ「${nextJob.title}」の指示書をCloud Agentに渡す`);
  if (nextActions.length === 0) nextActions.push('新しいジョブをdraftする');

  return {
    title: 'Cloud Agent Job Queue',
    status,
    jobs,
    nextJob,
    blockedJobs: failed,
    nextActions,
  };
}

export function formatCloudAgentJobQueueMarkdown(queue: CloudAgentJobQueue): string {
  const lines: string[] = [
    `# Cloud Agent Job Queue`,
    `status: ${queue.status}`,
    '',
    `## Jobs (${queue.jobs.length}件)`,
    ...queue.jobs.map((j) => `- [${j.status}] ${j.title} (${j.phaseLabel})`),
    '',
    `## Next Job`,
    queue.nextJob ? `${queue.nextJob.title} (${queue.nextJob.phaseLabel})` : '(なし)',
    '',
    `## Blocked Jobs (${queue.blockedJobs.length}件)`,
    ...(queue.blockedJobs.length > 0 ? queue.blockedJobs.map((j) => `- ⛔ ${j.title}`) : ['(なし)']),
    '',
    `## Next Actions`,
    ...queue.nextActions.map((a) => `- ${a}`),
  ];
  return lines.join('\n');
}
