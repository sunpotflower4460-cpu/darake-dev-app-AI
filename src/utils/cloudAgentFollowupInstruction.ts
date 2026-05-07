export type FollowupReason =
  | 'ci-failed'
  | 'build-failed'
  | 'typecheck-failed'
  | 'review-requested'
  | 'manual-gate'
  | 'unknown';

export type FollowupInstructionInput = {
  reason: FollowupReason;
  issueUrl?: string;
  prUrl?: string;
  logSummary?: string;
  userGoal?: string;
};

const REASON_LABELS: Record<FollowupReason, string> = {
  'ci-failed': 'CIが失敗しています。',
  'build-failed': 'ビルドが失敗しています。',
  'typecheck-failed': '型チェックが失敗しています。',
  'review-requested': 'レビューが必要です。',
  'manual-gate': '手動確認が必要な操作があります。',
  'unknown': '作業が止まっています。',
};

const REASON_TASKS: Record<FollowupReason, string[]> = {
  'ci-failed': [
    '失敗ログを確認してください',
    '最小変更で修正してください',
    'npm run typecheck を通してください',
    'npm run build を通してください',
  ],
  'build-failed': [
    'ビルドエラーを確認してください',
    '最小変更で修正してください',
    'npm run build を通してください',
  ],
  'typecheck-failed': [
    '型エラーを確認してください',
    '最小変更で修正してください',
    'npm run typecheck を通してください',
  ],
  'review-requested': [
    'レビューコメントを確認してください',
    '指摘内容を修正してください',
    '修正後にプッシュしてください',
  ],
  'manual-gate': [
    '手動確認が必要な操作の内容を確認してください',
    '安全に実行できるか判断してください',
    '危険な場合は止めて報告してください',
  ],
  'unknown': [
    '現在の状況を確認してください',
    '問題があれば最小変更で修正してください',
  ],
};

export function buildCloudAgentFollowupInstruction(
  input: FollowupInstructionInput,
): string {
  const reasonLabel = REASON_LABELS[input.reason];
  const tasks = REASON_TASKS[input.reason];

  const lines: string[] = [
    '# Cloud Agent 追加修正指示',
    '',
    reasonLabel,
    '',
  ];

  if (input.prUrl || input.issueUrl) {
    lines.push('## 対象');
    if (input.prUrl) {
      lines.push('PR:');
      lines.push(input.prUrl);
    }
    if (input.issueUrl) {
      lines.push('Issue:');
      lines.push(input.issueUrl);
    }
    lines.push('');
  }

  if (input.logSummary) {
    lines.push('## エラー概要', input.logSummary, '');
  }

  if (input.userGoal) {
    lines.push('## 目標', input.userGoal, '');
  }

  lines.push('## やること', ...tasks.map((t) => `- ${t}`), '');

  lines.push(
    '## 禁止',
    '- secret/tokenを追加しない',
    '- 認証/課金/App Store提出はしない',
    '- 大きな設計変更はしない',
    '',
  );

  lines.push(
    '## 完了時に返してほしいもの',
    '- 修正内容',
    '- 確認したコマンド',
    '- 残りの注意点',
  );

  return lines.join('\n');
}
