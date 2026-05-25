import type { DarakeProject } from '../src/utils/darakeProject';
import { appendAudit } from './auditLog';
import { addAllowedRepo } from './repoAllowlist';
import { createProjectId, saveProject } from './projectRegistry';

type BootstrapEnv = {
  GITHUB_TOKEN?: string;
  GITHUB_ALLOWED_REPOS?: string;
  DARAKE_PROJECT_BOOTSTRAP_ENABLED?: string;
  STARTER_TEMPLATE_REPO?: string;
  PROJECT_OWNER?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  RUN_REGISTRY_KV?: KVNamespace;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || `app-${Date.now().toString(36)}`
  );
}

function parseTemplate(repo: string): { owner: string; repo: string } | null {
  const normalized = repo.trim().replace(/^https?:\/\//, '').replace(/^github\.com\//, '');
  const match = normalized.match(/^([^/\s]+)\/([^/\s?#]+?)(?:\.git)?\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'darake-dev-app-ai',
    'Content-Type': 'application/json',
  };
}

export async function handleCreateProject(
  request: Request,
  env: BootstrapEnv,
): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (env.DARAKE_PROJECT_BOOTSTRAP_ENABLED !== 'true') {
    return json(
      {
        ok: false,
        code: 'DISABLED',
        error: 'プロジェクト自動作成はまだ有効化されていません',
      },
      403,
    );
  }
  if (!env.GITHUB_TOKEN) {
    return json(
      { ok: false, code: 'MISSING_TOKEN', error: 'GITHUB_TOKENがWorker Secretに設定されていません' },
      500,
    );
  }
  if (!env.RUN_REGISTRY_KV) {
    return json(
      { ok: false, code: 'MISSING_STORAGE', error: 'RUN_REGISTRY_KVが設定されていません' },
      503,
    );
  }

  let body: {
    projectName?: unknown;
    templateRepoUrl?: unknown;
    description?: unknown;
    designSummary?: unknown;
    visualSpec?: unknown;
    plan?: unknown;
    private?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }

  const projectName = String(body.projectName ?? '').trim();
  if (!projectName || projectName.length > 80) {
    return json(
      { ok: false, code: 'INVALID_INPUT', error: 'プロジェクト名を1〜80文字で入力してください' },
      400,
    );
  }

  const templateRaw =
    (body.templateRepoUrl ? String(body.templateRepoUrl) : '') || env.STARTER_TEMPLATE_REPO || '';
  const template = parseTemplate(templateRaw);
  if (!template) {
    return json(
      {
        ok: false,
        code: 'INVALID_INPUT',
        error: 'STARTER_TEMPLATE_REPO (owner/repo) を設定するか templateRepoUrl を渡してください',
      },
      400,
    );
  }

  const owner = (env.PROJECT_OWNER ?? template.owner).trim();
  const slug = slugify(projectName);
  const newRepoName = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const isPrivate = body.private !== false; // default private

  // 1. Create a repo from the template.
  const genRes = await fetch(
    `https://api.github.com/repos/${template.owner}/${template.repo}/generate`,
    {
      method: 'POST',
      headers: githubHeaders(env.GITHUB_TOKEN),
      body: JSON.stringify({
        owner,
        name: newRepoName,
        description: body.description ? String(body.description).slice(0, 300) : projectName,
        private: isPrivate,
        include_all_branches: false,
      }),
    },
  );

  const genJson = (await genRes.json().catch(() => null)) as {
    full_name?: string;
    html_url?: string;
    message?: string;
  } | null;

  if (!genRes.ok || !genJson?.full_name || !genJson.html_url) {
    await appendAudit(env, {
      scope: slug,
      kind: 'project-create-failed',
      message: genJson?.message ?? `GitHub repo生成失敗 (status ${genRes.status})`,
    });
    return json(
      {
        ok: false,
        code: 'GITHUB_ERROR',
        error: genJson?.message ?? 'GitHubリポジトリの生成に失敗しました',
      },
      genRes.status >= 400 && genRes.status < 600 ? genRes.status : 502,
    );
  }

  const repoFullName = genJson.full_name;
  const repoUrl = genJson.html_url;

  // 2. Best-effort Cloudflare Pages (direct-upload) project creation.
  let pagesProjectName: string | undefined;
  let pagesPreviewBaseUrl: string | undefined;
  if (env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID) {
    try {
      const cfRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: slug, production_branch: 'main' }),
        },
      );
      const cfJson = (await cfRes.json().catch(() => null)) as {
        success?: boolean;
        result?: { name?: string; subdomain?: string };
      } | null;
      if (cfRes.ok && cfJson?.success && cfJson.result?.name) {
        pagesProjectName = cfJson.result.name;
        pagesPreviewBaseUrl = cfJson.result.subdomain
          ? `https://${cfJson.result.subdomain}`
          : `https://${cfJson.result.name}.pages.dev`;
      }
    } catch {
      // Pages creation is best-effort; the repo is the source of truth.
    }
  }

  // 3. Register the repo in the dynamic allowlist + project registry.
  await addAllowedRepo(env, repoFullName).catch(() => null);

  const now = new Date().toISOString();
  const project: DarakeProject = {
    id: createProjectId(),
    name: projectName,
    repoUrl,
    repoFullName,
    pagesProjectName,
    pagesPreviewBaseUrl,
    designSummary: body.designSummary ? String(body.designSummary).slice(0, 2000) : undefined,
    visualSpec: parseVisualSpec(body.visualSpec),
    plan: parsePlan(body.plan),
    currentPhaseId: undefined,
    phaseRunIds: {},
    status: 'planning',
    createdAt: now,
    updatedAt: now,
  };

  await saveProject(env.RUN_REGISTRY_KV, project);
  await appendAudit(env, {
    scope: project.id,
    kind: 'project-created',
    message: `repo=${repoFullName} pages=${pagesProjectName ?? '(none)'}`,
  });

  return json({ ok: true, project });
}

function parseVisualSpec(raw: unknown):
  | { palette: string[]; typography: string[]; layoutNotes: string[]; vibe: string }
  | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const arr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => String(x).slice(0, 400)) : [];
  return {
    palette: arr(r.palette).slice(0, 12),
    typography: arr(r.typography).slice(0, 6),
    layoutNotes: arr(r.layoutNotes).slice(0, 12),
    vibe: String(r.vibe ?? '').slice(0, 200),
  };
}

function parsePlan(raw: unknown):
  | {
      appName: string;
      phases: Array<{
        id: string;
        title: string;
        purpose: string;
        tasks: string[];
        doneConditions: string[];
        manualGates: string[];
      }>;
    }
  | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.phases)) return undefined;
  const arr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => String(x).slice(0, 400)) : [];
  return {
    appName: String(r.appName ?? '').slice(0, 120),
    phases: (r.phases as unknown[]).slice(0, 20).map((p, i) => {
      const o = (p ?? {}) as Record<string, unknown>;
      return {
        id: String(o.id ?? `phase-${i + 1}`),
        title: String(o.title ?? '').slice(0, 120),
        purpose: String(o.purpose ?? '').slice(0, 600),
        tasks: arr(o.tasks).slice(0, 20),
        doneConditions: arr(o.doneConditions).slice(0, 20),
        manualGates: arr(o.manualGates).slice(0, 20),
      };
    }),
  };
}
