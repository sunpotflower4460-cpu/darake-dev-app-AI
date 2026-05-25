import type { DarakeProject } from '../src/utils/darakeProject';
import type { DarakeRemoteRun } from '../src/utils/darakeRemoteRun';
import type { DarakeWebhookPayload } from '../src/utils/darakeRemoteRun';
import { getProject, listProjects, saveProject } from './projectRegistry';
import {
  createRunId,
  getRun,
  saveRun,
  setNextCheckAfter,
  shouldSkipCheck,
} from './runRegistry';
import { sendTelegramNotification, sendWebhookNotification } from './notificationSender';
import { createWakeActionToken, saveWakeActionToken } from './wakeActionToken';
import { appendAudit } from './auditLog';

export type OrchestratorEnv = {
  GITHUB_TOKEN?: string;
  RUN_REGISTRY_KV?: KVNamespace;
  DARAKE_PROJECT_AUTOPILOT_ENABLED?: string;
  GITHUB_ISSUE_CREATE_ENABLED?: string;
  GITHUB_AGENT_ASSIGN_ENABLED?: string;
  GITHUB_PR_MERGE_ENABLED?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  NOTIFICATION_WEBHOOK_URL?: string;
  APP_URL?: string;
};

const VERIFY_PASS_LABEL = 'darake:verify-pass';
const VERIFY_FAIL_LABEL = 'darake:verify-fail';
const MAX_VERIFY_ATTEMPTS = 3;
const MAX_BUILD_ATTEMPTS = 3;

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

function buildIssueBody(project: DarakeProject, phase: NonNullable<DarakeProject['plan']>['phases'][number]): string {
  const visual = project.visualSpec
    ? `\n## デザイン指針\n- パレット: ${project.visualSpec.palette.join(', ')}\n- 雰囲気: ${project.visualSpec.vibe}\n${project.visualSpec.layoutNotes.map((n) => `- ${n}`).join('\n')}`
    : '';
  return [
    `## 概要`,
    phase.purpose,
    '',
    `## タスク`,
    ...phase.tasks.map((t) => `- [ ] ${t}`),
    '',
    `## 完了条件`,
    ...phase.doneConditions.map((d) => `- ${d}`),
    phase.manualGates.length > 0
      ? `\n## ⚠️ Manual Gate\n${phase.manualGates.map((g) => `- ${g}`).join('\n')}`
      : '',
    visual,
    '',
    `## Safety Note`,
    `- 課金・個人情報・本番リリースは自動実行しません`,
    `- secret / token は保存しません`,
    '',
    `@copilot このフェーズを実装してPRを作成してください。`,
  ].join('\n');
}

async function createIssueAndAssign(
  project: DarakeProject,
  phase: NonNullable<DarakeProject['plan']>['phases'][number],
  env: OrchestratorEnv,
): Promise<{ issueNumber: number; issueUrl: string } | null> {
  if (!env.GITHUB_TOKEN) return null;
  const parts = repoParts(project.repoFullName);
  if (!parts) return null;

  const title = `[${project.name}][${phase.id}] ${phase.title}`;
  const issueRes = await fetch(
    `https://api.github.com/repos/${parts.owner}/${parts.repo}/issues`,
    {
      method: 'POST',
      headers: ghHeaders(env.GITHUB_TOKEN),
      body: JSON.stringify({ title, body: buildIssueBody(project, phase) }),
    },
  );
  const issueJson = (await issueRes.json().catch(() => null)) as {
    number?: number;
    html_url?: string;
  } | null;
  if (!issueRes.ok || !issueJson?.number || !issueJson.html_url) return null;

  // Assign @copilot (best-effort, gated).
  if (env.GITHUB_AGENT_ASSIGN_ENABLED === 'true') {
    await fetch(
      `https://api.github.com/repos/${parts.owner}/${parts.repo}/issues/${issueJson.number}/assignees`,
      {
        method: 'POST',
        headers: ghHeaders(env.GITHUB_TOKEN),
        body: JSON.stringify({ assignees: ['copilot'] }),
      },
    ).catch(() => null);
  }

  return { issueNumber: issueJson.number, issueUrl: issueJson.html_url };
}

