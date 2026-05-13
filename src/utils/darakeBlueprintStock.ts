import {
  type DarakeTask,
  addDarakeTask,
  loadDarakeTaskQueue,
  saveDarakeTaskQueue,
} from './darakeTaskQueue';

export type DarakeBlueprintPhase = {
  id: string;
  title: string;
  goal: string;
  doneDefinition: string;
  suggestedTasks: string[];
};

export type DarakeBlueprint = {
  id: string;
  appName: string;
  oneLineIdea: string;
  targetUser?: string;
  platform?: string;
  repoUrl?: string;
  mvp: string[];
  mustHave: string[];
  mustNotDo: string[];
  phases: DarakeBlueprintPhase[];
  hardStops: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const BLUEPRINT_STOCK_KEY = 'darake.blueprintStock.v1';

export function loadBlueprintStock(): DarakeBlueprint[] {
  try {
    const raw = localStorage.getItem(BLUEPRINT_STOCK_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DarakeBlueprint[];
  } catch {
    return [];
  }
}

export function saveBlueprintStock(blueprints: DarakeBlueprint[]): void {
  localStorage.setItem(BLUEPRINT_STOCK_KEY, JSON.stringify(blueprints));
}

export function addBlueprint(
  bp: Omit<DarakeBlueprint, 'id' | 'createdAt' | 'updatedAt'>
): DarakeBlueprint {
  const blueprints = loadBlueprintStock();
  const now = new Date().toISOString();
  const newBp: DarakeBlueprint = {
    ...bp,
    id: `bp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  blueprints.push(newBp);
  saveBlueprintStock(blueprints);
  return newBp;
}

export function updateBlueprint(
  id: string,
  patch: Partial<DarakeBlueprint>
): DarakeBlueprint[] {
  const blueprints = loadBlueprintStock();
  const updated = blueprints.map((bp) =>
    bp.id === id ? { ...bp, ...patch, updatedAt: new Date().toISOString() } : bp
  );
  saveBlueprintStock(updated);
  return updated;
}

export function deleteBlueprint(id: string): DarakeBlueprint[] {
  const blueprints = loadBlueprintStock();
  const filtered = blueprints.filter((bp) => bp.id !== id);
  saveBlueprintStock(filtered);
  return filtered;
}

export function createTasksFromBlueprint(blueprint: DarakeBlueprint): DarakeTask[] {
  const now = new Date().toISOString();
  const tasks: DarakeTask[] = [];

  const reviewTask: DarakeTask = {
    id: `${blueprint.id}-review-blueprint`,
    title: `[設計図レビュー] ${blueprint.appName}`,
    kind: 'blueprint',
    status: 'queued',
    priority: 100,
    appName: blueprint.appName,
    repoUrl: blueprint.repoUrl,
    dependsOn: [],
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(reviewTask);

  for (const phase of blueprint.phases) {
    const issueTaskId = `${blueprint.id}-${phase.id}-issue-create`;
    const agentRunTaskId = `${blueprint.id}-${phase.id}-agent-run`;
    const prWatchTaskId = `${blueprint.id}-${phase.id}-pr-watch`;

    const issueTask: DarakeTask = {
      id: issueTaskId,
      title: `[Issue作成] ${blueprint.appName} / ${phase.title}`,
      kind: 'issue-create',
      status: 'queued',
      priority: 90,
      appName: blueprint.appName,
      repoUrl: blueprint.repoUrl,
      dependsOn: [reviewTask.id],
      createdAt: now,
      updatedAt: now,
    };

    const agentRunTask: DarakeTask = {
      id: agentRunTaskId,
      title: `[Agent実行] ${blueprint.appName} / ${phase.title}`,
      kind: 'agent-run',
      status: 'queued',
      priority: 80,
      appName: blueprint.appName,
      repoUrl: blueprint.repoUrl,
      dependsOn: [issueTaskId],
      createdAt: now,
      updatedAt: now,
    };

    const prWatchTask: DarakeTask = {
      id: prWatchTaskId,
      title: `[PR監視] ${blueprint.appName} / ${phase.title}`,
      kind: 'pr-watch',
      status: 'queued',
      priority: 70,
      appName: blueprint.appName,
      repoUrl: blueprint.repoUrl,
      dependsOn: [agentRunTaskId],
      createdAt: now,
      updatedAt: now,
    };

    tasks.push(issueTask, agentRunTask, prWatchTask);
  }

  const postMergeTask: DarakeTask = {
    id: `${blueprint.id}-post-merge-check`,
    title: `[マージ後確認] ${blueprint.appName}`,
    kind: 'post-merge-check',
    status: 'queued',
    priority: 60,
    appName: blueprint.appName,
    repoUrl: blueprint.repoUrl,
    dependsOn: blueprint.phases.map((p) => `${blueprint.id}-${p.id}-pr-watch`),
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(postMergeTask);

  // Add all tasks to the queue
  const existingTasks = loadDarakeTaskQueue();
  const merged = [...existingTasks, ...tasks];
  saveDarakeTaskQueue(merged);

  // Suppress unused import warning
  void addDarakeTask;

  return tasks;
}
