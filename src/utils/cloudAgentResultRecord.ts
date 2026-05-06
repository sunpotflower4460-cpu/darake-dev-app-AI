export type CloudAgentResultRecord = {
  id: string;
  jobId: string;
  prUrl: string;
  prNumber: string;
  branchName: string;
  status: 'pr-created' | 'ci-passed' | 'ci-failed' | 'merged' | 'failed' | 'needs-review';
  summary: string;
  filesChanged: string[];
  ciNotes: string;
  codeRabbitNotes: string;
  nextAction: string;
  createdAt: string;
};

const STORAGE_KEY = 'darake.cloudAgentResultRecords.v1';

export function loadCloudAgentResultRecords(): CloudAgentResultRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CloudAgentResultRecord[];
  } catch {
    return [];
  }
}

export function saveCloudAgentResultRecords(records: CloudAgentResultRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function addCloudAgentResultRecord(record: CloudAgentResultRecord): void {
  const records = loadCloudAgentResultRecords();
  saveCloudAgentResultRecords([record, ...records]);
}

export function buildCloudAgentResultRecord(
  partial: Partial<CloudAgentResultRecord> & Pick<CloudAgentResultRecord, 'jobId'>
): CloudAgentResultRecord {
  return {
    id: `ca-result-${Date.now()}`,
    prUrl: '',
    prNumber: '',
    branchName: '',
    status: 'pr-created',
    summary: '',
    filesChanged: [],
    ciNotes: '',
    codeRabbitNotes: '',
    nextAction: '',
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function formatCloudAgentResultRecordMarkdown(record: CloudAgentResultRecord): string {
  const lines: string[] = [
    `## Cloud Agent Result: job ${record.jobId}`,
    `- **status**: ${record.status}`,
    `- **prUrl**: ${record.prUrl || '(未入力)'}`,
    `- **prNumber**: ${record.prNumber || '(未入力)'}`,
    `- **branchName**: ${record.branchName || '(未入力)'}`,
    `- **createdAt**: ${record.createdAt}`,
    '',
    `### Summary`,
    record.summary || '(なし)',
    '',
    `### Files Changed`,
    ...(record.filesChanged.length > 0 ? record.filesChanged.map((f) => `- ${f}`) : ['(なし)']),
    '',
    `### CI Notes`,
    record.ciNotes || '(なし)',
    '',
    `### CodeRabbit Notes`,
    record.codeRabbitNotes || '(なし)',
    '',
    `### Next Action`,
    record.nextAction || '(なし)',
  ];
  return lines.join('\n');
}
