export type TestRunStatus =
  | 'idle'
  | 'ready'
  | 'issue-created'
  | 'agent-started'
  | 'pr-waiting'
  | 'pr-found'
  | 'checks-running'
  | 'fix-loop-tested'
  | 'merge-candidate'
  | 'done'
  | 'failed';

export type TestRunState = {
  status: TestRunStatus;
  appName: string;
  repoUrl: string;
  issueUrl?: string;
  prUrl?: string;
  userMessage: string;
  nextActionLabel: string;
  updatedAt: string;
};

const STORAGE_KEY = 'darake.testRunState.v1';

export function loadTestRunState(): TestRunState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TestRunState;
  } catch {
    return null;
  }
}

export function saveTestRunState(state: Omit<TestRunState, 'updatedAt'>): TestRunState {
  const full: TestRunState = { ...state, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    // ignore
  }
  return full;
}

export function resetTestRunState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const TREASURE_MAP_PRESET = {
  appName: '宝地図メモ帳',
  oneLineIdea: '断片メモからAI画像を生成して宝地図にする',
  targetUser: '右脳型で夢を叶えたい人',
  platform: 'not-sure' as const,
  uiTemplate: 'map-board' as const,
  mainFeeling: 'beautiful' as const,
  firstGoal: 'usable-mvp' as const,
};
