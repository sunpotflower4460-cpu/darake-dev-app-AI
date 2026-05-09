export type MinimalCardKind =
  | 'wake-action'
  | 'blocked'
  | 'merge-candidate'
  | 'omakase-start'
  | 'nothing-to-do'
  | 'setup-needed'
  | 'details';

export type CardVisibilityDecision = {
  cards: MinimalCardKind[];
  hiddenCount: number;
};

export type CardVisibilityInput = {
  hasWakeAction: boolean;
  isBlocked: boolean;
  isMergeCandidate: boolean;
  isOmakaseReady: boolean;
  isNothingToDo: boolean;
  isSetupNeeded: boolean;
};

const MAX_VISIBLE_CARDS = 2;

/**
 * Determine which minimal cards to show. At most 2 cards.
 * Priority: wake-action > blocked > merge-candidate > omakase-start > nothing-to-do > setup-needed > details
 */
export function decideCardVisibility(
  input: CardVisibilityInput,
): CardVisibilityDecision {
  const candidates: MinimalCardKind[] = [];

  if (input.hasWakeAction) candidates.push('wake-action');
  if (input.isBlocked) candidates.push('blocked');
  if (input.isMergeCandidate) candidates.push('merge-candidate');
  if (input.isOmakaseReady) candidates.push('omakase-start');
  if (input.isNothingToDo) candidates.push('nothing-to-do');
  if (input.isSetupNeeded) candidates.push('setup-needed');

  // Always show details as last fallback
  if (candidates.length === 0) candidates.push('details');

  const visible = candidates.slice(0, MAX_VISIBLE_CARDS);
  const hiddenCount = Math.max(0, candidates.length - MAX_VISIBLE_CARDS);

  return { cards: visible, hiddenCount };
}
