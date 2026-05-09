import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.omakaseStartState.v1';

export type OmakaseStartStatus =
  | 'idle'
  | 'preparing'
  | 'issue-created'
  | 'assigned-to-agent'
  | 'cloud-agent-ready'
  | 'blocked'
  | 'failed';

export type OmakaseStartState = {
  status: OmakaseStartStatus;
  appName: string;
  repoUrl: string;
  issueUrl?: string;
  issueNumber?: number;
  cloudAgentInstruction?: string;
  /** Long-form Cloud Agent instruction kept separate for copy-only use (not shown in main card). */
  fallbackInstruction?: string;
  nextActionLabel: string;
  userMessage: string;
  error?: string;
  updatedAt: string;
};

export function loadOmakaseStartState(): OmakaseStartState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OmakaseStartState;
  } catch {
    return null;
  }
}

export function saveOmakaseStartState(
  state: Omit<OmakaseStartState, 'updatedAt'>,
): void {
  try {
    const toSave: OmakaseStartState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function clearOmakaseStartState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}
