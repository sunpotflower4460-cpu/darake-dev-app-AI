import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.agentRunState.v1';

export type AgentRunStatus =
  | 'idle'
  | 'issue-created'
  | 'assigned-to-agent'
  | 'agent-working'
  | 'pr-created'
  | 'checks-running'
  | 'needs-agent-fix'
  | 'ready-to-review'
  | 'needs-human'
  | 'done'
  | 'failed';

export type AgentRunState = {
  status: AgentRunStatus;
  appName: string;
  repoUrl: string;
  issueUrl?: string;
  issueNumber?: number;
  prUrl?: string;
  prNumber?: number;
  lastCheckAt?: string;
  nextActionLabel: string;
  userMessage: string;
  error?: string;
  updatedAt: string;
};

export function loadAgentRunState(): AgentRunState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AgentRunState;
  } catch {
    return null;
  }
}

export function saveAgentRunState(state: Omit<AgentRunState, 'updatedAt'>): void {
  try {
    const toSave: AgentRunState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function clearAgentRunState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function buildInitialAgentRunState(appName: string, repoUrl: string): Omit<AgentRunState, 'updatedAt'> {
  return {
    status: 'idle',
    appName,
    repoUrl,
    nextActionLabel: 'Issueを作成してください',
    userMessage: 'まだ作業を開始していません。',
  };
}
