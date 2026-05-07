import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.autoFixLoopState.v1';

export type AutoFixLoopStatus =
  | 'idle'
  | 'checking'
  | 'needs-fix'
  | 'fix-instruction-ready'
  | 'fix-comment-posted'
  | 'waiting-for-agent'
  | 'checks-passed'
  | 'merge-candidate'
  | 'needs-human'
  | 'failed';

export type AutoFixLoopState = {
  status: AutoFixLoopStatus;
  repoUrl: string;
  issueUrl?: string;
  issueNumber?: number;
  prUrl?: string;
  prNumber?: number;
  attemptCount: number;
  maxAttempts: number;
  lastFailureSummary?: string;
  lastInstruction?: string;
  lastCommentUrl?: string;
  userMessage: string;
  nextActionLabel: string;
  updatedAt: string;
};

export function loadAutoFixLoopState(): AutoFixLoopState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AutoFixLoopState;
  } catch {
    return null;
  }
}

export function saveAutoFixLoopState(state: Omit<AutoFixLoopState, 'updatedAt'>): void {
  try {
    const toSave: AutoFixLoopState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function clearAutoFixLoopState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function buildInitialAutoFixLoopState(repoUrl: string): Omit<AutoFixLoopState, 'updatedAt'> {
  return {
    status: 'idle',
    repoUrl,
    attemptCount: 0,
    maxAttempts: 2,
    userMessage: 'まだ自動修正は始まっていません',
    nextActionLabel: 'PRを確認する',
  };
}
