import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.autopilotState.v1';

export type DarakeAutopilotStatus =
  | 'off'
  | 'idle'
  | 'starting'
  | 'issue-creating'
  | 'agent-working'
  | 'watching-pr'
  | 'auto-fixing'
  | 'waiting-for-checks'
  | 'merge-candidate'
  | 'needs-human'
  | 'blocked'
  | 'done'
  | 'failed';

export type DarakeAutopilotState = {
  enabled: boolean;
  status: DarakeAutopilotStatus;
  appName?: string;
  repoUrl?: string;
  issueUrl?: string;
  issueNumber?: number;
  prUrl?: string;
  prNumber?: number;
  autoFixAttempts: number;
  maxAutoFixAttempts: number;
  lastAutopilotRunAt?: string;
  lastHumanVisibleEventAt?: string;
  userMessage: string;
  nextActionLabel: string;
  shouldWakeUser: boolean;
  wakeReason?: string;
  error?: string;
  updatedAt: string;
};

export const INITIAL_AUTOPILOT_STATE: Omit<DarakeAutopilotState, 'updatedAt'> = {
  enabled: true,
  status: 'idle',
  autoFixAttempts: 0,
  maxAutoFixAttempts: 2,
  userMessage: 'まだ自律運転は始まっていません',
  nextActionLabel: 'この内容で作り始める',
  shouldWakeUser: false,
};

export function loadDarakeAutopilotState(): DarakeAutopilotState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DarakeAutopilotState;
  } catch {
    return null;
  }
}

export function saveDarakeAutopilotState(
  state: Omit<DarakeAutopilotState, 'updatedAt'>,
): void {
  try {
    const toSave: DarakeAutopilotState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function clearDarakeAutopilotState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function loadOrInitDarakeAutopilotState(): DarakeAutopilotState {
  return (
    loadDarakeAutopilotState() ?? {
      ...INITIAL_AUTOPILOT_STATE,
      updatedAt: new Date().toISOString(),
    }
  );
}
