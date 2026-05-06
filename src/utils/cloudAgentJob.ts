export type CloudAgentJobStatus =
  | 'draft'
  | 'copied'
  | 'sent-manually'
  | 'running'
  | 'pr-created'
  | 'merged'
  | 'failed'
  | 'needs-retry'
  | 'done';

export type CloudAgentJob = {
  id: string;
  appId: string;
  appName: string;
  phaseLabel: string;
  title: string;
  instruction: string;
  targetRepo: string;
  expectedPrTitle: string;
  expectedFiles: string[];
  doneConditions: string[];
  safetyRules: string[];
  status: CloudAgentJobStatus;
  resultPrUrl: string;
  resultSummary: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'darake.cloudAgentJobs.v1';

export function loadCloudAgentJobs(): CloudAgentJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CloudAgentJob[];
  } catch {
    return [];
  }
}

export function saveCloudAgentJobs(jobs: CloudAgentJob[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // ignore
  }
}

export function addCloudAgentJob(job: CloudAgentJob): void {
  const jobs = loadCloudAgentJobs();
  saveCloudAgentJobs([job, ...jobs]);
}

export function buildCloudAgentJob(
  partial: Partial<CloudAgentJob> & Pick<CloudAgentJob, 'title' | 'targetRepo' | 'phaseLabel'>
): CloudAgentJob {
  const now = new Date().toISOString();
  return {
    id: `ca-job-${Date.now()}`,
    appId: '',
    appName: '',
    instruction: '',
    expectedPrTitle: '',
    expectedFiles: [],
    doneConditions: [],
    safetyRules: [
      'GitHub APIを実行しない',
      'secretを保存しない',
      '本番deployをしない',
    ],
    status: 'draft',
    resultPrUrl: '',
    resultSummary: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function formatCloudAgentJobMarkdown(job: CloudAgentJob): string {
  const lines: string[] = [
    `## Cloud Agent Job: ${job.title}`,
    `Phase: ${job.phaseLabel}`,
    `repo: ${job.targetRepo}`,
    `status: ${job.status}`,
    '',
    `### Instruction`,
    job.instruction || '(未入力)',
    '',
    `### Expected PR Title`,
    job.expectedPrTitle || '(未入力)',
    '',
    `### Expected Files`,
    ...(job.expectedFiles.length > 0 ? job.expectedFiles.map((f) => `- ${f}`) : ['(未入力)']),
    '',
    `### Done Conditions`,
    ...(job.doneConditions.length > 0 ? job.doneConditions.map((d) => `- [ ] ${d}`) : ['(未入力)']),
    '',
    `### Safety Rules`,
    ...job.safetyRules.map((r) => `- ⛔ ${r}`),
    '',
    `> ⛔ Cloud Agent への自動送信はしません。コピーして人間が渡してください。`,
  ];
  return lines.join('\n');
}
