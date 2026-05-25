import { getProject, listProjects } from './projectRegistry';

type ProjectsListEnv = {
  RUN_REGISTRY_KV?: KVNamespace;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function handleListProjects(
  request: Request,
  env: ProjectsListEnv,
): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (!env.RUN_REGISTRY_KV) {
    return json(
      { ok: false, code: 'MISSING_STORAGE', error: 'RUN_REGISTRY_KVが設定されていません' },
      503,
    );
  }
  let limit = 50;
  try {
    const body = (await request.json().catch(() => ({}))) as { limit?: unknown };
    const n = Number(body.limit);
    if (Number.isFinite(n) && n > 0) limit = Math.min(n, 100);
  } catch {
    // ignore, use default
  }
  const projects = await listProjects(env.RUN_REGISTRY_KV, limit);
  return json({ ok: true, projects });
}

export async function handleGetProject(
  request: Request,
  env: ProjectsListEnv,
): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (!env.RUN_REGISTRY_KV) {
    return json(
      { ok: false, code: 'MISSING_STORAGE', error: 'RUN_REGISTRY_KVが設定されていません' },
      503,
    );
  }
  let projectId = '';
  try {
    const body = (await request.json()) as { projectId?: unknown };
    projectId = String(body.projectId ?? '').trim();
  } catch {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }
  if (!projectId) {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'projectIdは必須です' }, 400);
  }
  const project = await getProject(env.RUN_REGISTRY_KV, projectId);
  if (!project) {
    return json({ ok: false, code: 'NOT_FOUND', error: 'プロジェクトが見つかりません' }, 404);
  }
  return json({ ok: true, project });
}
