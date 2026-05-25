import { appendAudit } from './auditLog';
import { getProject, saveProject } from './projectRegistry';
import type { DarakeProject } from '../src/utils/darakeProject';

type SubmitEnv = {
  GITHUB_TOKEN?: string;
  RUN_REGISTRY_KV?: KVNamespace;
  DARAKE_SUBMIT_WEB_ENABLED?: string;
  DARAKE_SUBMIT_IOS_ENABLED?: string;
  DARAKE_SUBMIT_ANDROID_ENABLED?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

async function readProject(
  env: SubmitEnv,
  projectId: string,
): Promise<DarakeProject | { error: Response }> {
  if (!env.RUN_REGISTRY_KV) {
    return {
      error: json(
        { ok: false, code: 'MISSING_STORAGE', error: 'RUN_REGISTRY_KVが設定されていません' },
        503,
      ),
    };
  }
  const project = await getProject(env.RUN_REGISTRY_KV, projectId);
  if (!project) {
    return { error: json({ ok: false, code: 'NOT_FOUND', error: 'プロジェクトが見つかりません' }, 404) };
  }
  return project;
}

async function parseProjectId(request: Request): Promise<{ projectId: string } | { error: Response }> {
  if (request.method !== 'POST') {
    return { error: json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405) };
  }
  let body: { projectId?: unknown };
  try {
    body = await request.json();
  } catch {
    return { error: json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400) };
  }
  const projectId = String(body.projectId ?? '').trim();
  if (!projectId) {
    return { error: json({ ok: false, code: 'INVALID_INPUT', error: 'projectIdは必須です' }, 400) };
  }
  return { projectId };
}

function repoParts(fullName: string): { owner: string; repo: string } | null {
  const m = fullName.match(/^([^/]+)\/(.+)$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

async function dispatchWorkflow(
  env: SubmitEnv,
  project: DarakeProject,
  workflowFile: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!env.GITHUB_TOKEN) return { ok: false, error: 'GITHUB_TOKENが未設定です' };
  const parts = repoParts(project.repoFullName);
  if (!parts) return { ok: false, error: 'repoFullNameが不正です' };
  const res = await fetch(
    `https://api.github.com/repos/${parts.owner}/${parts.repo}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'darake-dev-app-ai',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main', inputs: { project_id: project.id } }),
    },
  );
  if (!res.ok) {
    const j = (await res.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, error: j?.message ?? `workflow_dispatch失敗 (status ${res.status})` };
  }
  return { ok: true };
}

async function markStatus(
  env: SubmitEnv,
  project: DarakeProject,
  status: DarakeProject['status'],
): Promise<void> {
  if (!env.RUN_REGISTRY_KV) return;
  await saveProject(env.RUN_REGISTRY_KV, {
    ...project,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function handleSubmitWeb(request: Request, env: SubmitEnv): Promise<Response> {
  if (env.DARAKE_SUBMIT_WEB_ENABLED !== 'true') {
    return json({ ok: false, code: 'DISABLED', error: 'Web本番デプロイはまだ有効化されていません' }, 403);
  }
  const parsed = await parseProjectId(request);
  if ('error' in parsed) return parsed.error;
  const projectOrErr = await readProject(env, parsed.projectId);
  if ('error' in projectOrErr) return projectOrErr.error;
  const project = projectOrErr;

  // Best-effort: promote the latest Pages deployment to production.
  let externalUrl = project.pagesPreviewBaseUrl;
  if (env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID && project.pagesProjectName) {
    try {
      const depRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${project.pagesProjectName}/deployments`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
        },
      );
      const depJson = (await depRes.json().catch(() => null)) as {
        success?: boolean;
        result?: { url?: string };
      } | null;
      if (depRes.ok && depJson?.success && depJson.result?.url) {
        externalUrl = depJson.result.url;
      }
    } catch {
      // best-effort
    }
  }

  await markStatus(env, project, 'done');
  await appendAudit(env, {
    scope: project.id,
    kind: 'submit-web',
    message: `web production: ${externalUrl ?? '(url unknown)'}`,
  });
  return json({ ok: true, status: 'done', message: 'Web本番デプロイを実行しました', externalUrl });
}

