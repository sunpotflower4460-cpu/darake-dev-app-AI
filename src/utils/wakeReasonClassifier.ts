export type WakeReasonType =
  | 'none'
  | 'blocked'
  | 'manual-gate'
  | 'secret-required'
  | 'production-risk'
  | 'app-store-submit'
  | 'failed-check'
  | 'human-choice'
  | 'later-review';

export type WakeReason = {
  id: string;
  type: WakeReasonType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  shortReason: string;
  humanAction: string;
  canWait: boolean;
  shouldInterrupt: boolean;
};

const WAKE_REASON_DEFAULTS: Record<WakeReasonType, Pick<WakeReason, 'priority' | 'canWait' | 'shouldInterrupt'>> = {
  none: { priority: 'low', canWait: true, shouldInterrupt: false },
  blocked: { priority: 'urgent', canWait: false, shouldInterrupt: true },
  'manual-gate': { priority: 'high', canWait: false, shouldInterrupt: true },
  'secret-required': { priority: 'urgent', canWait: false, shouldInterrupt: true },
  'production-risk': { priority: 'urgent', canWait: false, shouldInterrupt: true },
  'app-store-submit': { priority: 'high', canWait: false, shouldInterrupt: true },
  'failed-check': { priority: 'medium', canWait: true, shouldInterrupt: false },
  'human-choice': { priority: 'medium', canWait: true, shouldInterrupt: false },
  'later-review': { priority: 'low', canWait: true, shouldInterrupt: false },
};

export function classifyWakeReason(
  id: string,
  type: WakeReasonType,
  title: string,
  shortReason: string,
  humanAction: string,
): WakeReason {
  const defaults = WAKE_REASON_DEFAULTS[type];
  return {
    id,
    type,
    title,
    shortReason,
    humanAction,
    ...defaults,
  };
}

export type WakeReasonSummary = {
  hasUrgent: boolean;
  totalCount: number;
  interruptReasons: WakeReason[];
  waitableReasons: WakeReason[];
  topReason: WakeReason | null;
  summaryText: string;
};

export function buildWakeReasonSummary(reasons: WakeReason[]): WakeReasonSummary {
  const interruptReasons = reasons.filter((r) => r.shouldInterrupt);
  const waitableReasons = reasons.filter((r) => !r.shouldInterrupt);
  const hasUrgent = reasons.some((r) => r.priority === 'urgent');

  const priorityOrder: Record<WakeReason['priority'], number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sorted = [...reasons].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const topReason = sorted[0] ?? null;

  let summaryText = '起こす理由なし';
  if (hasUrgent) {
    summaryText = `緊急: ${topReason?.title ?? '確認が必要'}`;
  } else if (interruptReasons.length > 0) {
    summaryText = `要確認 ${interruptReasons.length}件`;
  } else if (waitableReasons.length > 0) {
    summaryText = `あとで見て ${waitableReasons.length}件`;
  }

  return {
    hasUrgent,
    totalCount: reasons.length,
    interruptReasons,
    waitableReasons,
    topReason,
    summaryText,
  };
}
