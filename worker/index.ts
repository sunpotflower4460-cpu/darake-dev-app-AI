type Env = {
  GITHUB_TOKEN?: string;
  GITHUB_ALLOWED_REPOS?: string;
  GITHUB_ISSUE_CREATE_ENABLED?: string;
  GITHUB_AGENT_ASSIGN_ENABLED?: string;
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

async function handleAssignAgent(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (env.GITHUB_AGENT_ASSIGN_ENABLED !== "true") {
    return json(
      { ok: false, code: "DISABLED", error: "AIへの自動割り当てはまだ有効化されていません" },
      403,
    );
  }

  if (!env.GITHUB_TOKEN) {
    return json(
      { ok: false, code: "MISSING_TOKEN", error: "GitHub TokenがWorker Secretに設定されていません" },
      500,
    );
  }

  let bodyJson: { repoUrl?: unknown; issueNumber?: unknown; agent?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const repoUrl = String(bodyJson.repoUrl ?? "");
  const issueNumber = Number(bodyJson.issueNumber ?? 0);
  const agent = String(bodyJson.agent ?? "");

  if (agent !== "copilot") {
    return json({ ok: false, code: "UNSUPPORTED", error: "copilot以外はまだサポートしていません" }, 400);
  }

  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed.ok) {
    return json({ ok: false, code: "INVALID_INPUT", error: parsed.error }, 400);
  }

  if (!isAllowedRepo(parsed.fullName, env.GITHUB_ALLOWED_REPOS)) {
    return json(
      { ok: false, code: "REPO_NOT_ALLOWED", error: "このリポジトリは許可リストに入っていません" },
      403,
    );
  }

  if (!issueNumber || issueNumber <= 0) {
    return json({ ok: false, code: "INVALID_INPUT", error: "Issue番号を確認してください" }, 400);
  }

  // Assign @copilot to the issue via GitHub API (add assignee)
  const gh = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues/${issueNumber}/assignees`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "darake-dev-app-ai",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assignees: ["copilot"] }),
    },
  );

  if (!gh.ok) {
    const ghJson = (await gh.json().catch(() => null)) as { message?: string } | null;
    return json(
      { ok: false, code: "GITHUB_ERROR", error: ghJson?.message ?? "GitHub割り当てに失敗しました" },
      gh.status,
    );
  }

  const issueUrl = `https://github.com/${parsed.owner}/${parsed.repo}/issues/${issueNumber}`;
  return json({ ok: true, issueUrl, status: "assigned" });
}

async function handleFindPrByIssue(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (!env.GITHUB_TOKEN) {
    return json(
      { ok: false, code: "MISSING_TOKEN", error: "GitHub TokenがWorker Secretに設定されていません" },
      500,
    );
  }

  let bodyJson: { repoUrl?: unknown; issueNumber?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const repoUrl = String(bodyJson.repoUrl ?? "");
  const issueNumber = Number(bodyJson.issueNumber ?? 0);

  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed.ok) {
    return json({ ok: false, code: "INVALID_INPUT", error: parsed.error }, 400);
  }

  if (!isAllowedRepo(parsed.fullName, env.GITHUB_ALLOWED_REPOS)) {
    return json(
      { ok: false, code: "REPO_NOT_ALLOWED", error: "このリポジトリは許可リストに入っていません" },
      403,
    );
  }

  if (!issueNumber || issueNumber <= 0) {
    return json({ ok: false, code: "INVALID_INPUT", error: "Issue番号を確認してください" }, 400);
  }

  // Fetch open PRs and look for one linked to the issue
  const gh = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls?state=open&per_page=50`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "darake-dev-app-ai",
      },
    },
  );

  if (!gh.ok) {
    const ghJson = (await gh.json().catch(() => null)) as { message?: string } | null;
    return json(
      { ok: false, code: "GITHUB_ERROR", error: ghJson?.message ?? "PR一覧の取得に失敗しました" },
      gh.status,
    );
  }

  type GhPr = { html_url: string; number: number; title: string; body: string | null };
  const prs = (await gh.json().catch(() => [])) as GhPr[];

  const issueRef = `#${issueNumber}`;
  const issueFullRef = `/${parsed.owner}/${parsed.repo}/issues/${issueNumber}`;

  const candidates = prs.filter((pr) => {
    const text = `${pr.title} ${pr.body ?? ""}`;
    return text.includes(issueRef) || text.includes(issueFullRef);
  });

  if (candidates.length === 0) {
    return json({ ok: true, status: "not-found" });
  }

  if (candidates.length === 1) {
    return json({
      ok: true,
      status: "found",
      prUrl: candidates[0].html_url,
      prNumber: candidates[0].number,
    });
  }

  return json({
    ok: true,
    status: "multiple-candidates",
    candidates: candidates.map((pr) => ({
      prUrl: pr.html_url,
      prNumber: pr.number,
      title: pr.title,
    })),
  });
}

async function handleGetPrHealth(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (!env.GITHUB_TOKEN) {
    return json(
      { ok: false, code: "MISSING_TOKEN", error: "GitHub TokenがWorker Secretに設定されていません" },
      500,
    );
  }

  let bodyJson: { repoUrl?: unknown; prNumber?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const repoUrl = String(bodyJson.repoUrl ?? "");
  const prNumber = Number(bodyJson.prNumber ?? 0);

  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed.ok) {
    return json({ ok: false, code: "INVALID_INPUT", error: parsed.error }, 400);
  }

  if (!isAllowedRepo(parsed.fullName, env.GITHUB_ALLOWED_REPOS)) {
    return json(
      { ok: false, code: "REPO_NOT_ALLOWED", error: "このリポジトリは許可リストに入っていません" },
      403,
    );
  }

  if (!prNumber || prNumber <= 0) {
    return json({ ok: false, code: "INVALID_INPUT", error: "PR番号を確認してください" }, 400);
  }

  // Get check runs for PR head commit
  const prRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${prNumber}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "darake-dev-app-ai",
      },
    },
  );

  if (!prRes.ok) {
    const ghJson = (await prRes.json().catch(() => null)) as { message?: string } | null;
    return json(
      { ok: false, code: "GITHUB_ERROR", error: ghJson?.message ?? "PR情報の取得に失敗しました" },
      prRes.status,
    );
  }

  type GhPrDetail = {
    head: { sha: string };
    mergeable?: boolean;
    mergeable_state?: string;
    requested_reviewers?: unknown[];
  };
  const pr = (await prRes.json()) as GhPrDetail;
  const headSha = pr.head.sha;

  const checksRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits/${headSha}/check-runs?per_page=50`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "darake-dev-app-ai",
      },
    },
  );

  if (!checksRes.ok) {
    return json({ ok: true, health: "unknown", summary: "チェック状態を取得できませんでした" });
  }

  type CheckRun = { status: string; conclusion: string | null; name: string };
  type CheckRunsResponse = { check_runs: CheckRun[]; total_count: number };
  const checksData = (await checksRes.json().catch(() => ({ check_runs: [], total_count: 0 }))) as CheckRunsResponse;
  const runs = checksData.check_runs;

  if (runs.length === 0) {
    return json({ ok: true, health: "waiting", summary: "チェックがまだ開始されていません" });
  }

  const inProgress = runs.some((r) => r.status === "in_progress" || r.status === "queued");
  const failed = runs.some((r) => r.conclusion === "failure" || r.conclusion === "timed_out");
  const allPassed = runs.every((r) => r.conclusion === "success" || r.conclusion === "skipped" || r.conclusion === "neutral");

  let health: string;
  let summary: string;
  const details: string[] = [];

  if (inProgress) {
    health = "checks-running";
    summary = "CIが実行中です";
  } else if (failed) {
    health = "checks-failed";
    summary = "CIまたはBuildが失敗しました";
    runs.filter((r) => r.conclusion === "failure").forEach((r) => details.push(`❌ ${r.name}`));
  } else if (allPassed) {
    const hasReviewers = (pr.requested_reviewers ?? []).length > 0;
    if (hasReviewers) {
      health = "review-needed";
      summary = "CIが通りました。レビューが必要です。";
    } else if (pr.mergeable === true && pr.mergeable_state === "clean") {
      health = "ready-to-merge";
      summary = "マージできる状態です";
    } else {
      health = "checks-passed";
      summary = "CIが通りました";
    }
  } else {
    health = "unknown";
    summary = "チェック状態を確認中です";
  }

  return json({ ok: true, health, summary, details: details.length > 0 ? details : undefined });
}

async function handleCreatePrComment(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (!env.GITHUB_TOKEN) {
    return json(
      { ok: false, code: "MISSING_TOKEN", error: "GitHub TokenがWorker Secretに設定されていません" },
      500,
    );
  }

  let bodyJson: { repoUrl?: unknown; prNumber?: unknown; body?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const repoUrl = String(bodyJson.repoUrl ?? "");
  const prNumber = Number(bodyJson.prNumber ?? 0);
  const commentBody = String(bodyJson.body ?? "").trim();

  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed.ok) {
    return json({ ok: false, code: "INVALID_INPUT", error: parsed.error }, 400);
  }

  if (!isAllowedRepo(parsed.fullName, env.GITHUB_ALLOWED_REPOS)) {
    return json(
      { ok: false, code: "REPO_NOT_ALLOWED", error: "このリポジトリは許可リストに入っていません" },
      403,
    );
  }

  if (!prNumber || prNumber <= 0) {
    return json({ ok: false, code: "INVALID_INPUT", error: "PR番号を確認してください" }, 400);
  }

  if (!commentBody) {
    return json({ ok: false, code: "INVALID_INPUT", error: "コメント本文を入力してください" }, 400);
  }

  if (commentBody.length > 10000) {
    return json({ ok: false, code: "INVALID_INPUT", error: "コメントが長すぎます（最大10000文字）" }, 400);
  }

  // Post comment to PR (issue comment on the PR number)
  const gh = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues/${prNumber}/comments`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "darake-dev-app-ai",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: commentBody }),
    },
  );

  const ghJson = (await gh.json().catch(() => null)) as { html_url?: string; message?: string } | null;

  if (!gh.ok) {
    return json(
      { ok: false, code: "GITHUB_ERROR", error: ghJson?.message ?? "コメント投稿に失敗しました" },
      gh.status,
    );
  }

  return json({ ok: true, commentUrl: ghJson?.html_url ?? "" });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/github/issues/create") {
      return handleCreateIssue(request, env);
    }
    if (url.pathname === "/api/github/issues/assign-agent") {
      return handleAssignAgent(request, env);
    }
    if (url.pathname === "/api/github/prs/find-by-issue") {
      return handleFindPrByIssue(request, env);
    }
    if (url.pathname === "/api/github/prs/health") {
      return handleGetPrHealth(request, env);
    }
    if (url.pathname === "/api/github/prs/comment") {
      return handleCreatePrComment(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
