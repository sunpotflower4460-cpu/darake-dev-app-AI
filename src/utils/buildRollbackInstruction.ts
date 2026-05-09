export type RollbackInstruction = {
  prUrl?: string;
  prNumber?: number;
  repoUrl?: string;
  steps: string[];
  warningNote: string;
};

export function buildRollbackInstruction(params: {
  prUrl?: string;
  prNumber?: number;
  repoUrl?: string;
  deployUrl?: string;
  failureReason?: string;
}): RollbackInstruction {
  const steps: string[] = [];

  if (params.repoUrl && params.prNumber) {
    steps.push(
      `1. GitHubを開いて PR #${params.prNumber} を確認してください`,
      `2. Revertボタンを押して Revert PR を作成してください`,
      `3. RevertのPRをマージしてください`,
    );
  } else {
    steps.push(
      '1. GitHubでマージ済みのPRを開いてください',
      '2. Revertボタンを押して Revert PR を作成してください',
      '3. RevertのPRをマージしてください',
    );
  }

  if (params.deployUrl) {
    steps.push(`4. ${params.deployUrl} でデプロイを確認してください`);
  } else {
    steps.push('4. デプロイ状況を確認してください');
  }

  if (params.failureReason) {
    steps.unshift(`問題: ${params.failureReason}`);
  }

  return {
    prUrl: params.prUrl,
    prNumber: params.prNumber,
    repoUrl: params.repoUrl,
    steps,
    warningNote: '※ 自動でRevert/Rollbackはしません。必ずPRを確認してから操作してください。',
  };
}
