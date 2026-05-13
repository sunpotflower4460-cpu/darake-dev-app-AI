import fs from 'node:fs';

const summaryPath = process.env.GITHUB_STEP_SUMMARY;

const status = process.env.DARAKE_SETUP_STATUS || 'unknown';
const accountMode = process.env.DARAKE_ACCOUNT_MODE || 'unknown';
const workerSecretMode = process.env.DARAKE_WORKER_SECRET_MODE || 'unknown';
const workerName = process.env.DARAKE_WORKER_NAME || 'darakedevapp';

const lines = [];

lines.push('# だらけ Cloudflare Setup 結果');
lines.push('');

if (status === 'success') {
  lines.push('## 完了');
  lines.push('');
  lines.push('Cloudflareへの反映が完了しました。');
  lines.push('');
  lines.push('次は、だらけdev app に戻って次のボタンを押してください。');
  lines.push('');
  lines.push('```text');
  lines.push('設定したので再チェック');
  lines.push('```');
} else if (status === 'missing-cloudflare-token') {
  lines.push('## まだ足りないものがあります');
  lines.push('');
  lines.push('GitHub側に `CLOUDFLARE_API_TOKEN` を追加してください。');
  lines.push('');
  lines.push('開く場所:');
  lines.push('');
  lines.push('```text');
  lines.push('GitHub → Settings → Secrets and variables → Actions → New repository secret');
  lines.push('```');
} else if (status === 'multiple-cloudflare-accounts') {
  lines.push('## Cloudflareアカウントを1つに決める必要があります');
  lines.push('');
  lines.push('Cloudflareアカウントが複数見つかりました。');
  lines.push('GitHub側に `CLOUDFLARE_ACCOUNT_ID` を追加してください。');
  lines.push('');
  lines.push('これは複数アカウントの時だけ必要です。');
} else if (status === 'no-cloudflare-account') {
  lines.push('## Cloudflareアカウントが見つかりません');
  lines.push('');
  lines.push('CloudflareのToken権限か、ログイン中のCloudflareアカウントを確認してください。');
} else if (status === 'cloudflare-api-error') {
  lines.push('## Cloudflareの確認に失敗しました');
  lines.push('');
  lines.push('Cloudflare API Tokenの権限を確認してください。');
} else if (status === 'deploy-failed') {
  lines.push('## Cloudflareへの反映に失敗しました');
  lines.push('');
  lines.push('まずは下の不足チェックを確認してください。');
} else {
  lines.push('## 確認が必要です');
  lines.push('');
  lines.push('Cloudflare Setup の途中で確認が必要になりました。');
}

lines.push('');
lines.push('## 今回の状態');
lines.push('');
lines.push('| 項目 | 状態 |');
lines.push('| --- | --- |');
lines.push(`| Worker | ${workerName} |`);
lines.push(`| Cloudflare Account | ${accountMode} |`);
lines.push(`| Worker GitHub連携 | ${workerSecretMode} |`);

lines.push('');
lines.push('## だらけメモ');
lines.push('');
lines.push('- 強い値はチャットやコードに貼らないでください。');
lines.push('- GitHub側の登録ページにだけ入れてください。');
lines.push('- 成功したら、アプリに戻って再チェックするだけです。');

const output = `${lines.join('\n')}\n`;
console.log(output);

if (summaryPath) {
  fs.appendFileSync(summaryPath, output);
}
