export type GitHubWriteRisk = 'low' | 'medium' | 'high' | 'blocked-for-now';

export type GitHubWriteOperation =
  | 'issue-create'
  | 'issue-comment-draft'
  | 'issue-label-add'
  | 'issue-body-update'
  | 'pr-body-update'
  | 'pr-create'
  | 'branch-create'
  | 'workflow-manual-assist'
  | 'merge'
  | 'strong-automation'
  | 'repository-settings-change';

const RISK_BY_OPERATION: Record<GitHubWriteOperation, GitHubWriteRisk> = {
  'issue-create': 'low',
  'issue-comment-draft': 'low',
  'issue-label-add': 'medium',
  'issue-body-update': 'medium',
  'pr-body-update': 'medium',
  'pr-create': 'high',
  'branch-create': 'high',
  'workflow-manual-assist': 'high',
  merge: 'blocked-for-now',
  'strong-automation': 'blocked-for-now',
  'repository-settings-change': 'blocked-for-now',
};

const REQUIRE_PREVIEW_BY_OPERATION: Record<GitHubWriteOperation, boolean> = {
  'issue-create': true,
  'issue-comment-draft': true,
  'issue-label-add': true,
  'issue-body-update': true,
  'pr-body-update': true,
  'pr-create': true,
  'branch-create': true,
  'workflow-manual-assist': true,
  merge: true,
  'strong-automation': true,
  'repository-settings-change': true,
};

const REQUIRE_CONFIRM_BY_OPERATION: Record<GitHubWriteOperation, boolean> = {
  'issue-create': true,
  'issue-comment-draft': false,
  'issue-label-add': true,
  'issue-body-update': true,
  'pr-body-update': true,
  'pr-create': true,
  'branch-create': true,
  'workflow-manual-assist': true,
  merge: true,
  'strong-automation': true,
  'repository-settings-change': true,
};

export type GitHubWriteGatePolicy = {
  operation: GitHubWriteOperation;
  risk: GitHubWriteRisk;
  requiresPreview: boolean;
  requiresExplicitConfirmation: boolean;
  blockedForNow: boolean;
};

export function getGitHubWriteGatePolicy(operation: GitHubWriteOperation): GitHubWriteGatePolicy {
  const risk = RISK_BY_OPERATION[operation];
  return {
    operation,
    risk,
    requiresPreview: REQUIRE_PREVIEW_BY_OPERATION[operation],
    requiresExplicitConfirmation: REQUIRE_CONFIRM_BY_OPERATION[operation],
    blockedForNow: risk === 'blocked-for-now',
  };
}

const RISK_LABELS: Record<GitHubWriteRisk, string> = {
  low: 'low（低リスク）',
  medium: 'medium（中リスク）',
  high: 'high（高リスク）',
  'blocked-for-now': 'blocked（このPhaseでは実行しない）',
};

export function formatGitHubWriteRiskLabel(risk: GitHubWriteRisk): string {
  return RISK_LABELS[risk];
}
