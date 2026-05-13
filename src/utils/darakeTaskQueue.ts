export type DarakeTaskStatus =
  | 'queued'
  | 'running'
  | 'done'
  | 'retrying'
  | 'ask-later'
  | 'skipped'
  | 'blocked-hard'
  | 'failed-soft';

export type DarakeTaskKind =
  | 'blueprint'
  | 'issue-create'
  | 'agent-run'
  | 'pr-watch'
  | 'ci-fix'
  | 'merge-review'
  | 'post-merge-check'
  | 'manual-note';

export type DarakeTask = {
  id: string;
  title: string;
  kind: DarakeTaskKind;
  status: DarakeTaskStatus;
  priority: number;
  appName?: string;
  repoUrl?: string;
  issueUrl?: string;
  prUrl?: string;
  dependsOn?: string[];
  laterReviewReason?: string;
  hardBlockReason?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
};

const TASK_QUEUE_KEY = 'darake.taskQueue.v1';

export function loadDarakeTaskQueue(): DarakeTask[] {
  try {
    const raw = localStorage.getItem(TASK_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DarakeTask[];
  } catch {
    return [];
  }
}

export function saveDarakeTaskQueue(tasks: DarakeTask[]): void {
  localStorage.setItem(TASK_QUEUE_KEY, JSON.stringify(tasks));
}

export function addDarakeTask(
  task: Omit<DarakeTask, 'id' | 'createdAt' | 'updatedAt'>
): DarakeTask {
  const tasks = loadDarakeTaskQueue();
  const now = new Date().toISOString();
  const newTask: DarakeTask = {
    ...task,
    id: `task-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  saveDarakeTaskQueue(tasks);
  return newTask;
}

export function updateDarakeTask(
  id: string,
  patch: Partial<DarakeTask>
): DarakeTask[] {
  const tasks = loadDarakeTaskQueue();
  const updated = tasks.map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
  );
  saveDarakeTaskQueue(updated);
  return updated;
}

export function getNextRunnableTask(tasks: DarakeTask[]): DarakeTask | null {
  const doneIds = new Set(tasks.filter((t) => t.status === 'done').map((t) => t.id));
  const runnable = tasks.filter((t) => {
    if (t.status !== 'queued') return false;
    if (t.dependsOn && t.dependsOn.length > 0) {
      return t.dependsOn.every((dep) => doneIds.has(dep));
    }
    return true;
  });
  if (runnable.length === 0) return null;
  runnable.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.createdAt.localeCompare(b.createdAt);
  });
  return runnable[0];
}

export function moveTaskToAskLater(id: string, reason: string): DarakeTask[] {
  return updateDarakeTask(id, { status: 'ask-later', laterReviewReason: reason });
}

export function moveTaskToBlockedHard(id: string, reason: string): DarakeTask[] {
  return updateDarakeTask(id, { status: 'blocked-hard', hardBlockReason: reason });
}

export function isHardStopTask(task: DarakeTask): boolean {
  return task.status === 'blocked-hard';
}

export function isLaterReviewTask(task: DarakeTask): boolean {
  return task.status === 'ask-later';
}

export function getTaskStatusLabel(status: DarakeTaskStatus): string {
  switch (status) {
    case 'ask-later': return '後で聞く';
    case 'blocked-hard': return 'Hard Stop';
    case 'failed-soft': return '軽い失敗・次へ';
    case 'retrying': return '再試行中';
    case 'queued': return '待機中';
    case 'running': return '進行中';
    case 'done': return '完了';
    case 'skipped': return 'スキップ';
    default: return status;
  }
}

export function getTaskStatusTone(status: DarakeTaskStatus): string {
  switch (status) {
    case 'ask-later': return 'amber';
    case 'blocked-hard': return 'red';
    case 'done': return 'green';
    case 'running': return 'blue';
    case 'failed-soft': return 'soft';
    case 'retrying': return 'blue';
    default: return 'gray';
  }
}
