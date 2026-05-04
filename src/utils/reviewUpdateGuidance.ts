import type { CiFreshness } from '../services/ciWatchService';
import type { PrFreshness } from '../services/prWatchService';
import type { ReviewFreshness } from '../services/reviewWatchService';

export type UpdateTarget = 'review' | 'pr' | 'ci';

export type UpdateGuidanceItem = {
  target: UpdateTarget;
  label: string;
  shouldUpdate: boolean;
  reason: string;
};

export type UpdateGuidance = {
  title: string;
  message: string;
  items: UpdateGuidanceItem[];
};

function toItem(target: UpdateTarget, label: string, freshness?: ReviewFreshness | PrFreshness | CiFreshness | null): UpdateGuidanceItem {
  if (!freshness) {
    return {
      target,
      label,
      shouldUpdate: true,
      reason: 'まだ読み込み中、または更新時刻が分かりません。',
    };
  }

  return {
    target,
    label,
    shouldUpdate: freshness.shouldUpdate,
    reason: freshness.shouldUpdate ? freshness.message : freshness.message,
  };
}

export function buildReviewUpdateGuidance(args: {
  reviewFreshness?: ReviewFreshness | null;
  prFreshness?: PrFreshness | null;
  ciFreshness?: CiFreshness | null;
}): UpdateGuidance {
  const items = [
    toItem('review', 'Review Watch', args.reviewFreshness),
    toItem('pr', 'PR Watch', args.prFreshness),
    toItem('ci', 'CI Watch', args.ciFreshness),
  ];

  const updateCount = items.filter((item) => item.shouldUpdate).length;

  if (updateCount === 0) {
    return {
      title: '全部だらけてOK',
      message: '今は更新しなくても大丈夫です。必要な時だけ見れば十分です。',
      items,
    };
  }

  if (updateCount === 1) {
    const target = items.find((item) => item.shouldUpdate);
    return {
      title: `${target?.label ?? '一部'}だけ更新すると安心`,
      message: '全部押さなくて大丈夫です。古いところだけ軽く更新します。',
      items,
    };
  }

  return {
    title: `${updateCount}つだけ更新すると安心`,
    message: '全部を見張らず、古いところだけ順番に更新します。',
    items,
  };
}
