import type { DarakeRemoteRun, DarakeRemoteRunStatus } from '../src/utils/darakeRemoteRun';

export type { DarakeRemoteRun, DarakeRemoteRunStatus };

// Re-export for convenience in worker files
export type KvEnv = {
  RUN_REGISTRY_KV?: KVNamespace;
  DARAKE_RUN_REGISTRY_ENABLED?: string;
};

const KV_PREFIX = 'run:';
const KV_INDEX_KEY = 'index:active';

export function isRegistryEnabled(env: KvEnv): boolean {
  return env.DARAKE_RUN_REGISTRY_ENABLED === 'true' && !!env.RUN_REGISTRY_KV;
}

export async function saveRun(kv: KVNamespace, run: DarakeRemoteRun): Promise<void> {
  await kv.put(`${KV_PREFIX}${run.id}`, JSON.stringify(run));

  // Maintain index for active runs
  if (run.status === 'active') {
    const indexRaw = await kv.get(KV_INDEX_KEY);
    const ids: string[] = indexRaw ? (JSON.parse(indexRaw) as string[]) : [];
    if (!ids.includes(run.id)) {
      ids.push(run.id);
      await kv.put(KV_INDEX_KEY, JSON.stringify(ids));
    }
  } else {
    // Remove from active index if no longer active
    const indexRaw = await kv.get(KV_INDEX_KEY);
    if (indexRaw) {
      const ids = (JSON.parse(indexRaw) as string[]).filter((id) => id !== run.id);
      await kv.put(KV_INDEX_KEY, JSON.stringify(ids));
    }
  }
}

export async function getRun(kv: KVNamespace, id: string): Promise<DarakeRemoteRun | null> {
  const raw = await kv.get(`${KV_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DarakeRemoteRun;
  } catch {
    return null;
  }
}

export async function listActiveRuns(kv: KVNamespace): Promise<DarakeRemoteRun[]> {
  const indexRaw = await kv.get(KV_INDEX_KEY);
  if (!indexRaw) return [];

  const ids = JSON.parse(indexRaw) as string[];
  const runs: DarakeRemoteRun[] = [];

  for (const id of ids) {
    const run = await getRun(kv, id);
    if (run && run.status === 'active') {
      runs.push(run);
    }
  }

  return runs;
}

export function createRunId(): string {
  return `dr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getNextCheckDelaySeconds(status: DarakeRemoteRunStatus): number {
  switch (status) {
    case 'active':
      return 600; // 10分
    case 'paused':
      return 3600; // 1時間
    case 'needs-human':
    case 'merge-candidate':
    case 'blocked':
    case 'done':
    case 'failed':
      return 0; // no next check
    default:
      return 900; // 15分
  }
}

export function shouldSkipCheck(run: DarakeRemoteRun): boolean {
  if (!run.nextCheckAfter) return false;
  return new Date(run.nextCheckAfter) > new Date();
}

export function setNextCheckAfter(
  run: DarakeRemoteRun,
  status: DarakeRemoteRunStatus,
): DarakeRemoteRun {
  const delaySec = getNextCheckDelaySeconds(status);
  const nextCheckAfter =
    delaySec > 0
      ? new Date(Date.now() + delaySec * 1000).toISOString()
      : undefined;
  return {
    ...run,
    status,
    nextCheckAfter,
    updatedAt: new Date().toISOString(),
  };
}
