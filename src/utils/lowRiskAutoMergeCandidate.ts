// Low-risk auto-merge candidate decision
// Does NOT perform auto-merge. Only decides if a PR is a merge candidate.

export type LowRiskAutoMergeDecision =
  | 'not-candidate'
  | 'candidate'
  | 'manual-gate'
  | 'blocked';

export type LowRiskAutoMergeSummary = {
  decision: LowRiskAutoMergeDecision;
  reasons: string[];
  risks: string[];
  prUrl?: string;
};

export type LowRiskAutoMergeInput = {
  prUrl?: string;
  ciPassed: boolean;
  buildPassed: boolean;
  typecheckPassed: boolean;
  hasDangerousFiles: boolean;
  hasSecretChanges: boolean;
  hasAuthBillingAppStore: boolean;
  diffSize: 'small' | 'medium' | 'large' | 'unknown';
  changeTypes: string[];
  changedFiles?: string[];
};

const SAFE_CHANGE_TYPES = new Set([
  'ui',
  'css',
  'readme',
  'test',
  'docs',
  'comment',
  'style',
  'format',
]);

const MANUAL_GATE_FILES = [
  'package-lock.json',
  'wrangler.toml',
  '.github/',
  'worker/',
  'db',
  'schema',
  'migrations',
  'permissions',
  'auth',
];

const BLOCKED_PATTERNS = [
  'token',
  'secret',
  'localstorage',
  'auto-approve',
  'auto-merge',
  'billing',
  'app-store',
  'workflow_dispatch',
];

export function decideLowRiskAutoMerge(
  input: LowRiskAutoMergeInput,
): LowRiskAutoMergeSummary {
  const reasons: string[] = [];
  const risks: string[] = [];

  // Check hard blocks first
  if (input.hasSecretChanges) {
    return {
      decision: 'blocked',
      reasons: [],
      risks: ['tokenまたはsecretの変更が含まれています'],
      prUrl: input.prUrl,
    };
  }

  if (input.hasAuthBillingAppStore) {
    return {
      decision: 'blocked',
      reasons: [],
      risks: ['認証・課金・App Store関連の変更が含まれています'],
      prUrl: input.prUrl,
    };
  }

  if (input.hasDangerousFiles) {
    return {
      decision: 'blocked',
      reasons: [],
      risks: ['危険なファイルの変更が含まれています'],
      prUrl: input.prUrl,
    };
  }

  const changedFiles = input.changedFiles ?? [];
  const hasManualGateFile = changedFiles.some((f) =>
    MANUAL_GATE_FILES.some((pat) => f.includes(pat)),
  );

  const hasBlockedPattern = changedFiles.some((f) =>
    BLOCKED_PATTERNS.some((pat) => f.toLowerCase().includes(pat)),
  );

  if (hasBlockedPattern) {
    return {
      decision: 'blocked',
      reasons: [],
      risks: ['ブロック対象のファイルパターンが含まれています'],
      prUrl: input.prUrl,
    };
  }

  if (hasManualGateFile) {
    risks.push('設定ファイル・権限まわりの変更があります');
    return {
      decision: 'manual-gate',
      reasons,
      risks,
      prUrl: input.prUrl,
    };
  }

  // Check candidate conditions
  if (!input.ciPassed) {
    risks.push('CIがまだ通っていません');
  } else {
    reasons.push('CI成功');
  }

  if (!input.buildPassed) {
    risks.push('Buildがまだ通っていません');
  } else {
    reasons.push('Build成功');
  }

  if (!input.typecheckPassed) {
    risks.push('Typecheckがまだ通っていません');
  } else {
    reasons.push('Typecheck成功');
  }

  if (input.diffSize === 'large') {
    risks.push('差分が大きいため自動マージには向いていません');
  } else if (input.diffSize === 'small' || input.diffSize === 'medium') {
    reasons.push('差分が適切なサイズです');
  }

  const allSafeTypes =
    input.changeTypes.length > 0 &&
    input.changeTypes.every((t) => SAFE_CHANGE_TYPES.has(t.toLowerCase()));

  if (allSafeTypes) {
    reasons.push('変更内容がUI / CSS / README / テスト程度です');
  } else if (input.changeTypes.length > 0) {
    risks.push('変更種別にロジック変更が含まれている可能性があります');
  }

  const isCandidate =
    input.ciPassed &&
    input.buildPassed &&
    input.typecheckPassed &&
    !input.hasDangerousFiles &&
    !input.hasSecretChanges &&
    !input.hasAuthBillingAppStore &&
    input.diffSize !== 'large' &&
    risks.length === 0;

  return {
    decision: isCandidate ? 'candidate' : 'not-candidate',
    reasons,
    risks,
    prUrl: input.prUrl,
  };
}

export function formatLowRiskAutoMergeSummary(
  summary: LowRiskAutoMergeSummary,
): string {
  const lines = [
    `# 低リスク自動マージ候補判定`,
    ``,
    `判定: ${summary.decision}`,
    ``,
  ];

  if (summary.reasons.length > 0) {
    lines.push(`## 通過条件`);
    summary.reasons.forEach((r) => lines.push(`- ✅ ${r}`));
    lines.push(``);
  }

  if (summary.risks.length > 0) {
    lines.push(`## リスク・注意点`);
    summary.risks.forEach((r) => lines.push(`- ⚠️ ${r}`));
    lines.push(``);
  }

  if (summary.prUrl) {
    lines.push(`PR: ${summary.prUrl}`);
  }

  lines.push(``, `※ 自動マージはしません。必ずPRを確認してください。`);

  return lines.join('\n');
}
