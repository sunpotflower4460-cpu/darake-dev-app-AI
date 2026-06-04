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
    requiresPreview: true,
    requiresExplicitConfirmation: true,
    blockedForNow: risk === 'blocked-for-now',
  };
}
