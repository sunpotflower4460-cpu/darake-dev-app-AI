import fs from 'node:fs/promises';

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: 'script',
  repository: {
    name: 'darake-dev-app-AI',
    fullName: 'sunpotflower4460-cpu/darake-dev-app-AI',
    visibility: 'private',
    defaultBranch: 'main'
  },
  counts: {
    issues: 0,
    pullRequests: 6,
    mergedPullRequests: 6
  },
  pullRequests: [
    { number: 6, title: 'Phase 3.5', status: 'merged' },
    { number: 5, title: 'Phase 3', status: 'merged' },
    { number: 4, title: 'P3 prep', status: 'merged' }
  ]
};

await fs.mkdir('public', { recursive: true });
await fs.writeFile('public/repo-state.json', `${JSON.stringify(snapshot, null, 2)}\n`);
console.log('repo-state.json updated');
