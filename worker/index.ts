type Env = {
  GITHUB_TOKEN?: string;
  GITHUB_ALLOWED_REPOS?: string;
  GITHUB_ISSUE_CREATE_ENABLED?: string;
  GITHUB_AGENT_ASSIGN_ENABLED?: string;
  GITHUB_PR_MERGE_ENABLED?: string;
  DARAKE_RUN_REGISTRY_ENABLED?: string;
  DARAKE_AUTOPILOT_SCHEDULE_ENABLED?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  NOTIFICATION_WEBHOOK_URL?: string;
  RUN_REGISTRY_KV?: KVNamespace;
  /** Public URL of the Pages app, e.g. https://your-app.pages.dev */
  APP_URL?: string;
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

  // Use regex to match exact issue number (word boundary to avoid #12 matching #123)
  const issueRefRegex = new RegExp(`#${issueNumber}(?![0-9])`, "g");
  const issueFullRef = `/${parsed.owner}/${parsed.repo}/issues/${issueNumber}`;

  const candidates = prs.filter((pr) => {
    const text = `${pr.title} ${pr.body ?? ""}`;
    return issueRefRegex.test(text) || text.includes(issueFullRef);
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

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: "Bearer " + env.GITHUB_TOKEN,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "darake-dev-app-ai",
  };

  const prRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${prNumber}`, { headers });
  if (!prRes.ok) {
    const ghJson = (await prRes.json().catch(() => null)) as { message?: string } | null;
    return json(
      { ok: false, code: "GITHUB_ERROR", error: ghJson?.message ?? "PR情報の取得に失敗しました" },
      prRes.status,
    );
  }

  type GhPrDetail = {
    html_url: string;
    head: { sha: string };
    merged?: boolean;
    draft?: boolean;
    mergeable?: boolean | null;
    mergeable_state?: string | null;
    requested_reviewers?: unknown[];
  };
  type GhReview = { state?: string | null };
  type CheckRun = { status: string; conclusion: string | null; name: string };
  type CheckRunsResponse = { check_runs: CheckRun[]; total_count: number };

  const pr = (await prRes.json()) as GhPrDetail;
  const headSha = pr.head.sha;

  const [checksRes, reviewsRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits/${headSha}/check-runs?per_page=50`, { headers }),
    fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${prNumber}/reviews?per_page=100`, { headers }),
  ]);

  const details: string[] = [];

  const runs = checksRes.ok
    ? ((await checksRes.json().catch(() => ({ check_runs: [], total_count: 0 }))) as CheckRunsResponse).check_runs
    : [];

  const reviews = reviewsRes.ok
    ? ((await reviewsRes.json().catch(() => [])) as GhReview[])
    : [];

  const inProgress = runs.some((run) => run.status === "in_progress" || run.status === "queued");
  const failed = runs.some((run) => run.conclusion === "failure" || run.conclusion === "timed_out");
  const completedRuns = runs.filter((run) => run.conclusion !== null);
  const allSkipped = completedRuns.length > 0 && completedRuns.every((run) => run.conclusion === "skipped" || run.conclusion === "neutral");
  const allPassed =
    completedRuns.length > 0 &&
    completedRuns.every((run) => run.conclusion === "success" || run.conclusion === "skipped" || run.conclusion === "neutral");

  let ciStatus: "passed" | "failed" | "running" | "unknown" | "skipped" = "unknown";
  if (failed) {
    ciStatus = "failed";
  } else if (inProgress || runs.length === 0) {
    ciStatus = "running";
  } else if (allPassed) {
    ciStatus = allSkipped ? "skipped" : "passed";
  }

  if (failed) {
    runs
      .filter((run) => run.conclusion === "failure" || run.conclusion === "timed_out")
      .forEach((run) => details.push(`❌ ${run.name}`));
  }

  let reviewStatus: "approved" | "changes-requested" | "pending" | "none" = "none";
  const reviewStates = reviews.map((review) => String(review.state ?? "").toUpperCase());
  if (reviewStates.includes("CHANGES_REQUESTED")) {
    reviewStatus = "changes-requested";
  } else if (reviewStates.includes("APPROVED")) {
    reviewStatus = "approved";
  } else if ((pr.requested_reviewers ?? []).length > 0) {
    reviewStatus = "pending";
  }

  let mergeReadiness: "ready" | "not-ready" | "merged" | "unknown" = "unknown";
  if (pr.merged) {
    mergeReadiness = "merged";
  } else if (pr.draft || reviewStatus === "changes-requested") {
    mergeReadiness = "not-ready";
  } else if (pr.mergeable === true && pr.mergeable_state === "clean" && ciStatus === "passed") {
    mergeReadiness = "ready";
  } else if (pr.mergeable === false || (pr.mergeable_state && pr.mergeable_state !== "clean")) {
    mergeReadiness = "not-ready";
  }

  let health = "unknown";
  if (mergeReadiness === "merged") {
    health = "merged";
  } else if (reviewStatus === "changes-requested") {
    health = "changes-requested";
  } else if (ciStatus === "failed") {
    health = "checks-failed";
  } else if (ciStatus === "running") {
    health = runs.length === 0 ? "waiting" : "checks-running";
  } else if (ciStatus === "passed" && mergeReadiness === "ready") {
    health = "ready-to-merge";
  } else if (ciStatus === "passed" && reviewStatus === "pending") {
    health = "review-needed";
  } else if (ciStatus === "passed") {
    health = "checks-passed";
  }

  let summary = "状態を確認中です。";
  if (mergeReadiness === "merged") {
    summary = "このPRはマージ済みです。";
  } else if (reviewStatus === "changes-requested") {
    summary = "レビューで修正依頼があります。内容を確認してください。";
  } else if (ciStatus === "failed") {
    summary = "CI失敗。AIに修正依頼できます。";
  } else if (ciStatus === "running") {
    summary = "CI実行中です。少し待ってから再確認してください。";
  } else if (ciStatus === "passed" && mergeReadiness === "ready") {
    summary = "CI成功。マージできそうです。";
  } else if (ciStatus === "passed" && reviewStatus === "pending") {
    summary = "CI成功。レビュー待ちです。";
  } else if (ciStatus === "passed") {
    summary = "CI成功。レビュー状態を確認してください。";
  }

  if (!checksRes.ok) {
    details.push("CI詳細を取得できませんでした");
  }
  if (!reviewsRes.ok) {
    details.push("レビュー詳細を取得できませんでした");
  }

  return json({
    ok: true,
    health,
    summary,
    message: summary,
    prNumber,
    prUrl: pr.html_url,
    ciStatus,
    reviewStatus,
    mergeReadiness,
    headSha,
    details: details.length > 0 ? details : undefined,
  });
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

import {
  getRun,
  saveRun,
  createRunId,
  isRegistryEnabled,
  setNextCheckAfter,
} from "./runRegistry";
import {
  sendTelegramNotification,
  sendWebhookNotification,
} from "./notificationSender";
import type { DarakeWebhookPayload } from "../src/utils/darakeRemoteRun";
import {
  getWakeActionToken,
  markWakeActionTokenUsed,
  isTokenExpired,
  EXECUTABLE_ACTION_KINDS,
} from "./wakeActionToken";

async function handleGetWakeAction(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (!env.RUN_REGISTRY_KV) {
    return json({ ok: false, code: "DISABLED", error: "RUN_REGISTRY_KVが設定されていません" }, 503);
  }

  let bodyJson: { tokenId?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const tokenId = String(bodyJson.tokenId ?? "").trim();
  if (!tokenId) {
    return json({ ok: false, code: "NOT_FOUND", error: "tokenIdは必須です" }, 400);
  }

  try {
    const token = await getWakeActionToken(env.RUN_REGISTRY_KV, tokenId);
    if (!token) {
      return json({ ok: false, code: "NOT_FOUND", error: "トークンが見つかりません" }, 404);
    }
    if (isTokenExpired(token)) {
      return json({ ok: false, code: "EXPIRED", error: "この通知は期限切れです" }, 410);
    }
    if (token.usedAt) {
      return json({ ok: false, code: "USED", error: "このアクションはすでに実行されました" }, 409);
    }
    // Return token without repoUrl (not needed by frontend)
    const { repoUrl: _repoUrl, ...safeToken } = token;
    return json({ ok: true, action: safeToken });
  } catch {
    return json({ ok: false, code: "UNKNOWN_ERROR", error: "トークンの取得に失敗しました" }, 500);
  }
}

async function handleRunWakeAction(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (!env.RUN_REGISTRY_KV) {
    return json({ ok: false, code: "DISABLED", error: "RUN_REGISTRY_KVが設定されていません" }, 503);
  }

  let bodyJson: { tokenId?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const tokenId = String(bodyJson.tokenId ?? "").trim();
  if (!tokenId) {
    return json({ ok: false, code: "NOT_FOUND", error: "tokenIdは必須です" }, 400);
  }

  let token: Awaited<ReturnType<typeof getWakeActionToken>>;
  try {
    token = await getWakeActionToken(env.RUN_REGISTRY_KV, tokenId);
  } catch {
    return json({ ok: false, code: "UNKNOWN_ERROR", error: "トークンの取得に失敗しました" }, 500);
  }

  if (!token) {
    return json({ ok: false, code: "NOT_FOUND", error: "トークンが見つかりません" }, 404);
  }
  if (isTokenExpired(token)) {
    return json({ ok: false, code: "EXPIRED", error: "この通知は期限切れです" }, 410);
  }
  if (token.usedAt) {
    return json({ ok: false, code: "USED", error: "このアクションはすでに実行されました" }, 409);
  }
  if (!EXECUTABLE_ACTION_KINDS.has(token.actionKind)) {
    return json({ ok: false, code: "ACTION_NOT_ALLOWED", error: "このアクションは実行できません" }, 403);
  }

  // Execute: send-fix-request → post PR comment
  if (token.actionKind === "send-fix-request") {
    if (!env.GITHUB_TOKEN) {
      return json(
        {
          ok: false,
          code: "GITHUB_ERROR",
          error: "GitHub TokenがWorker Secretに設定されていません",
          fallbackText: token.message,
        },
        500,
      );
    }

    if (!token.repoUrl || !token.prNumber) {
      return json(
        {
          ok: false,
          code: "GITHUB_ERROR",
          error: "PR情報が不足しています",
          fallbackText: token.message,
        },
        400,
      );
    }

    const repoMatch = token.repoUrl.trim().replace(/^https?:\/\//, "").match(/^github\.com\/([^/\s]+)\/([^/\s?#]+)\/?$/);
    if (!repoMatch) {
      return json(
        {
          ok: false,
          code: "GITHUB_ERROR",
          error: "リポジトリURLが不正です",
          fallbackText: token.message,
        },
        400,
      );
    }

    const owner = repoMatch[1];
    const repo = repoMatch[2].replace(/\.git$/, "");

    const gh = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${token.prNumber}/comments`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "darake-dev-app-ai",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: token.message }),
      },
    );

    if (!gh.ok) {
      const ghJson = (await gh.json().catch(() => null)) as { message?: string } | null;
      return json(
        {
          ok: false,
          code: "GITHUB_ERROR",
          error: ghJson?.message ?? "PRコメントの投稿に失敗しました",
          fallbackText: token.message,
        },
        gh.status,
      );
    }

    const ghJson = (await gh.json().catch(() => null)) as { html_url?: string } | null;
    await markWakeActionTokenUsed(env.RUN_REGISTRY_KV, token).catch(() => null);

    return json({
      ok: true,
      status: "done",
      message: "AIに修正をお願いしました",
      actionUrl: ghJson?.html_url,
    });
  }

  return json({ ok: false, code: "ACTION_NOT_ALLOWED", error: "このアクションは実行できません" }, 403);
}

