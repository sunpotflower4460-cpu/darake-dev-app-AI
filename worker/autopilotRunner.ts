import type { DarakeRemoteRun } from '../src/utils/darakeRemoteRun';
import type { DarakeWebhookPayload } from '../src/utils/darakeRemoteRun';
import {
  getRun,
  listActiveRuns,
  saveRun,
  shouldSkipCheck,
  setNextCheckAfter,
} from './runRegistry';
import {
  sendTelegramNotification,
  sendWebhookNotification,
  shouldSendWake,
  WAKE_NOTIFY_REASONS,
} from './notificationSender';
import {
  createWakeActionToken,
  saveWakeActionToken,
} from './wakeActionToken';
import type { WakeActionKind } from './wakeActionToken';
import { processAllProjects, type OrchestratorEnv } from './projectOrchestrator';

type RunnerEnv = {
  GITHUB_TOKEN?: string;
  GITHUB_ALLOWED_REPOS?: string;
  DARAKE_AUTOPILOT_SCHEDULE_ENABLED?: string;
  DARAKE_RUN_REGISTRY_ENABLED?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  NOTIFICATION_WEBHOOK_URL?: string;
  RUN_REGISTRY_KV?: KVNamespace;
  /** Public URL of the Pages app, e.g. https://your-app.pages.dev */
  APP_URL?: string;
} & OrchestratorEnv;

type GitHubHeaders = Record<string, string>;

function makeGithubHeaders(token: string): GitHubHeaders {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'darake-dev-app-ai',
  };
}

