import fs from 'node:fs/promises';

const repo = process.env.GITHUB_REPOSITORY ?? 'sunpotflower4460-cpu/darake-dev-app-AI';
const token = process.env.GITHUB_TOKEN;
const outputPath = process.env.CI_WATCH_OUTPUT ?? 'snapshot/ci-watch.json';
const apiBase = 'https://api.github.com';
const repoUrl = `https://github.com/${repo}`;

async function fetchWorkflowRuns() {
  if (!token) {
    return [];
  }

  const response = await fetch(`${apiBase}/repos/${repo}/actions/runs?per_page=20`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub workflow runs API failed: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
}

function toWatchStatus(run) {
  if (run.status === 'queued' || run.status === 'in_progress' || run.status === 'waiting') {
    return 'checking';
  }

  if (run.conclusion === 'success' || run.conclusion === 'skipped') {
    return 'ok';
  }

  if (run.conclusion === 'failure' || run.conclusion === 'cancelled' || run.conclusion === 'timed_out') {
    return 'blocked';
  }

  if (run.conclusion === 'action_required') {
    return 'manual';
  }

  return 'manual';
}

function toRisk(run) {
  const status = toWatchStatus(run);

  if (status === 'blocked') {
    return 'high';
  }

  if (status === 'manual' || status === 'checking') {
    return 'medium';
  }

  return 'low';
}

function toMessage(run) {
  const conclusion = run.conclusion ?? 'running';
  const status = run.status ?? 'unknown';
  return `${run.name ?? 'Workflow'} は ${status} / ${conclusion} です。`;
}

function toItem(run) {
  const url = run.html_url ?? `${repoUrl}/actions/runs/${run.id}`;
  const status = toWatchStatus(run);

  return {
    id: `ci-${run.id}`,
    label: run.name ?? `Workflow #${run.id}`,
    status,
    message: toMessage(run),
    url,
    risk: toRisk(run),
    links: [
      { label: 'Workflow run', url },
      { label: 'Actions', url: `${repoUrl}/actions` },
    ],
    actions: [
      {
        label: status === 'ok' ? '放っておく' : '確認する',
        kind: status === 'ok' ? 'wait' : 'manual',
        url,
      },
    ],
    meta: {
      runId: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      event: run.event,
      branch: run.head_branch,
      headSha: run.head_sha,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      actor: run.actor?.login,
    },
  };
}

async function writeJson(payload) {
  await fs.mkdir(outputPath.split('/').slice(0, -1).join('/'), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
}

async function main() {
  const runs = await fetchWorkflowRuns();
  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: token ? 'github-actions-runs-api' : 'missing-token-fallback',
    repository: repo,
    items: runs.map(toItem),
  };

  await writeJson(snapshot);
  console.log(`Wrote ${outputPath} with ${snapshot.items.length} CI items`);
}

main().catch(async (error) => {
  const fallback = {
    generatedAt: new Date().toISOString(),
    source: 'github-actions-runs-api-error',
    repository: repo,
    error: error instanceof Error ? error.message : 'unknown error',
    items: [],
  };

  await writeJson(fallback);
  console.log(`Wrote fallback ${outputPath}`);
});