async function handleRegisterRun(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (!isRegistryEnabled(env)) {
    if (!env.RUN_REGISTRY_KV) {
      return json({ ok: false, code: "MISSING_STORAGE", error: "RUN_REGISTRY_KVが設定されていません" }, 503);
    }
    return json({ ok: false, code: "DISABLED", error: "Run Registryはまだ有効化されていません" }, 403);
  }

  let bodyJson: { appName?: unknown; repoUrl?: unknown; issueUrl?: unknown; issueNumber?: unknown; prUrl?: unknown; prNumber?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const appName = String(bodyJson.appName ?? "").trim();
  const repoUrl = String(bodyJson.repoUrl ?? "").trim();

  if (!appName || !repoUrl) {
    return json({ ok: false, code: "INVALID_INPUT", error: "appName と repoUrl は必須です" }, 400);
  }

  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed.ok) {
    return json({ ok: false, code: "INVALID_INPUT", error: parsed.error }, 400);
  }

  if (!isAllowedRepo(parsed.fullName, env.GITHUB_ALLOWED_REPOS)) {
    return json({ ok: false, code: "REPO_NOT_ALLOWED", error: "このリポジトリは許可リストに入っていません" }, 403);
  }

  const now = new Date().toISOString();
  const runId = createRunId();
  const run = setNextCheckAfter(
    {
      id: runId,
      appName,
      repoUrl,
      issueUrl: bodyJson.issueUrl ? String(bodyJson.issueUrl) : undefined,
      issueNumber: bodyJson.issueNumber ? Number(bodyJson.issueNumber) : undefined,
      prUrl: bodyJson.prUrl ? String(bodyJson.prUrl) : undefined,
      prNumber: bodyJson.prNumber ? Number(bodyJson.prNumber) : undefined,
      status: "active" as const,
      autoFixAttempts: 0,
      maxAutoFixAttempts: 2,
      createdAt: now,
      updatedAt: now,
    },
    "active",
  );

  try {
    await saveRun(env.RUN_REGISTRY_KV!, run);
  } catch {
    return json({ ok: false, code: "UNKNOWN_ERROR", error: "Run の保存に失敗しました" }, 500);
  }

  return json({ ok: true, runId, status: "active" });
}

