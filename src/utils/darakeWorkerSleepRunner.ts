import type { DarakeSleepSession } from './darakeSleepSession';
import { loadSleepSessions } from './darakeSleepSession';
import type { DarakeTask } from './darakeTaskQueue';
import { getNextRunnableTask, loadDarakeTaskQueue } from './darakeTaskQueue';

export type DarakeSleepRunRecord = {
  id: string;
  sessionId: string;
  taskId: string;
  action: string;
  result: 'ok' | 'ask-later' | 'blocked-hard' | 'skipped';
  note?: string;
  timestamp: string;
};

export type SleepRunnerResult = {
  sessionId: string;
  processedCount: number;
  records: DarakeSleepRunRecord[];
  nextStatus: DarakeSleepSession['status'];
};

/**
 * Worker/Cron-ready scaffold. No actual execution yet. Safe for import.
 */
export function processSleepSessionTick(
  session: DarakeSleepSession,
  tasks: DarakeTask[]
): SleepRunnerResult {
  // TODO: load active session if available
  // TODO: pick next runnable task (use getNextRunnableTask)
  void getNextRunnableTask(tasks);

  return {
    sessionId: session.id,
    processedCount: 0,
    records: [],
    nextStatus: session.status,
  };
}

// Scaffold: can be wired to Worker/Cron. Currently reads/writes localStorage only.
export function runSleepSessionOnce(sessionId: string): SleepRunnerResult | null {
  const sessions = loadSleepSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const allTasks = loadDarakeTaskQueue();
  const sessionTasks = allTasks.filter((t) => session.taskIds.includes(t.id));

  return processSleepSessionTick(session, sessionTasks);
}