function parseRepoFromUrl(repoUrl: string): { owner: string; repo: string } | null {
  const normalized = repoUrl.trim().replace(/^https?:\/\//, '');
  const match = normalized.match(/^github\.com\/([^/\s]+)\/([^/\s?#]+)\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

async function findPrForIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  token: string,
): Promise<{ prNumber: number; prUrl: string } | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=50`,
      { headers: makeGithubHeaders(token) },
    );
    if (!res.ok) return null;
    type GhPr = { html_url: string; number: number; title: string; body: string | null };
    const prs = (await res.json().catch(() => [])) as GhPr[];
    const issueRefRegex = new RegExp(`#${issueNumber}(?![0-9])`, 'g');
    const issueFullRef = `/${owner}/${repo}/issues/${issueNumber}`;
    const found = prs.find((pr) => {
      const text = `${pr.title} ${pr.body ?? ''}`;
      return issueRefRegex.test(text) || text.includes(issueFullRef);
    });
    if (!found) return null;
    return { prNumber: found.number, prUrl: found.html_url };
  } catch {
    return null;
  }
}

async function getPrHealth(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<'checks-running' | 'checks-passed' | 'checks-failed' | 'ready-to-merge' | 'unknown'> {
  try {
    const prRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers: makeGithubHeaders(token) },
    );
    if (!prRes.ok) return 'unknown';
    type GhPrDetail = { head: { sha: string }; mergeable?: boolean; mergeable_state?: string };
    const pr = (await prRes.json()) as GhPrDetail;

    const checksRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${pr.head.sha}/check-runs?per_page=50`,
      { headers: makeGithubHeaders(token) },
    );
    if (!checksRes.ok) return 'unknown';

    type CheckRun = { status: string; conclusion: string | null };
    type CheckRunsResponse = { check_runs: CheckRun[] };
    const checksData = (await checksRes.json().catch(() => ({ check_runs: [] }))) as CheckRunsResponse;
    const runs = checksData.check_runs;

    if (runs.length === 0) return 'checks-running';

    const inProgress = runs.some((r) => r.status === 'in_progress' || r.status === 'queued');
    if (inProgress) return 'checks-running';

    const failed = runs.some((r) => r.conclusion === 'failure' || r.conclusion === 'timed_out');
    if (failed) return 'checks-failed';

    const completedRuns = runs.filter((r) => r.conclusion !== null);
    const allPassed =
      completedRuns.length > 0 &&
      completedRuns.every(
        (r) =>
          r.conclusion === 'success' ||
          r.conclusion === 'skipped' ||
          r.conclusion === 'neutral',
      );

    if (allPassed) {
      if (pr.mergeable === true && pr.mergeable_state === 'clean') return 'ready-to-merge';
      return 'checks-passed';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

async function postPrComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  token: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
      {
        method: 'POST',
        headers: {
          ...makeGithubHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function sendWakeNotification(
  env: RunnerEnv,
  run: DarakeRemoteRun,
  reason: string,
  nextActionLabel: string,
  actionKind: WakeActionKind,
  actionUrl?: string,
  fixCommentBody?: string,
): Promise<void> {
  if (!shouldSendWake(run.lastWakeReason, run.wakeSentAt, reason)) return;

  // Create an action token so the user can handle the item later with one tap.
  // Compatibility note: token plumbing still uses "wakeAction" names for now.
  let wakeActionUrl: string | undefined;
  if (env.RUN_REGISTRY_KV && env.APP_URL) {
    const token = createWakeActionToken({
      runId: run.id,
      reason,
      actionKind,
      actionUrl,
      prUrl: run.prUrl,
      prNumber: run.prNumber,
      issueUrl: run.issueUrl,
      issueNumber: run.issueNumber,
      repoUrl: run.repoUrl,
      message: fixCommentBody ?? reason,
      nextActionLabel,
    });
    await saveWakeActionToken(env.RUN_REGISTRY_KV, token).catch(() => null);
    wakeActionUrl = `${env.APP_URL.replace(/\/$/, '')}/?wakeAction=${token.tokenId}`;
  }

  const payload: DarakeWebhookPayload = {
    title: 'だらけ管制室 - 後で確認することがあります',
    message: `${run.appName} で後で見ればよい項目があります`,
    reason,
    nextActionLabel,
    actionUrl: wakeActionUrl ?? actionUrl,
    createdAt: new Date().toISOString(),
  };

  // Try Telegram
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    await sendTelegramNotification(env, payload).catch(() => null);
  }

  // Try Webhook
  if (env.NOTIFICATION_WEBHOOK_URL) {
    await sendWebhookNotification(env, payload).catch(() => null);
  }
}

/**
 * Process a single active run: check PR/CI status and update accordingly.
 * Never merges, approves, or pushes to main.
 */
async function processRun(run: DarakeRemoteRun, env: RunnerEnv): Promise<DarakeRemoteRun> {
  if (!env.GITHUB_TOKEN || !env.RUN_REGISTRY_KV) return run;
  if (shouldSkipCheck(run)) return run;

  const parsed = parseRepoFromUrl(run.repoUrl);
  if (!parsed) {
    const updated = setNextCheckAfter({ ...run, lastCheckedAt: new Date().toISOString() }, 'active');
    await saveRun(env.RUN_REGISTRY_KV, updated);
    return updated;
  }

  const { owner, repo } = parsed;
  let updated = { ...run, lastCheckedAt: new Date().toISOString() };

  // If no PR yet, look for one
  if (!updated.prNumber && updated.issueNumber) {
    const prFound = await findPrForIssue(owner, repo, updated.issueNumber, env.GITHUB_TOKEN);
    if (prFound) {
      updated = { ...updated, prNumber: prFound.prNumber, prUrl: prFound.prUrl };
    } else {
      // No PR yet — check again later
      const saved = setNextCheckAfter(updated, 'active');
      await saveRun(env.RUN_REGISTRY_KV, saved);
      return saved;
    }
  }

  if (!updated.prNumber) {
    const saved = setNextCheckAfter(updated, 'active');
    await saveRun(env.RUN_REGISTRY_KV, saved);
    return saved;
  }

  // Check PR health
  const health = await getPrHealth(owner, repo, updated.prNumber, env.GITHUB_TOKEN);

  if (health === 'checks-running') {
    const saved = setNextCheckAfter(updated, 'active');
    await saveRun(env.RUN_REGISTRY_KV, saved);
    return saved;
  }

  if (health === 'checks-passed' || health === 'ready-to-merge') {
    if (WAKE_NOTIFY_REASONS.has('merge-candidate')) {
      await sendWakeNotification(
        env,
        updated,
        'PRがマージ候補になりました',
        'PRを後で確認してください',
        'open-pr',
        updated.prUrl,
      );
    }
    const saved = {
      ...updated,
      status: 'merge-candidate' as const,
      lastWakeReason: 'PRがマージ候補になりました',
      wakeSentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveRun(env.RUN_REGISTRY_KV, saved);
    return saved;
  }

  if (health === 'checks-failed') {
    const maxAttempts = updated.maxAutoFixAttempts ?? 2;

    if (updated.autoFixAttempts >= maxAttempts) {
      await sendWakeNotification(
        env,
        updated,
        `Build失敗が${maxAttempts}回続きました`,
        '後で詳細を確認してください',
        'show-details',
        updated.prUrl,
      );
      const saved = {
        ...updated,
        status: 'needs-human' as const,
        lastWakeReason: `Build失敗が${maxAttempts}回続きました`,
        wakeSentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveRun(env.RUN_REGISTRY_KV, saved);
      return saved;
    }

    // Add a later-review action so the user can send a fix request with one tap.
    const attemptNum = updated.autoFixAttempts + 1;
    const fixBody = `## だらけ自動修正リクエスト (試行 ${attemptNum}/${maxAttempts})\n\nCIが失敗しました。エラーを確認して修正してください。`;
    await sendWakeNotification(
      env,
      updated,
      'Buildに失敗しました',
      'AIに修正をお願いする',
      'send-fix-request',
      updated.prUrl,
      fixBody,
    );

    const saved = setNextCheckAfter(
      {
        ...updated,
        autoFixAttempts: updated.autoFixAttempts + 1,
        lastWakeReason: 'Buildに失敗しました',
        wakeSentAt: new Date().toISOString(),
      },
      'active',
    );
    await saveRun(env.RUN_REGISTRY_KV, saved);
    return saved;
  }

  // Unknown or other health — check again later
  const saved = setNextCheckAfter(updated, 'active');
  await saveRun(env.RUN_REGISTRY_KV, saved);
  return saved;
}

/**
 * Main scheduled autopilot runner.
 * Called by the Cron Trigger handler in worker/scheduled.ts.
 * 1. Check DARAKE_AUTOPILOT_SCHEDULE_ENABLED
 * 2. List active runs
 * 3. Process each run (check PR/CI, send notifications if needed)
 */
export async function runAutopilotScheduled(env: RunnerEnv): Promise<void> {
  if (env.DARAKE_AUTOPILOT_SCHEDULE_ENABLED !== 'true') {
    console.log('[darake-runner] DARAKE_AUTOPILOT_SCHEDULE_ENABLED is not true — skipping');
    return;
  }

  if (!env.RUN_REGISTRY_KV) {
    console.warn('[darake-runner] RUN_REGISTRY_KV not set — skipping');
    return;
  }

  if (!env.GITHUB_TOKEN) {
    console.warn('[darake-runner] GITHUB_TOKEN not set — skipping');
    return;
  }

  let runs: DarakeRemoteRun[];
  try {
    runs = await listActiveRuns(env.RUN_REGISTRY_KV);
  } catch (err) {
    console.error('[darake-runner] Failed to list active runs:', err);
    return;
  }

  console.log(`[darake-runner] Processing ${runs.length} active run(s)`);

  for (const run of runs) {
    try {
      await processRun(run, env);
    } catch (err) {
      console.error(`[darake-runner] Error processing run ${run.id}:`, err);
    }
  }

  // Parallel project orchestration (gated by DARAKE_PROJECT_AUTOPILOT_ENABLED).
  try {
    await processAllProjects(env);
  } catch (err) {
    console.error('[darake-runner] Project orchestration error:', err);
  }
}
