import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.githubIssueCreateState.v1';

export type GitHubIssueCreateState = {
  repoUrl: string;
  updatedAt: string;
};

export function loadGitHubIssueCreateState(): GitHubIssueCreateState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GitHubIssueCreateState;
  } catch {
    return null;
  }
}

export function saveGitHubIssueCreateState(
  state: Omit<GitHubIssueCreateState, 'updatedAt'>,
): void {
  try {
    const toSave: GitHubIssueCreateState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}
