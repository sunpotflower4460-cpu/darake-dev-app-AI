export type NotificationSeverity =
  | 'info'
  | 'success'
  | 'warning'
  | 'manual-gate'
  | 'blocked';

export type NotificationEventType =
  | 'completion-near'
  | 'manual-gate'
  | 'ci-failed'
  | 'build-failed'
  | 'screenshot-failed'
  | 'ui-check-failed'
  | 'secret-required'
  | 'production-risk'
  | 'app-store-submit-ready'
  | 'review-blocked';

export type NotificationEvent = {
  id: string;
  type: NotificationEventType;
  severity: NotificationSeverity;
  appName: string;
  phaseLabel: string;
  title: string;
  summary: string;
  reason: string;
  actionRequired: string;
  urls: Array<{
    label: string;
    value: string;
  }>;
  shouldNotifyNow: boolean;
  canBatchUntilCompletionReport: boolean;
  createdAt: string;
};

const IMMEDIATE_TYPES: NotificationEventType[] = [
  'manual-gate',
  'ci-failed',
  'build-failed',
  'screenshot-failed',
  'ui-check-failed',
  'secret-required',
  'production-risk',
  'app-store-submit-ready',
  'review-blocked',
];

const IMMEDIATE_SEVERITIES: NotificationSeverity[] = ['blocked', 'manual-gate'];

export function shouldNotifyImmediately(event: Pick<NotificationEvent, 'type' | 'severity'>): boolean {
  return IMMEDIATE_TYPES.includes(event.type) || IMMEDIATE_SEVERITIES.includes(event.severity);
}

export function buildNotificationEvent(
  params: Omit<NotificationEvent, 'shouldNotifyNow' | 'canBatchUntilCompletionReport' | 'createdAt'>,
): NotificationEvent {
  const immediate = shouldNotifyImmediately({ type: params.type, severity: params.severity });
  return {
    ...params,
    shouldNotifyNow: immediate,
    canBatchUntilCompletionReport: !immediate,
    createdAt: new Date().toISOString(),
  };
}

export function summarizeNotificationEvent(event: NotificationEvent): string {
  return `[${event.severity.toUpperCase()}] ${event.title}: ${event.summary}`;
}

export function formatNotificationEventMarkdown(event: NotificationEvent): string {
  const lines: string[] = [
    `## ${event.title}`,
    '',
    `- **Phase**: ${event.phaseLabel}`,
    `- **App**: ${event.appName}`,
    `- **Severity**: ${event.severity}`,
    `- **Type**: ${event.type}`,
    '',
    `**Summary**: ${event.summary}`,
    '',
    `**Reason**: ${event.reason}`,
    '',
    `**Action Required**: ${event.actionRequired}`,
  ];

  if (event.urls.length > 0) {
    lines.push('', '**Links**:');
    event.urls.forEach((u) => lines.push(`- [${u.label}](${u.value})`));
  }

  lines.push(
    '',
    `- shouldNotifyNow: ${event.shouldNotifyNow}`,
    `- canBatch: ${event.canBatchUntilCompletionReport}`,
    `- createdAt: ${event.createdAt}`,
  );

  return lines.join('\n');
}
