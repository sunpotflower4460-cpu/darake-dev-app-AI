import fs from 'node:fs/promises';

const repo = process.env.GITHUB_REPOSITORY ?? 'sunpotflower4460-cpu/darake-dev-app-AI';
const token = process.env.GITHUB_TOKEN;
const outputPath = process.env.PR_WATCH_OUTPUT ?? 'snapshot/pr-watch.json';
const apiBase = 'https://api.github.com';
const repoUrl = `https://github.com/${repo}`;

async function fetchOpenPullRequests() {
  if (!token) {
    return [];
  }

  const response = await fetch(`${apiBase}/repos/${repo}/pulls?state=open&per_page=20&sort=updated&direction=desc`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub pull request API failed: ${response.status}`);
  }

  return response.json();
}

function toWatchStatus(pr) {
  if (pr.draft) {
    return 'manual';
  }

  if (pr.mergeable === false) {
    return 'blocked';
  }

  return 'checking';
}

function toRisk(pr) {
  if (pr.draft) {
    return 'medium';
  }

  return 'unknown';
}

function toItem(pr) {
  const label = `PR #${pr.number}`;
  const url = pr.html_url ?? `${repoUrl}/pull/${pr.number}`;

  return {
    id: `pr-${pr.number}`,
    label,
    status: toWatchStatus(pr),
    message: pr.title ?? 'タイトルなしのPRです。',
    url,
    risk: toRisk(pr),
    links: [
      { label: 'PRを開く', url },
      { label: 'Files changed', url: `${url}/files` },
      { label: 'Checks', url: `${url}/checks` },
    ],
    actions: [
      { label: 'PRを見る', kind: 'open', url },
      { label: pr.draft ? 'Draft解除待ち' : 'CIを待つ', kind: pr.draft ? 'manual' : 'wait', url },
    ],
    meta: {
      number: pr.number,
      state: pr.state,
      draft: Boolean(pr.draft),
      head: pr.head?.ref,
      base: pr.base?.ref,
      updatedAt: pr.updated_at,
      author: pr.user?.login,
    },
  };
}

async function main() {
  const pulls = await fetchOpenPullRequests();
  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: token ? 'github-actions-pr-api' : 'missing-token-fallback',
    repository: repo,
    items: pulls.map(toItem),
  };

  await fs.mkdir(outputPath.split('/').slice(0, -1).join('/'), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote ${outputPath} with ${snapshot.items.length} PR items`);
}

main().catch(async (error) => {
  const fallback = {
    generatedAt: new Date().toISOString(),
    source: 'github-actions-pr-api-error',
    repository: repo,
    error: error instanceof Error ? error.message : 'unknown error',
    items: [],
  };

  await fs.mkdir(outputPath.split('/').slice(0, -1).join('/'), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(fallback, null, 2)}\n`);
  console.log(`Wrote fallback ${outputPath}`);
});
