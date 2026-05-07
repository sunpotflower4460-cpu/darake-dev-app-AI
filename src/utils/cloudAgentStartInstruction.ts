import type { GitHubIssueRecord } from './githubIssueRecord';

/**
 * Issue URLが記録されたら、Cloud Agentに貼るためのメッセージを生成します。
 * まだGitHubには自動投稿しません。作ったIssueのURLを記録するだけです。
 */
export function buildCloudAgentStartInstruction(record: GitHubIssueRecord): string {
  const repoUrl = `https://github.com/${record.owner}/${record.repo}`;

  return [
    '# Cloud Agent 作業開始指示',
    '',
    '以下のIssueをもとに作業を開始してください。',
    '',
    '## 対象Issue',
    record.issueUrl,
    '',
    '## 対象リポジトリ',
    repoUrl,
    '',
    '## 作業方針',
    '- Issue本文に沿って実装してください',
    '- まずは最小変更で進めてください',
    '- 1PRにまとめてください',
    '- 既存UIや初回導線を壊さないでください',
    '- npm run typecheck を通してください',
    '- npm run build を通してください',
    '',
    '## 禁止事項',
    '- secret/token/APIキーを追加しない',
    '- 認証・課金・App Store提出はしない',
    '- 本番DBや外部APIを勝手に接続しない',
    '- 危険な操作が必要な場合は止めて報告してください',
    '',
    '## 完了時に返してほしいもの',
    '- PR URL',
    '- 変更内容の要約',
    '- 確認したコマンド',
    '- 残りの注意点',
  ].join('\n');
}
