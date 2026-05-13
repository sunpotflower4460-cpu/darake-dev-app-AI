export type DarakeSleepSessionStatus =
  | 'draft'
  | 'ready'
  | 'running'
  | 'paused'
  | 'morning-ready'
  | 'done';

export type DarakeSleepSession = {
  id: string;
  title: string;
  status: DarakeSleepSessionStatus;
  taskIds: string[];
  maxTasks: number;
  maxAutoFixAttempts: number;
  hardStopRules: string[];
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const SLEEP_SESSION_KEY = 'darake.sleepSessions.v1';

export function loadSleepSessions(): DarakeSleepSession[] {
  try {
    const raw = localStorage.getItem(SLEEP_SESSION_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DarakeSleepSession[];
  } catch {
    return [];
  }
}

export function saveSleepSessions(sessions: DarakeSleepSession[]): void {
  localStorage.setItem(SLEEP_SESSION_KEY, JSON.stringify(sessions));
}

export function createSleepSessionFromQueue(
  taskIds: string[],
  title?: string
): DarakeSleepSession {
  const sessions = loadSleepSessions();
  const now = new Date().toISOString();
  const session: DarakeSleepSession = {
    id: `session-${crypto.randomUUID()}`,
    title: title ?? `今夜のセッション ${new Date().toLocaleDateString('ja-JP')}`,
    status: 'draft',
    taskIds,
    maxTasks: 5,
    maxAutoFixAttempts: 3,
    hardStopRules: [],
    createdAt: now,
    updatedAt: now,
  };
  sessions.push(session);
  saveSleepSessions(sessions);
  return session;
}

export function addTaskToSleepSession(
  sessionId: string,
  taskId: string
): DarakeSleepSession[] {
  const sessions = loadSleepSessions();
  const updated = sessions.map((s) => {
    if (s.id !== sessionId) return s;
    if (s.taskIds.includes(taskId)) return s;
    return {
      ...s,
      taskIds: [...s.taskIds, taskId],
      updatedAt: new Date().toISOString(),
    };
  });
  saveSleepSessions(updated);
  return updated;
}

export function markSleepSessionMorningReady(
  sessionId: string
): DarakeSleepSession[] {
  const sessions = loadSleepSessions();
  const updated = sessions.map((s) =>
    s.id === sessionId
      ? { ...s, status: 'morning-ready' as DarakeSleepSessionStatus, updatedAt: new Date().toISOString() }
      : s
  );
  saveSleepSessions(updated);
  return updated;
}
