import fs from 'node:fs/promises';

const outputPath = process.env.REVIEW_WATCH_OUTPUT ?? 'snapshot/review-watch.json';
const repoUrl = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI';

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: 'github-actions',
  items: [
    {
      id: 'pr',
      label: 'PR',
      status: 'checking',
      message: 'PR差分と説明を確認します。',
      url: `${repoUrl}/pulls`,
      risk: 'medium',
      links: [{ label: 'PR一覧', url: `${repoUrl}/pulls` }],
      actions: [{ label: 'PRを見る', kind: 'open', url: `${repoUrl}/pulls` }],
    },
    {
      id: 'ci',
      label: 'CI',
      status: 'ok',
      message: 'state:build / typecheck / build の結果を確認します。',
      url: `${repoUrl}/actions`,
      risk: 'low',
      links: [{ label: 'Actions', url: `${repoUrl}/actions` }],
      actions: [{ label: '放っておく', kind: 'wait' }],
    },
    {
      id: 'review',
      label: 'レビュー',
      status: 'manual',
      message: 'レビューコメントがある場合は確認します。',
      url: `${repoUrl}/pulls`,
      risk: 'medium',
      links: [{ label: 'レビュー確認', url: `${repoUrl}/pulls` }],
      actions: [{ label: '確認する', kind: 'manual', url: `${repoUrl}/pulls` }],
    },
    {
      id: 'merge',
      label: 'マージ判断',
      status: 'manual',
      message: '問題がなければ次へ進めます。',
      url: `${repoUrl}/pulls`,
      risk: 'high',
      links: [{ label: 'マージ候補', url: `${repoUrl}/pulls` }],
      actions: [{ label: '人間確認', kind: 'manual', url: `${repoUrl}/pulls` }],
    },
  ],
};

await fs.mkdir(outputPath.split('/').slice(0, -1).join('/'), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
