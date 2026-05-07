type Env = {
  GITHUB_TOKEN?: string;
  GITHUB_ALLOWED_REPOS?: string;
  GITHUB_ISSUE_CREATE_ENABLED?: string;
  ASSETS: Fetcher;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function parseGitHubRepoUrl(
  repoUrl: string,
): { ok: true; owner: string; repo: string; fullName: string } | { ok: false; error: string } {
  const normalized = repoUrl.trim().replace(/^https?:\/\//, "");
  const match = normalized.match(/^github\.com\/([^/\s]+)\/([^/\s?#]+)\/?$/);
  if (!match) {
    return { ok: false, error: "GitHubリポジトリURLを入力してください" };
  }
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  return { ok: true, owner, repo, fullName: `${owner}/${repo}` };
}

function isAllowedRepo(fullName: string, allowlist?: string): boolean {
  if (!allowlist?.trim()) return true;
  return allowlist
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(fullName.toLowerCase());
}

async function handleCreateIssue(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (env.GITHUB_ISSUE_CREATE_ENABLED !== "true") {
    return json(
      {
        ok: false,
        code: "DISABLED",
        error: "Issue直接作成はまだ有効化されていません",
      },
      403,
    );
  }

  if (!env.GITHUB_TOKEN) {
    return json(
      {
        ok: false,
        code: "MISSING_TOKEN",
        error: "GitHub TokenがWorker Secretに設定されていません",
      },
      500,
    );
  }

  let bodyJson: { repoUrl?: unknown; title?: unknown; body?: unknown; source?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const repoUrl = String(bodyJson.repoUrl ?? "");
  const title = String(bodyJson.title ?? "").trim();
  const issueBody = String(bodyJson.body ?? "").trim();

  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed.ok) {
    return json({ ok: false, code: "INVALID_REPO_URL", error: parsed.error }, 400);
  }

  if (!isAllowedRepo(parsed.fullName, env.GITHUB_ALLOWED_REPOS)) {
    return json(
      {
        ok: false,
        code: "REPO_NOT_ALLOWED",
        error: "このリポジトリは許可リストに入っていません",
      },
      403,
    );
  }

  if (!title || title.length > 180) {
    return json(
      {
        ok: false,
        code: "INVALID_INPUT",
        error: "Issueタイトルを確認してください",
      },
      400,
    );
  }

  if (!issueBody || issueBody.length > 50000) {
    return json(
      {
        ok: false,
        code: "INVALID_INPUT",
        error: "Issue本文を確認してください",
      },
      400,
    );
  }

  const gh = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "darake-dev-app-ai",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body: issueBody,
      }),
    },
  );

  const ghJson = (await gh.json().catch(() => null)) as {
    html_url?: string;
    number?: number;
    message?: string;
  } | null;

  if (!gh.ok) {
    return json(
      {
        ok: false,
        code: "GITHUB_ERROR",
        error: ghJson?.message ?? "GitHub Issue作成に失敗しました",
      },
      gh.status,
    );
  }

  return json({
    ok: true,
    issueUrl: ghJson?.html_url,
    issueNumber: ghJson?.number,
    owner: parsed.owner,
    repo: parsed.repo,
    fullName: parsed.fullName,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/github/issues/create") {
      return handleCreateIssue(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
