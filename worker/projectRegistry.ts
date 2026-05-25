import type { DarakeProject } from '../src/utils/darakeProject';

export type { DarakeProject };

export type ProjectKvEnv = {
  RUN_REGISTRY_KV?: KVNamespace;
};

const KV_PREFIX = 'project:';
const KV_INDEX_KEY = 'index:projects';

export function createProjectId(): string {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveProject(kv: KVNamespace, project: DarakeProject): Promise<void> {
  await kv.put(`${KV_PREFIX}${project.id}`, JSON.stringify(project));
  const indexRaw = await kv.get(KV_INDEX_KEY);
  const ids: string[] = indexRaw ? (JSON.parse(indexRaw) as string[]) : [];
  if (!ids.includes(project.id)) {
    ids.push(project.id);
    await kv.put(KV_INDEX_KEY, JSON.stringify(ids));
  }
}

export async function getProject(kv: KVNamespace, id: string): Promise<DarakeProject | null> {
  const raw = await kv.get(`${KV_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DarakeProject;
  } catch {
    return null;
  }
}

export async function listProjects(kv: KVNamespace, limit = 50): Promise<DarakeProject[]> {
  const indexRaw = await kv.get(KV_INDEX_KEY);
  if (!indexRaw) return [];
  let ids: string[];
  try {
    ids = JSON.parse(indexRaw) as string[];
  } catch {
    return [];
  }
  const projects: DarakeProject[] = [];
  for (const id of ids.slice(-limit).reverse()) {
    const p = await getProject(kv, id);
    if (p) projects.push(p);
  }
  projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return projects;
}