async function handleGetRun(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (!isRegistryEnabled(env)) {
    return json({ ok: false, code: "DISABLED", error: "Run Registryはまだ有効化されていません" }, 403);
  }

  let bodyJson: { runId?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const runId = String(bodyJson.runId ?? "").trim();
  if (!runId) {
    return json({ ok: false, code: "INVALID_INPUT", error: "runIdは必須です" }, 400);
  }

  try {
    const run = await getRun(env.RUN_REGISTRY_KV!, runId);
    if (!run) {
      return json({ ok: false, code: "NOT_FOUND", error: "Runが見つかりません" }, 404);
    }
    return json({ ok: true, run });
  } catch {
    return json({ ok: false, code: "UNKNOWN_ERROR", error: "Run の取得に失敗しました" }, 500);
  }
}

async function handleGetPrRiskInput(request: Request, env: Env): Promise<Response> {
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
    return json({ ok: false, code: "INVALID_REPO_URL", error: parsed.error }, 400);
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

  type GhPrFull = {
    html_url: string;
    number: number;
    head: { sha: string };
    changed_files: number;
    additions: number;
    deletions: number;
    draft?: boolean;
    state?: string;
    mergeable?: boolean | null;
  };
  const pr = (await prRes.json()) as GhPrFull;
  const prUrl = `https://github.com/${parsed.owner}/${parsed.repo}/pull/${prNumber}`;

  // Fetch changed file paths
  const filesRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${prNumber}/files?per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "darake-dev-app-ai",
      },
    },
  );

  type GhPrFile = { filename: string; patch?: string };
  let prFiles: GhPrFile[] = [];
  if (filesRes.ok) {
    try {
      prFiles = (await filesRes.json()) as GhPrFile[];
    } catch {
      prFiles = [];
    }
  }

  const changedFiles = prFiles.map((f) => f.filename);
  const patchText = prFiles
    .map((f) => (f.patch ? `--- ${f.filename}\n${f.patch}` : ""))
    .filter(Boolean)
    .join("\n\n");

  return json({
    ok: true,
    prUrl,
    prNumber: pr.number,
    headSha: pr.head.sha,
    changedFiles,
    additions: pr.additions,
    deletions: pr.deletions,
    patchText: patchText || undefined,
  });
}