async function findPrForIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  token: string,
): Promise<{ prNumber: number; prUrl: string } | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=50`,
    { headers: ghHeaders(token) },
  );
  if (!res.ok) return null;
  type GhPr = { html_url: string; number: number; title: string; body: string | null };
  const prs = (await res.json().catch(() => [])) as GhPr[];
  const ref = new RegExp(`#${issueNumber}(?![0-9])`);
  const full = `/${owner}/${repo}/issues/${issueNumber}`;
  const found = prs.find((pr) => {
    const text = `${pr.title} ${pr.body ?? ''}`;
    return ref.test(text) || text.includes(full);
  });
  return found ? { prNumber: found.number, prUrl: found.html_url } : null;
}

type PrSnapshot = {
  headSha: string;
  ci: 'running' | 'passed' | 'failed' | 'unknown';
  labels: string[];
  mergeable: boolean;
};

async function getPrSnapshot(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<PrSnapshot | null> {
  const prRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    { headers: ghHeaders(token) },
  );
  if (!prRes.ok) return null;
  type GhPr = {
    head: { sha: string };
    mergeable?: boolean | null;
    mergeable_state?: string | null;
    labels?: Array<{ name: string }>;
  };
  const pr = (await prRes.json()) as GhPr;
  const labels = (pr.labels ?? []).map((l) => l.name);

  const checksRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits/${pr.head.sha}/check-runs?per_page=50`,
    { headers: ghHeaders(token) },
  );
  let ci: PrSnapshot['ci'] = 'unknown';
  if (checksRes.ok) {
    type CheckRun = { status: string; conclusion: string | null };
    const data = (await checksRes.json().catch(() => ({ check_runs: [] }))) as {
      check_runs: CheckRun[];
    };
    const runs = data.check_runs;
    if (runs.length === 0) {
      ci = 'running';
    } else if (runs.some((r) => r.status === 'in_progress' || r.status === 'queued')) {
      ci = 'running';
    } else if (runs.some((r) => r.conclusion === 'failure' || r.conclusion === 'timed_out')) {
      ci = 'failed';
    } else {
      const completed = runs.filter((r) => r.conclusion !== null);
      ci = completed.every((r) => ['success', 'skipped', 'neutral'].includes(r.conclusion ?? ''))
        ? 'passed'
        : 'unknown';
    }
  }

  return {
    headSha: pr.head.sha,
    ci,
    labels,
    mergeable: pr.mergeable === true && pr.mergeable_state === 'clean',
  };
}

async function mergePr(
  owner: string,
  repo: string,
  prNumber: number,
  headSha: string,
  token: string,
): Promise<boolean> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/merge`,
    {
      method: 'PUT',
      headers: ghHeaders(token),
      body: JSON.stringify({ sha: headSha, merge_method: 'squash' }),
    },
  );
  return res.ok;
}

async function postComment(
  owner: string,
  repo: string,
  number: number,
  body: string,
  token: string,
): Promise<void> {
  await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`, {
    method: 'POST',
    headers: ghHeaders(token),
    body: JSON.stringify({ body }),
  }).catch(() => null);
}

async function notify(
  env: OrchestratorEnv,
  project: DarakeProject,
  reason: string,
  nextActionLabel: string,
  actionUrl?: string,
): Promise<void> {
  let url = actionUrl;
  if (env.RUN_REGISTRY_KV && env.APP_URL) {
    const token = createWakeActionToken({
      runId: project.id,
      reason,
      actionKind: 'show-details',
      actionUrl,
      message: reason,
      nextActionLabel,
    });
    await saveWakeActionToken(env.RUN_REGISTRY_KV, token).catch(() => null);
    url = `${env.APP_URL.replace(/\/$/, '')}/?wakeAction=${token.tokenId}`;
  }
  const payload: DarakeWebhookPayload = {
    title: 'だらけ管制室',
    message: `${project.name}: ${reason}`,
    reason,
    nextActionLabel,
    actionUrl: url ?? actionUrl,
    createdAt: new Date().toISOString(),
  };
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    await sendTelegramNotification(env, payload).catch(() => null);
  }
  if (env.NOTIFICATION_WEBHOOK_URL) {
    await sendWebhookNotification(env, payload).catch(() => null);
  }
}

function phaseIndex(project: DarakeProject, phaseId: string | undefined): number {
  if (!project.plan || !phaseId) return -1;
  return project.plan.phases.findIndex((p) => p.id === phaseId);
}

async function startPhase(
  project: DarakeProject,
  phaseIdx: number,
  env: OrchestratorEnv,
): Promise<DarakeProject> {
  const plan = project.plan!;
  const phase = plan.phases[phaseIdx];
  const created = await createIssueAndAssign(project, phase, env);
  const now = new Date().toISOString();

  if (!created) {
    await appendAudit(env, {
      scope: project.id,
      kind: 'phase-issue-failed',
      message: `phase=${phase.id} issue作成に失敗`,
    });
    return { ...project, status: 'failed', updatedAt: now };
  }

  const run: DarakeRemoteRun = {
    id: createRunId(),
    appName: project.name,
    repoUrl: project.repoUrl,
    issueUrl: created.issueUrl,
    issueNumber: created.issueNumber,
    status: 'active',
    autoFixAttempts: 0,
    maxAutoFixAttempts: MAX_BUILD_ATTEMPTS,
    verifyAttempts: 0,
    projectId: project.id,
    phaseId: phase.id,
    createdAt: now,
    updatedAt: now,
  };
  const scheduled = setNextCheckAfter(run, 'active');
  if (env.RUN_REGISTRY_KV) await saveRun(env.RUN_REGISTRY_KV, scheduled);

  await appendAudit(env, {
    scope: project.id,
    kind: 'phase-started',
    message: `phase=${phase.id} issue#${created.issueNumber}`,
  });

  return {
    ...project,
    status: 'building',
    currentPhaseId: phase.id,
    phaseRunIds: { ...(project.phaseRunIds ?? {}), [phase.id]: scheduled.id },
    updatedAt: now,
  };
}

