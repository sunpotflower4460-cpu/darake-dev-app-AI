import type { DarakeFinalFormStatus } from './darakeFinalFormState';

export type VisibilityDecision = 'show' | 'hide' | 'always-show';

export type FinalFormVisibilityPolicy = {
  alwaysShow: string[];
  normalShow: string[];
  alwaysHide: string[];
  neverHide: string[];
};

export function getFinalFormVisibilityPolicy(): FinalFormVisibilityPolicy {
  return {
    alwaysShow: [
      'blocked',
      'human-needed',
      'primary-need',
      'safety-note',
    ],
    normalShow: [
      'review-later',
      'counters',
      'visible-cards',
      'quiet',
    ],
    alwaysHide: [
      'raw-logs',
      'verbose-ci-output',
      'auto-progress-details',
    ],
    neverHide: [
      'blocked',
      'urgent-human',
      'phase-status',
    ],
  };
}

const ALWAYS_SHOW_TYPES = new Set(['blocked', 'urgent-human', 'phase-status', 'safety-note']);
const HIDE_WHEN_OK = new Set(['raw-logs', 'verbose-ci-output', 'auto-progress-details']);

export function shouldShowInFinalForm(
  itemType: string,
  status: DarakeFinalFormStatus,
): VisibilityDecision {
  if (ALWAYS_SHOW_TYPES.has(itemType)) {
    return 'always-show';
  }

  if (HIDE_WHEN_OK.has(itemType)) {
    return 'hide';
  }

  // When sleeping or quiet, hide most things
  if (status === 'sleep' || status === 'quiet') {
    if (itemType === 'review-later' || itemType === 'counters') {
      return 'show';
    }
    return 'hide';
  }

  // When review-later, show relevant items
  if (status === 'review-later') {
    if (itemType === 'review-later' || itemType === 'counters' || itemType === 'visible-cards') {
      return 'show';
    }
    return 'hide';
  }

  // human-needed or blocked: show everything important
  return 'show';
}
