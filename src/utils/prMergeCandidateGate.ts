const STORAGE_KEY = 'darake.prMergeCandidateGate.v1';

export type PrMergeCandidateGateCheck = {
  ciPassed: boolean;
  typecheckPassed: boolean;
  buildPassed: boolean;
  snapshotPassed: boolean;
  codeRabbitNoBlock: boolean;
  fileChangesNotDangerous: boolean;
  noSecretInChanges: boolean;
  noDbAuthBillingDeployChanges: boolean;
  userApprovedLowRisk: boolean;
};

export type PrMergeCandidateGateResult = {
  checks: PrMergeCandidateGateCheck;
  verdict: 'safe-to-merge' | 'review-needed' | 'blocked';
  failedChecks: string[];
  manualGateRequired: boolean;
  summary: string;
};

const CHECK_LABELS: Record<keyof PrMergeCandidateGateCheck, string> = {
  ciPassed: 'CI成功',
  typecheckPassed: 'Typecheck成功',
  buildPassed: 'Build成功',
  snapshotPassed: 'Snapshot成功',
  codeRabbitNoBlock: 'CodeRabbit blockなし',
  fileChangesNotDangerous: 'ファイル変更が危険領域でない',
  noSecretInChanges: 'secretなし',
  noDbAuthBillingDeployChanges: 'DB/auth/billing/deploy変更なし',
  userApprovedLowRisk: '低リスクmerge候補OK（ユーザー確認）',
};

export function buildInitialPrMergeCandidateGateCheck(): PrMergeCandidateGateCheck {
  return {
    ciPassed: false,
    typecheckPassed: false,
    buildPassed: false,
    snapshotPassed: false,
    codeRabbitNoBlock: false,
    fileChangesNotDangerous: false,
    noSecretInChanges: false,
    noDbAuthBillingDeployChanges: false,
    userApprovedLowRisk: false,
  };
}

export function evaluatePrMergeCandidateGate(checks: PrMergeCandidateGateCheck): PrMergeCandidateGateResult {
  const failedChecks: string[] = [];
  (Object.entries(checks) as [keyof PrMergeCandidateGateCheck, boolean][]).forEach(([key, passed]) => {
    if (!passed) failedChecks.push(CHECK_LABELS[key]);
  });

  const allPassed = failedChecks.length === 0;
  const criticalFailed =
    !checks.noSecretInChanges || !checks.noDbAuthBillingDeployChanges || !checks.codeRabbitNoBlock;

  const verdict = criticalFailed
    ? 'blocked'
    : allPassed
      ? 'safe-to-merge'
      : 'review-needed';

  const summary = allPassed
    ? '✅ 全チェック通過。手動mergeを検討できます。'
    : criticalFailed
      ? '🔴 重要なチェックが失敗しています。mergeを保留してください。'
      : `🟡 ${failedChecks.length}件のチェックが未完了です。確認してください。`;

  return {
    checks,
    verdict,
    failedChecks,
    manualGateRequired: true,
    summary,
  };
}

export function loadPrMergeCandidateGateCheck(): PrMergeCandidateGateCheck {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialPrMergeCandidateGateCheck();
    return JSON.parse(raw) as PrMergeCandidateGateCheck;
  } catch {
    return buildInitialPrMergeCandidateGateCheck();
  }
}

export function savePrMergeCandidateGateCheck(checks: PrMergeCandidateGateCheck): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  } catch {
    // ignore
  }
}

export function formatPrMergeCandidateGateMarkdown(result: PrMergeCandidateGateResult): string {
  return [
    '# PR Merge候補ゲート',
    `- 判定: ${result.verdict}`,
    `- 手動ゲート必要: ${result.manualGateRequired ? 'はい' : 'いいえ'}`,
    '',
    '## チェック結果',
    ...(Object.entries(result.checks) as [keyof PrMergeCandidateGateCheck, boolean][]).map(
      ([key, ok]) => `- ${ok ? '✅' : '❌'} ${CHECK_LABELS[key]}`,
    ),
    '',
    '## サマリー',
    result.summary,
    '',
    '## 未通過チェック',
    result.failedChecks.length > 0
      ? result.failedChecks.map((f) => `- ${f}`).join('\n')
      : '- なし（全通過）',
    '',
    '## 安全方針',
    '- 自動mergeは実行しません',
    '- mergeは GitHub で手動実行してください',
  ].join('\n');
}

export { CHECK_LABELS };
