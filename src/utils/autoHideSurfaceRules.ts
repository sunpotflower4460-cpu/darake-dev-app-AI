// Phase 36.3: Auto Hide / Auto Surface Rules

import type { DarakePreferenceProfile } from './darakePreferenceMemory';

export type AutoVisibilityDecision = {
  targetId: string;
  targetType: string;
  decision:
    | 'show-now'
    | 'show-in-summary'
    | 'hide-until-needed'
    | 'send-to-review-inbox'
    | 'batch-warning'
    | 'blocked-show-now';
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  safetyNotes: string[];
};

// These types are always shown regardless of preference
const ALWAYS_VISIBLE_TYPES = new Set([
  'manual-gate',
  'app-store',
]);

const ALWAYS_VISIBLE_TAGS = new Set([
  'blocked',
  'urgent',
  'secret',
  'production',
  'billing',
  'auth',
  'db',
  'submit',
]);

export function computeAutoVisibilityDecision(
  targetId: string,
  targetType: string,
  tags: string[],
  profile: DarakePreferenceProfile | null,
  isBlocked: boolean,
  isUrgent: boolean
): AutoVisibilityDecision {
  const safetyNotes: string[] = [];

  // Safety: blocked is always visible
  if (isBlocked) {
    return {
      targetId,
      targetType,
      decision: 'blocked-show-now',
      reason: 'blockedは常に表示します',
      confidence: 'high',
      safetyNotes: ['blocked状態のため非表示にしません'],
    };
  }

  // Safety: urgent manual gate is always visible
  if (isUrgent && ALWAYS_VISIBLE_TYPES.has(targetType)) {
    return {
      targetId,
      targetType,
      decision: 'show-now',
      reason: 'urgent manual-gateは常に表示します',
      confidence: 'high',
      safetyNotes: ['urgentのため非表示にしません'],
    };
  }

  // Safety: always-visible tags
  const hasSafetyTag = tags.some((t) => ALWAYS_VISIBLE_TAGS.has(t));
  if (hasSafetyTag) {
    safetyNotes.push('安全タグが含まれるため非表示にしません');
    return {
      targetId,
      targetType,
      decision: 'show-now',
      reason: `安全関連タグ(${tags.filter((t) => ALWAYS_VISIBLE_TAGS.has(t)).join(', ')})のため表示`,
      confidence: 'high',
      safetyNotes,
    };
  }

  if (!profile) {
    return {
      targetId,
      targetType,
      decision: 'show-now',
      reason: 'プロファイルなし（デフォルト表示）',
      confidence: 'low',
      safetyNotes,
    };
  }

  // Often ignored → hide
  if (profile.safeToHideTypes.includes(targetType)) {
    return {
      targetId,
      targetType,
      decision: 'hide-until-needed',
      reason: `${targetType}は傾向的に見ない（学習済み）`,
      confidence: 'medium',
      safetyNotes,
    };
  }

  // Often later'd → send to review inbox
  if (profile.oftenLaterTypes.includes(targetType)) {
    return {
      targetId,
      targetType,
      decision: 'send-to-review-inbox',
      reason: `${targetType}はよくLaterされる（学習済み）`,
      confidence: 'medium',
      safetyNotes,
    };
  }

  // Warning type → batch
  if (targetType === 'warning' || tags.includes('warning')) {
    if (!isUrgent) {
      return {
        targetId,
        targetType,
        decision: 'batch-warning',
        reason: '低リスクwarningはBatchにまとめます',
        confidence: 'medium',
        safetyNotes,
      };
    }
  }

  // Should surface → show now
  if (profile.shouldSurfaceTypes.includes(targetType)) {
    return {
      targetId,
      targetType,
      decision: 'show-now',
      reason: `${targetType}はよく使うため前に表示`,
      confidence: 'high',
      safetyNotes,
    };
  }

  // Report-only → show in summary
  if (targetType === 'report' || tags.includes('report-only')) {
    return {
      targetId,
      targetType,
      decision: 'show-in-summary',
      reason: 'reportはサマリーのみ表示',
      confidence: 'medium',
      safetyNotes,
    };
  }

  return {
    targetId,
    targetType,
    decision: 'show-now',
    reason: 'デフォルト表示',
    confidence: 'low',
    safetyNotes,
  };
}

export function applyAutoVisibilityRules(
  items: Array<{ id: string; targetType: string; tags: string[]; isBlocked?: boolean; isUrgent?: boolean }>,
  profile: DarakePreferenceProfile | null
): AutoVisibilityDecision[] {
  return items.map((item) =>
    computeAutoVisibilityDecision(
      item.id,
      item.targetType,
      item.tags,
      profile,
      item.isBlocked ?? false,
      item.isUrgent ?? false
    )
  );
}

export function summarizeAutoVisibilityDecisions(decisions: AutoVisibilityDecision[]): string {
  const showNow = decisions.filter((d) => d.decision === 'show-now' || d.decision === 'blocked-show-now').length;
  const hidden = decisions.filter((d) => d.decision === 'hide-until-needed').length;
  const inInbox = decisions.filter((d) => d.decision === 'send-to-review-inbox').length;
  const batched = decisions.filter((d) => d.decision === 'batch-warning').length;
  const inSummary = decisions.filter((d) => d.decision === 'show-in-summary').length;
  return [
    `表示: ${showNow}件`,
    `非表示（必要時のみ）: ${hidden}件`,
    `Review Inbox送り: ${inInbox}件`,
    `Warningまとめ: ${batched}件`,
    `サマリーのみ: ${inSummary}件`,
  ].join(' / ');
}