async function handleMergePr(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  if (env.GITHUB_PR_MERGE_ENABLED !== "true") {
    return json(
      { ok: false, code: "DISABLED", error: "GITHUB_PR_MERGE_ENABLED=true が設定されていません" },
      403,
    );
  }

  if (!env.GITHUB_TOKEN) {
    return json(
      { ok: false, code: "MISSING_TOKEN", error: "GitHub TokenがWorker Secretに設定されていません" },
      500,
    );
  }

  let bodyJson: {
    repoUrl?: unknown;
    prNumber?: unknown;
    expectedHeadSha?: unknown;
    mergeMethod?: unknown;
    safetyDecision?: unknown;
  };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const repoUrl = String(bodyJson.repoUrl ?? "");
  const prNumber = Number(bodyJson.prNumber ?? 0);
  const expectedHeadSha = String(bodyJson.expectedHeadSha ?? "").trim();
  const mergeMethod = String(bodyJson.mergeMethod ?? "squash");
  const safetyDecision = String(bodyJson.safetyDecision ?? "");

  // Safety checks
  if (!expectedHeadSha) {
    return json({ ok: false, code: "INVALID_INPUT", error: "expectedHeadShaは必須です" }, 400);
  }

  if (mergeMethod !== "squash") {
    return json({ ok: false, code: "INVALID_INPUT", error: "squash mergeのみ使えます" }, 400);
  }

  if (safetyDecision !== "auto-merge-allowed") {
    return json(
      { ok: false, code: "SAFETY_GATE", error: "safetyDecision が auto-merge-allowed ではありません" },
      403,
    );
  }

  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed.ok) {
    return json({ ok: false, code: "INVALID_REPO_URL", error: parsed.error }, 400);
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

  const gh = await fetch(
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

  if (!gh.ok) {
    const prFetchError = (await gh.json().catch(() => null)) as { message?: string } | null;
    return json(
      { ok: false, code: "GITHUB_ERROR", error: prFetchError?.message ?? "PRの取得に失敗しました" },
      gh.status,
    );
  }

  type GhPrCheck = {
    state?: string;
    draft?: boolean;
    mergeable?: boolean | null;
    head?: { sha?: string };
  };
  const prData = (await gh.json().catch(() => null)) as GhPrCheck | null;

  if (!prData) {
    return json({ ok: false, code: "GITHUB_ERROR", error: "PR情報を取得できませんでした" }, 500);
  }

  if (prData.state !== "open") {
    return json({ ok: false, code: "SAFETY_GATE", error: "PRがオープン状態ではありません" }, 400);
  }

  if (prData.draft === true) {
    return json({ ok: false, code: "SAFETY_GATE", error: "DraftのPRはマージできません" }, 400);
  }

  if (prData.mergeable === false) {
    return json({ ok: false, code: "SAFETY_GATE", error: "PRがマージ可能な状態ではありません（コンフリクトなど）" }, 400);
  }

  const currentHeadSha = prData.head?.sha ?? "";
  if (currentHeadSha !== expectedHeadSha) {
    return json(
      { ok: false, code: "SAFETY_GATE", error: "headShaが一致しません。PRが更新された可能性があります。" },
      409,
    );
  }

  const mergeGh = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${prNumber}/merge`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "darake-dev-app-ai",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sha: expectedHeadSha,
        merge_method: "squash",
      }),
    },
  );

  const ghJson = (await mergeGh.json().catch(() => null)) as {
    sha?: string;
    merged?: boolean;
    message?: string;
  } | null;

  if (!mergeGh.ok) {
    return json(
      { ok: false, code: "GITHUB_ERROR", error: ghJson?.message ?? "PRのマージに失敗しました" },
      mergeGh.status,
    );
  }

  return json({ ok: true, merged: true, sha: ghJson?.sha ?? "" });
}

async function handleSettingsHealth(_request: Request, env: Env): Promise<Response> {
  return json({
    ok: true,
    github: {
      tokenConfigured: !!env.GITHUB_TOKEN,
      repoAllowlistConfigured: !!env.GITHUB_ALLOWED_REPOS?.trim(),
      issueCreateEnabled: env.GITHUB_ISSUE_CREATE_ENABLED === "true",
      agentAssignEnabled: env.GITHUB_AGENT_ASSIGN_ENABLED === "true",
    },
    kv: {
      configured: !!env.RUN_REGISTRY_KV,
      runRegistryEnabled: env.DARAKE_RUN_REGISTRY_ENABLED === "true",
    },
    notifications: {
      telegramConfigured: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
      webhookConfigured: !!env.NOTIFICATION_WEBHOOK_URL,
    },
    cron: {
      scheduleEnabled: env.DARAKE_AUTOPILOT_SCHEDULE_ENABLED === "true",
    },
  });
}

async function handleSetupStatus(_request: Request, env: Env): Promise<Response> {
  return json({
    ok: true,
    githubToken: env.GITHUB_TOKEN ? "set" : "missing",
    githubIssueCreateEnabled: env.GITHUB_ISSUE_CREATE_ENABLED === "true",
    githubAgentAssignEnabled: env.GITHUB_AGENT_ASSIGN_ENABLED === "true",
    githubPrMergeEnabled: env.GITHUB_PR_MERGE_ENABLED === "true",
    allowedReposConfigured: !!(env.GITHUB_ALLOWED_REPOS?.trim()),
    runRegistryEnabled: env.DARAKE_RUN_REGISTRY_ENABLED === "true",
    runRegistryKvBound: !!env.RUN_REGISTRY_KV,
    autopilotScheduleEnabled: env.DARAKE_AUTOPILOT_SCHEDULE_ENABLED === "true",
    telegramConfigured: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    webhookConfigured: !!env.NOTIFICATION_WEBHOOK_URL,
  });
}

async function handleDarakeHealth(_request: Request, env: Env): Promise<Response> {
  return json({
    ok: true,
    githubToken: env.GITHUB_TOKEN ? "set" : "missing",
    issueCreateEnabled: env.GITHUB_ISSUE_CREATE_ENABLED === "true",
    allowedReposConfigured: !!env.GITHUB_ALLOWED_REPOS?.trim(),
    agentAssignEnabled: env.GITHUB_AGENT_ASSIGN_ENABLED === "true",
    runRegistryEnabled: env.DARAKE_RUN_REGISTRY_ENABLED === "true",
    runRegistryKvBound: !!env.RUN_REGISTRY_KV,
    scheduledAutopilotEnabled: env.DARAKE_AUTOPILOT_SCHEDULE_ENABLED === "true",
    telegramConfigured: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    webhookConfigured: !!env.NOTIFICATION_WEBHOOK_URL,
    prMergeEnabled: env.GITHUB_PR_MERGE_ENABLED === "true",
  });
}


async function handleTestNotification(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, code: "INVALID_INPUT", error: "POSTだけ使えます" }, 405);
  }

  let bodyJson: { channel?: unknown };
  try {
    bodyJson = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT", error: "JSONを読み取れません" }, 400);
  }

  const channel = String(bodyJson.channel ?? "");
  if (channel !== "telegram" && channel !== "webhook") {
    return json({ ok: false, code: "INVALID_INPUT", error: "channel は telegram か webhook にしてください" }, 400);
  }

  const testPayload: DarakeWebhookPayload = {
    title: "だらけ管制室 通知テスト",
    message: "通知設定の確認です。",
    reason: "通知テスト",
    nextActionLabel: "何もしなくてOK（テストです）",
    createdAt: new Date().toISOString(),
  };

  if (channel === "telegram") {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ ok: false, code: "MISSING_SECRET", error: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID が設定されていません" }, 503);
    }
    const res = await sendTelegramNotification(env, testPayload);
    if (!res.ok) {
      return json({ ok: false, code: "SEND_FAILED", error: res.error }, 500);
    }
    return json({ ok: true, message: "通知テストを送信しました" });
  }

  // webhook
  if (!env.NOTIFICATION_WEBHOOK_URL) {
    return json({ ok: false, code: "MISSING_SECRET", error: "NOTIFICATION_WEBHOOK_URL が設定されていません" }, 503);
  }
  const res = await sendWebhookNotification(env, testPayload);
  if (!res.ok) {
    return json({ ok: false, code: "SEND_FAILED", error: res.error }, 500);
  }
  return json({ ok: true, message: "通知テストを送信しました" });
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
    if (url.pathname === "/api/github/prs/health" || url.pathname === "/api/darake/pr/health" || url.pathname === "/api/pr/health") {
      return handleGetPrHealth(request, env);
    }
    if (url.pathname === "/api/github/prs/comment") {
      return handleCreatePrComment(request, env);
    }
    if (url.pathname === "/api/darake/runs/register") {
      return handleRegisterRun(request, env);
    }
    if (url.pathname === "/api/darake/runs/get") {
      return handleGetRun(request, env);
    }
    if (url.pathname === "/api/github/prs/risk-input") {
      return handleGetPrRiskInput(request, env);
    }
    if (url.pathname === "/api/github/prs/merge") {
      return handleMergePr(request, env);
    }
    if (url.pathname === "/api/darake/setup/status") {
      return handleSetupStatus(request, env);
    }
    if (url.pathname === "/api/darake/health") {
      return handleDarakeHealth(request, env);
    }
    if (url.pathname === "/api/darake/settings/health") {
      return handleSettingsHealth(request, env);
    }
    if (url.pathname === "/api/darake/notifications/test") {
      return handleTestNotification(request, env);
    }
    if (url.pathname === "/api/darake/wake-action/get") {
      return handleGetWakeAction(request, env);
    }
    if (url.pathname === "/api/darake/wake-action/run") {
      return handleRunWakeAction(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