export async function handleSubmitIos(request: Request, env: SubmitEnv): Promise<Response> {
  if (env.DARAKE_SUBMIT_IOS_ENABLED !== 'true') {
    return json({ ok: false, code: 'DISABLED', error: 'iOS申請はまだ有効化されていません' }, 403);
  }
  const parsed = await parseProjectId(request);
  if ('error' in parsed) return parsed.error;
  const projectOrErr = await readProject(env, parsed.projectId);
  if ('error' in projectOrErr) return projectOrErr.error;
  const project = projectOrErr;

  const dispatch = await dispatchWorkflow(env, project, 'submit-ios.yml');
  if (!dispatch.ok) {
    await appendAudit(env, {
      scope: project.id,
      kind: 'submit-ios-failed',
      message: dispatch.error ?? 'unknown',
    });
    return json({ ok: false, code: 'GITHUB_ERROR', error: dispatch.error ?? 'iOS申請の起動に失敗しました' }, 502);
  }
  await markStatus(env, project, 'submitting');
  await appendAudit(env, { scope: project.id, kind: 'submit-ios', message: 'submit-ios.yml dispatched' });
  return json({
    ok: true,
    status: 'submitting',
    message: 'iOS申請ワークフローを起動しました',
    externalUrl: `${project.repoUrl}/actions`,
  });
}

export async function handleSubmitAndroid(request: Request, env: SubmitEnv): Promise<Response> {
  if (env.DARAKE_SUBMIT_ANDROID_ENABLED !== 'true') {
    return json({ ok: false, code: 'DISABLED', error: 'Android申請はまだ有効化されていません' }, 403);
  }
  const parsed = await parseProjectId(request);
  if ('error' in parsed) return parsed.error;
  const projectOrErr = await readProject(env, parsed.projectId);
  if ('error' in projectOrErr) return projectOrErr.error;
  const project = projectOrErr;

  const dispatch = await dispatchWorkflow(env, project, 'submit-android.yml');
  if (!dispatch.ok) {
    await appendAudit(env, {
      scope: project.id,
      kind: 'submit-android-failed',
      message: dispatch.error ?? 'unknown',
    });
    return json({ ok: false, code: 'GITHUB_ERROR', error: dispatch.error ?? 'Android申請の起動に失敗しました' }, 502);
  }
  await markStatus(env, project, 'submitting');
  await appendAudit(env, {
    scope: project.id,
    kind: 'submit-android',
    message: 'submit-android.yml dispatched',
  });
  return json({
    ok: true,
    status: 'submitting',
    message: 'Android申請ワークフローを起動しました',
    externalUrl: `${project.repoUrl}/actions`,
  });
}

export async function handleSubmitCallback(request: Request, env: SubmitEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (!env.RUN_REGISTRY_KV) {
    return json({ ok: false, code: 'MISSING_STORAGE', error: 'RUN_REGISTRY_KVが設定されていません' }, 503);
  }
  let body: { projectId?: unknown; platform?: unknown; status?: unknown; externalUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }
  const projectId = String(body.projectId ?? '').trim();
  const platform = String(body.platform ?? '');
  const statusStr = String(body.status ?? '');
  const externalUrl = body.externalUrl ? String(body.externalUrl).slice(0, 600) : undefined;
  if (!projectId) {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'projectIdは必須です' }, 400);
  }
  const project = await getProject(env.RUN_REGISTRY_KV, projectId);
  if (!project) {
    return json({ ok: false, code: 'NOT_FOUND', error: 'プロジェクトが見つかりません' }, 404);
  }
  const success = statusStr === 'success' || statusStr === 'done';
  await saveProject(env.RUN_REGISTRY_KV, {
    ...project,
    status: success ? 'done' : 'failed',
    updatedAt: new Date().toISOString(),
  });
  await appendAudit(env, {
    scope: project.id,
    kind: `submit-callback-${platform}`,
    message: `${statusStr} ${externalUrl ?? ''}`.trim(),
  });
  return json({ ok: true, status: success ? 'done' : 'failed' });
}
