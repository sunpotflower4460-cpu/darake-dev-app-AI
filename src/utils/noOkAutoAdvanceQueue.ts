// Phase 34: No-OK Auto Advance Queue

export type AutoAdvanceTaskType =
  | 'generate-report'
  | 'generate-dry-run'
  | 'generate-prompt-pack'
  | 'generate-cloud-agent-instruction'
  | 'generate-notification-draft'
  | 'update-readiness-gate'
  | 'update-safety-audit'
  | 'update-next-action';

export type AutoAdvanceTaskStatus =
  | 'auto-completed'
  | 'queued'
  | 'skipped-by-policy'
  | 'blocked'
  | 'needs-human';

export type AutoAdvanceTask = {
  id: string;
  type: AutoAdvanceTaskType;
  title: string;
  status: AutoAdvanceTaskStatus;
  reason: string;
  outputSummary: string;
  generatedAt: string;
  blockers: string[];
  warnings: string[];
};

export const TASK_TYPE_LABELS: Record<AutoAdvanceTaskType, string> = {
  'generate-report': 'レポート生成',
  'generate-dry-run': 'dry-run生成',
  'generate-prompt-pack': 'prompt pack生成',
  'generate-cloud-agent-instruction': 'Cloud Agent指示書生成',
  'generate-notification-draft': '通知ドラフト生成',
  'update-readiness-gate': 'readiness gate更新',
  'update-safety-audit': 'safety audit更新',
  'update-next-action': 'next action更新',
};

export const TASK_STATUS_ICONS: Record<AutoAdvanceTaskStatus, string> = {
  'auto-completed': '✅',
  'queued': '⏳',
  'skipped-by-policy': '⏭',
  'blocked': '🚫',
  'needs-human': '👤',
};

export function buildAutoAdvanceTask(
  partial: Partial<AutoAdvanceTask> & Pick<AutoAdvanceTask, 'type' | 'title'>
): AutoAdvanceTask {
  return {
    id: `aat-${crypto.randomUUID()}`,
    status: 'queued',
    reason: '',
    outputSummary: '',
    generatedAt: new Date().toISOString(),
    blockers: [],
    warnings: [],
    ...partial,
  };
}

export function buildAutoAdvanceQueue(
  tasks: Array<Partial<AutoAdvanceTask> & Pick<AutoAdvanceTask, 'type' | 'title'>>
): AutoAdvanceTask[] {
  return tasks.map(buildAutoAdvanceTask);
}

/**
 * Simulates local auto-advance execution.
 * Does NOT perform any external actions — only marks tasks as auto-completed or blocked locally.
 */
export function runLocalAutoAdvanceSimulation(
  tasks: AutoAdvanceTask[]
): AutoAdvanceTask[] {
  return tasks.map((task) => {
    if (task.status === 'blocked' || task.status === 'needs-human') {
      return task;
    }
    if (task.blockers.length > 0) {
      return { ...task, status: 'blocked' };
    }
    return {
      ...task,
      status: 'auto-completed',
      outputSummary: task.outputSummary || `${TASK_TYPE_LABELS[task.type]} — 自動生成完了（ローカルのみ）`,
    };
  });
}

export function summarizeAutoAdvanceQueue(tasks: AutoAdvanceTask[]): string {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'auto-completed').length;
  const blocked = tasks.filter((t) => t.status === 'blocked').length;
  const needsHuman = tasks.filter((t) => t.status === 'needs-human').length;
  const queued = tasks.filter((t) => t.status === 'queued').length;
  const skipped = tasks.filter((t) => t.status === 'skipped-by-policy').length;
  return `全${total}件 / 自動完了: ${completed} / queued: ${queued} / blocked: ${blocked} / 人間必要: ${needsHuman} / スキップ: ${skipped}`;
}

export function formatAutoAdvanceQueueMarkdown(tasks: AutoAdvanceTask[]): string {
  const lines = [
    `# No-OK Auto Advance Queue`,
    '',
    summarizeAutoAdvanceQueue(tasks),
    '',
  ];

  const grouped: Record<AutoAdvanceTaskStatus, AutoAdvanceTask[]> = {
    'auto-completed': [],
    'queued': [],
    'skipped-by-policy': [],
    'blocked': [],
    'needs-human': [],
  };
  tasks.forEach((t) => grouped[t.status].push(t));

  const order: AutoAdvanceTaskStatus[] = ['blocked', 'needs-human', 'queued', 'auto-completed', 'skipped-by-policy'];
  for (const status of order) {
    const group = grouped[status];
    if (group.length === 0) continue;
    lines.push(`## ${TASK_STATUS_ICONS[status]} ${status} (${group.length}件)`);
    group.forEach((t) => {
      lines.push(`- **${t.title}** (${TASK_TYPE_LABELS[t.type]})`);
      if (t.reason) lines.push(`  reason: ${t.reason}`);
      if (t.outputSummary) lines.push(`  output: ${t.outputSummary}`);
      t.blockers.forEach((b) => lines.push(`  🚫 ${b}`));
      t.warnings.forEach((w) => lines.push(`  ⚠️ ${w}`));
    });
    lines.push('');
  }

  return lines.join('\n');
}

const STORAGE_KEY = 'darake.noOkAutoAdvanceQueue.v1';

export function loadAutoAdvanceQueue(): AutoAdvanceTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AutoAdvanceTask[];
  } catch {
    return [];
  }
}

export function saveAutoAdvanceQueue(tasks: AutoAdvanceTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}
