export type DarakeNotificationLevel =
  | 'silent'
  | 'summary'
  | 'needs-action'
  | 'blocked';

export type DarakeNotificationEvent =
  // Should notify
  | 'issue-create-failed'
  | 'worker-token-missing'
  | 'repo-not-allowed'
  | 'cloud-agent-stalled'
  | 'ci-failed'
  | 'build-failed'
  | 'pr-review-needed'
  | 'secret-operation-needed'
  | 'billing-operation-needed'
  | 'production-deploy-needed'
  | 'app-store-submit-needed'
  // Should NOT notify
  | 'issue-create-success'
  | 'readme-updated'
  | 'minor-ui-fix'
  | 'intermediate-step-success'
  | 'report-generated'
  | 'internal-state-updated';

const NOTIFICATION_LEVELS: Record<DarakeNotificationEvent, DarakeNotificationLevel> = {
  // Blocked — must stop
  'worker-token-missing': 'blocked',
  'repo-not-allowed': 'blocked',
  'secret-operation-needed': 'blocked',
  'billing-operation-needed': 'blocked',
  'production-deploy-needed': 'blocked',
  'app-store-submit-needed': 'blocked',

  // Needs action — something requires attention
  'issue-create-failed': 'needs-action',
  'cloud-agent-stalled': 'needs-action',
  'ci-failed': 'needs-action',
  'build-failed': 'needs-action',
  'pr-review-needed': 'needs-action',

  // Silent — don't bother the user
  'issue-create-success': 'silent',
  'readme-updated': 'silent',
  'minor-ui-fix': 'silent',
  'intermediate-step-success': 'silent',
  'report-generated': 'silent',
  'internal-state-updated': 'silent',
};

export function getNotificationLevel(
  event: DarakeNotificationEvent,
): DarakeNotificationLevel {
  return NOTIFICATION_LEVELS[event] ?? 'silent';
}

export function shouldNotify(event: DarakeNotificationEvent): boolean {
  const level = getNotificationLevel(event);
  return level === 'needs-action' || level === 'blocked';
}

export function isBlocked(event: DarakeNotificationEvent): boolean {
  return getNotificationLevel(event) === 'blocked';
}
