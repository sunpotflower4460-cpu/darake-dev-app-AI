import fs from 'node:fs/promises';

const outputPath = process.env.REVIEW_WATCH_OUTPUT ?? 'snapshot/review-watch.json';

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: 'github-actions',
  items: [
    {
      id: 'pr',
      label: 'PR',
      status: 'checking',
      message: 'PR差分と説明を確認します。',
    },
    {
      id: 'ci',
      label: 'CI',
      status: 'ok',
      message: 'state:build / typecheck / build の結果を確認します。',
    },
    {
      id: 'review',
      label: 'レビュー',
      status: 'manual',
      message: 'レビューコメントがある場合は確認します。',
    },
    {
      id: 'merge',
      label: 'マージ判断',
      status: 'manual',
      message: '問題がなければ次へ進めます。',
    },
  ],
};

await fs.mkdir(outputPath.split('/').slice(0, -1).join('/'), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
