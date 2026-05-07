import type { FailureSummary } from './failureSummary';

export type BuildAgentFixInstructionInput = {
  repoUrl: string;
  issueUrl?: string;
  prUrl: string;
  prNumber: number;
  failure: FailureSummary;
  attemptCount: number;
};

export function buildAgentFixInstruction(input: BuildAgentFixInstructionInput): string {
  const lines: string[] = [
    '# AIへの追加修正指示',
    '',
    'PRの確認で問題が見つかりました。',
    '以下を最小変更で修正してください。',
    '',
    '## 対象PR',
    input.prUrl,
    '',
  ];

  if (input.issueUrl) {
    lines.push('## 関連Issue', input.issueUrl, '');
  }

  lines.push('## 見つかった問題', input.failure.shortMessage, '');

  if (input.failure.likelyFiles.length > 0) {
    lines.push('## 確認ファイル候補', ...input.failure.likelyFiles.map((f) => `- ${f}`), '');
  }

  lines.push(
    '## やること',
    '- 失敗原因を確認してください',
    '- 最小変更で修正してください',
    '- npm run typecheck を通してください',
    '- npm run build を通してください',
    '- 既存の初回導線を壊さないでください',
    '',
    '## 禁止事項',
    '- secret/token/APIキーを追加しない',
    '- 認証・課金・App Store提出はしない',
    '- 本番DBや外部APIを勝手に接続しない',
    '- 大きな設計変更をしない',
    '- merge / approve はしない',
    '',
    '## 完了時に返してほしいもの',
    '- 修正内容',
    '- 確認したコマンド',
    '- 残りの注意点',
  );

  if (input.attemptCount > 0) {
    lines.push('', `(修正試行 ${input.attemptCount + 1} 回目)`);
  }

  return lines.join('\n');
}
