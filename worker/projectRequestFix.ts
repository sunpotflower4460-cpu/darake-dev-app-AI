import type { DarakeRemoteRun } from '../src/utils/darakeRemoteRun';
import { appendAudit } from './auditLog';
import { getProject, saveProject } from './projectRegistry';
import { createRunId, saveRun, setNextCheckAfter } from './runRegistry';

type RequestFixEnv = {
  GITHUB_TOKEN?: string;
  RUN_REGISTRY_KV?: KVNamespace;
  DARAKE_PROJECT_AUTOPILOT_ENABLED?: string;
  GITHUB_AGENT_ASSIGN_ENABLED?: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function ghHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'darake-dev-app-ai',
    'Content-Type': 'application/json',
  };
}

function repoParts(fullName: string): { owner: string; repo: string } | null {
  const m = fullName.match(/^([^/]+)\/(.+)$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

/**
 * Turn a user fix request into a new issue assigned to @copilot, register a
 * run for it, and put the project back into the building loop.
 */
export async function handleRequestFix(request: Request, env: RequestFixEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (!env.GITHUB_TOKEN) {
    return json({ ok: false, code: 'MISSING_TOKEN', error: 'GITHUB_TOKENが未設定です' }, 500);
  }
  if (!env.RUN_REGISTRY_KV) {
    return json({ ok: false, code: 'MISSING_STORAGE', error: 'RUN_REGISTRY_KVが設定されていません' }, 503);
  }

  let body: { projectId?: unknown; fixText?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }
  const projectId = String(body.projectId ?? '').trim();
  const fixText = String(body.fixText ?? '').trim();
  if (!projectId) {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'projectIdは必須です' }, 400);
  }
  if (!fixText || fixText.length > 4000) {
    return json({ ok: false, code: 'INVALID_INPUT', error: '修正内容を1〜4000文字で入力してください' }, 400);
  }

  const project = await getProject(env.RUN_REGISTRY_KV, projectId);
  if (!project) {
    return json({ ok: false, code: 'NOT_FOUND', error: 'プロジェクトが見つかりません' }, 404);
  }
  const parts = repoParts(project.repoFullName);
  if (!parts) {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'repoFullNameが不正です' }, 400);
  }

  const slug = fixText.slice(0, 40).replace(/\s+/g, ' ').trim();
  const title = `[${project.name}][fix] ${slug}`;
  const issueBody = [
    '## 修正依頼 (ユーザーから)',
    fixText,
    '',
    '## 完了条件',
    '- 依頼内容が反映されている',
    '- 該当画面のスクリーンショットが設計図と一致する',
    '- typecheck / build が通る',
    '',
    '@copilot この修正を実装してPRを作成してください。',
  ].join('\n');

  const issueRes = await fetch(
    `https://api.github.com/repos/${parts.owner}/${parts.repo}/issues`,
    { method: 'POST', headers: ghHeaders(env.GITHUB_TOKEN), body: JSON.stringify({ title, body: issueBody }) },
  );
  const issueJson = (await issueRes.json().catch(() => null)) as {
    number?: number;
    html_url?: string;
    message?: string;
  } | null;
  if (!issueRes.ok || !issueJson?.number || !issueJson.html_url) {
    return json(
      { ok: false, code: 'GITHUB_ERROR', error: issueJson?.message ?? 'Issue作成に失敗しました' },
      issueRes.status >= 400 && issueRes.status < 600 ? issueRes.status : 502,
    );
  }

  if (env.GITHUB_AGENT_ASSIGN_ENABLED === 'true') {
    await fetch(
      `https://api.github.com/repos/${parts.owner}/${parts.repo}/issues/${issueJson.number}/assignees`,
      { method: 'POST', headers: ghHeaders(env.GITHUB_TOKEN), body: JSON.stringify({ assignees: ['copilot'] }) },
    ).catch(() => null);
  }

  const now = new Date().toISOString();
  const phaseId = `fix-${Date.now().toString(36)}`;
  const run: DarakeRemoteRun = {
    id: createRunId(),
    appName: project.name,
    repoUrl: project.repoUrl,
    issueUrl: issueJson.html_url,
    issueNumber: issueJson.number,
    status: 'active',
    autoFixAttempts: 0,
    maxAutoFixAttempts: 3,
    verifyAttempts: 0,
    projectId: project.id,
    phaseId,
    createdAt: now,
    updatedAt: now,
  };
  await saveRun(env.RUN_REGISTRY_KV, setNextCheckAfter(run, 'active'));

  await saveProject(env.RUN_REGISTRY_KV, {
    ...project,
    status: 'building',
    currentPhaseId: phaseId,
    phaseRunIds: { ...(project.phaseRunIds ?? {}), [phaseId]: run.id },
    updatedAt: now,
  });

  await appendAudit(env, {
    scope: project.id,
    kind: 'fix-requested',
    message: `issue#${issueJson.number} ${slug}`,
  });

  return json({ ok: true, issueUrl: issueJson.html_url, issueNumber: issueJson.number, phaseId });
}
