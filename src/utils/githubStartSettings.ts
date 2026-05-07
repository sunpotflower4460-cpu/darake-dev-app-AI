import {
  emitDarakeRuntimeEvent,
  DARAKE_GENTLE_FORM_UPDATED_EVENT,
} from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.githubStartSettings.v1';

export type GitHubStartMode =
  | 'copy-only'
  | 'open-issue-page'
  | 'cloud-agent'
  | 'both';

export type GitHubStartSettings = {
  repoUrl: string;
  mode: GitHubStartMode;
  updatedAt: string;
};

export function buildEmptyGitHubStartSettings(): GitHubStartSettings {
  return {
    repoUrl: '',
    mode: 'open-issue-page',
    updatedAt: new Date().toISOString(),
  };
}

export function loadGitHubStartSettings(): GitHubStartSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GitHubStartSettings;
  } catch {
    return null;
  }
}

export function saveGitHubStartSettings(settings: GitHubStartSettings): void {
  try {
    const toSave: GitHubStartSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function clearGitHubStartSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}
