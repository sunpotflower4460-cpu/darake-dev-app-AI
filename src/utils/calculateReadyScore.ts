export type ReadyScore = {
  score: number;
  label: 'not-ready' | 'almost-ready' | 'ready' | 'fully-operational';
};

/**
 * Calculates a readiness score (0-100) and label based on the number of
 * ready, missing, and blocked items in a settings health summary.
 */
export function calculateReadyScore(
  readyCount: number,
  missingCount: number,
  blockedCount: number,
): ReadyScore {
  const total = readyCount + missingCount + blockedCount;
  if (total === 0) {
    return { score: 0, label: 'not-ready' };
  }

  // Blocked items count double against readiness
  const penalty = blockedCount * 2 + missingCount;
  const raw = Math.max(0, total - penalty);
  const score = Math.round((raw / total) * 100);

  let label: ReadyScore['label'];
  if (score === 100) {
    label = 'fully-operational';
  } else if (score >= 85) {
    label = 'ready';
  } else if (score >= 60) {
    label = 'almost-ready';
  } else {
    label = 'not-ready';
  }

  return { score, label };
}

export const READY_SCORE_LABELS: Record<ReadyScore['label'], string> = {
  'not-ready': 'まだ準備中',
  'almost-ready': 'かなり準備できています',
  'ready': 'ほぼ実運用できます',
  'fully-operational': 'だらけ管制室 稼働可能',
};
