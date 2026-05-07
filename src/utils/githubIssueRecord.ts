import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.githubIssueRecord.v1';

export type GitHubIssueRecord = {
  issueUrl: string;
  owner: string;
  repo: string;
  issueNumber: number;
  fullName: string;
  createdAt: string;
  updatedAt: string;
};

export function loadGitHubIssueRecord(): GitHubIssueRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GitHubIssueRecord;
  } catch {
    return null;
  }
}

export function saveGitHubIssueRecord(record: Omit<GitHubIssueRecord, 'createdAt' | 'updatedAt'>): GitHubIssueRecord {
  const now = new Date().toISOString();
  const existing = loadGitHubIssueRecord();
  const toSave: GitHubIssueRecord = {
    ...record,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
  return toSave;
}

export function clearGitHubIssueRecord(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}