/**
 * Advance a single project by one cron tick. Never blocks; persists state.
 */
export async function processProject(
  project: DarakeProject,
  env: OrchestratorEnv,
): Promise<void> {
  if (!env.GITHUB_TOKEN || !env.RUN_REGISTRY_KV) return;
  if (!project.plan || project.plan.phases.length === 0) return;
  if (['done', 'failed', 'paused', 'awaiting-user', 'submitting'].includes(project.status)) return;

  // Kick off the first phase.
  if (project.status === 'planning' || !project.currentPhaseId) {
    const next = await startPhase(project, 0, env);
    await saveProject(env.RUN_REGISTRY_KV, next);
    return;
  }

  const runId = project.phaseRunIds?.[project.currentPhaseId];
  if (!runId) {
    // Lost the run reference — restart current phase.
    const idx = Math.max(0, phaseIndex(project, project.currentPhaseId));
    const next = await startPhase(project, idx, env);
    await saveProject(env.RUN_REGISTRY_KV, next);
    return;
  }

  const run = await getRun(env.RUN_REGISTRY_KV, runId);
  if (!run) return;
  if (shouldSkipCheck(run)) return;

  const parts = repoParts(project.repoFullName);
  if (!parts) return;
  const { owner, repo } = parts;

  let updated: DarakeRemoteRun = { ...run, lastCheckedAt: new Date().toISOString() };

  // Resolve PR.
  if (!updated.prNumber && updated.issueNumber) {
    const pr = await findPrForIssue(owner, repo, updated.issueNumber, env.GITHUB_TOKEN);
    if (pr) {
      updated = { ...updated, prNumber: pr.prNumber, prUrl: pr.prUrl };
    } else {
      await saveRun(env.RUN_REGISTRY_KV, setNextCheckAfter(updated, 'active'));
      return;
    }
  }
  if (!updated.prNumber) {
    await saveRun(env.RUN_REGISTRY_KV, setNextCheckAfter(updated, 'active'));
    return;
  }

  const snap = await getPrSnapshot(owner, repo, updated.prNumber, env.GITHUB_TOKEN);
  if (!snap) {
    await saveRun(env.RUN_REGISTRY_KV, setNextCheckAfter(updated, 'active'));
    return;
  }

  // CI still running → wait.
  if (snap.ci === 'running' || snap.ci === 'unknown') {
    await saveRun(env.RUN_REGISTRY_KV, setNextCheckAfter(updated, 'active'));
    return;
  }

  // CI failed → build fix loop.
  if (snap.ci === 'failed') {
    if (updated.autoFixAttempts >= updated.maxAutoFixAttempts) {
      await notify(env, project, `${project.currentPhaseId}: ビルド失敗が続いています`, '詳細を確認', updated.prUrl);
      await saveRun(env.RUN_REGISTRY_KV, { ...updated, status: 'needs-human', updatedAt: new Date().toISOString() });
      await saveProject(env.RUN_REGISTRY_KV, { ...project, status: 'verifying', updatedAt: new Date().toISOString() });
      await appendAudit(env, { scope: project.id, kind: 'build-needs-human', message: `phase=${project.currentPhaseId}` });
      return;
    }
    const attempt = updated.autoFixAttempts + 1;
    await postComment(
      owner,
      repo,
      updated.prNumber,
      `## だらけ自動修正リクエスト (ビルド試行 ${attempt}/${updated.maxAutoFixAttempts})\n\nCIが失敗しました。ログを確認して修正してください。\n\n@copilot お願いします。`,
      env.GITHUB_TOKEN,
    );
    await saveRun(
      env.RUN_REGISTRY_KV,
      setNextCheckAfter({ ...updated, autoFixAttempts: attempt }, 'active'),
    );
    return;
  }

  // CI passed → consult the phase-verify label.
  if (snap.ci === 'passed') {
    if (snap.labels.includes(VERIFY_FAIL_LABEL)) {
      // The verify workflow already posted a fix-request comment to @copilot.
      const attempt = (updated.verifyAttempts ?? 0) + 1;
      if (attempt > MAX_VERIFY_ATTEMPTS) {
        await notify(env, project, `${project.currentPhaseId}: 設計図との差分が解消できません`, '詳細を確認', updated.prUrl);
        await saveRun(env.RUN_REGISTRY_KV, { ...updated, status: 'needs-human', updatedAt: new Date().toISOString() });
        await appendAudit(env, { scope: project.id, kind: 'verify-needs-human', message: `phase=${project.currentPhaseId}` });
        return;
      }
      await saveRun(env.RUN_REGISTRY_KV, setNextCheckAfter({ ...updated, verifyAttempts: attempt }, 'active'));
      return;
    }

    if (snap.labels.includes(VERIFY_PASS_LABEL)) {
      // Merge (gated) and advance.
      if (env.GITHUB_PR_MERGE_ENABLED === 'true' && snap.mergeable) {
        const merged = await mergePr(owner, repo, updated.prNumber, snap.headSha, env.GITHUB_TOKEN);
        if (!merged) {
          await saveRun(env.RUN_REGISTRY_KV, setNextCheckAfter(updated, 'active'));
          return;
        }
      } else {
        // Merge not enabled — hand off to human as a merge candidate.
        await notify(env, project, `${project.currentPhaseId}: 検証OK、マージ待ちです`, 'PRを確認してマージ', updated.prUrl);
        await saveRun(env.RUN_REGISTRY_KV, { ...updated, status: 'merge-candidate', updatedAt: new Date().toISOString() });
        return;
      }

      await saveRun(env.RUN_REGISTRY_KV, { ...updated, status: 'done', updatedAt: new Date().toISOString() });
      await appendAudit(env, { scope: project.id, kind: 'phase-merged', message: `phase=${project.currentPhaseId}` });

      const idx = phaseIndex(project, project.currentPhaseId);
      const isLast = idx >= project.plan.phases.length - 1;
      if (isLast) {
        const done = {
          ...project,
          status: 'awaiting-user' as const,
          updatedAt: new Date().toISOString(),
        };
        await saveProject(env.RUN_REGISTRY_KV, done);
        await notify(
          env,
          project,
          '全フェーズ完了しました。完成判定をしてください',
          'プレビューを確認',
          project.pagesPreviewBaseUrl,
        );
        await appendAudit(env, { scope: project.id, kind: 'all-phases-done', message: 'awaiting-user' });
      } else {
        const next = await startPhase(project, idx + 1, env);
        await saveProject(env.RUN_REGISTRY_KV, next);
      }
      return;
    }

    // CI passed but no verify label yet — the phase-verify workflow is still running.
    await saveRun(env.RUN_REGISTRY_KV, setNextCheckAfter(updated, 'active'));
    return;
  }
}

/**
 * Process all building/verifying projects in one cron tick.
 */
export async function processAllProjects(env: OrchestratorEnv): Promise<void> {
  if (env.DARAKE_PROJECT_AUTOPILOT_ENABLED !== 'true') return;
  if (!env.RUN_REGISTRY_KV || !env.GITHUB_TOKEN) return;

  let projects: DarakeProject[];
  try {
    projects = await listProjects(env.RUN_REGISTRY_KV, 50);
  } catch {
    return;
  }
  const active = projects.filter((p) =>
    ['planning', 'building', 'verifying'].includes(p.status),
  );
  for (const p of active) {
    try {
      // Re-read to avoid acting on stale state across the loop.
      const fresh = (await getProject(env.RUN_REGISTRY_KV, p.id)) ?? p;
      await processProject(fresh, env);
    } catch (err) {
      console.error(`[darake-orchestrator] project ${p.id} error:`, err);
    }
  }
}
