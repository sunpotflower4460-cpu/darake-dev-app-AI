import type { GitHubDryRunOperationType } from './githubDryRunOperation';

export type GitHubExecutionRecordStatus =
  | 'draft'
  | 'executed-manually'
  | 'skipped'
  | 'failed'
  | 'needs-follow-up';

export type GitHubExecutionRecord = {
  id: string;
  operationType: GitHubDryRunOperationType;
  title: string;
  targetRepo: string;
  resultUrl: string;
  status: GitHubExecutionRecordStatus;
  executedAt: string;
  executedBy: 'human';
  followUpNeeded: boolean;
  notes: string;
};

const STORAGE_KEY = 'darake.githubExecutionRecords.v1';

export function loadGitHubExecutionRecords(): GitHubExecutionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GitHubExecutionRecord[];
  } catch {
    return [];
  }
}

export function saveGitHubExecutionRecords(records: GitHubExecutionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function addGitHubExecutionRecord(record: GitHubExecutionRecord): void {
  const records = loadGitHubExecutionRecords();
  saveGitHubExecutionRecords([record, ...records]);
}

export function buildGitHubExecutionRecord(
  partial: Partial<GitHubExecutionRecord> &
    Pick<GitHubExecutionRecord, 'operationType' | 'title' | 'targetRepo'>
): GitHubExecutionRecord {
  return {
    id: `exec-${crypto.randomUUID()}`,
    resultUrl: '',
    status: 'draft',
    executedAt: new Date().toISOString(),
    executedBy: 'human',
    followUpNeeded: false,
    notes: '',
    ...partial,
  };
}

export function formatGitHubExecutionRecordMarkdown(record: GitHubExecutionRecord): string {
  const lines: string[] = [
    `## GitHub Execution Record: ${record.title}`,
    '',
    `- **operationType**: ${record.operationType}`,
    `- **status**: ${record.status}`,
    `- **repo**: ${record.targetRepo}`,
    `- **resultUrl**: ${record.resultUrl || '(未入力)'}`,
    `- **executedAt**: ${record.executedAt}`,
    `- **executedBy**: ${record.executedBy}`,
    `- **followUpNeeded**: ${record.followUpNeeded ? 'Yes' : 'No'}`,
    '',
    `### Notes`,
    record.notes || '(なし)',
  ];
  return lines.join('\n');
}
