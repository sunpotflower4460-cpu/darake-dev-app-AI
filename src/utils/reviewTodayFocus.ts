import type { WatchItem } from '../data/reviewWatch';

export type ReviewTodayFocus = {
  title: string;
  message: string;
  focusItems: WatchItem[];
  hiddenCount: number;
};

function isFocusItem(item: WatchItem): boolean {
  return item.status === 'blocked' || item.status === 'manual';
}

export function buildReviewTodayFocus(items: WatchItem[]): ReviewTodayFocus {
  const focusItems = items.filter(isFocusItem);
  const hiddenCount = items.length - focusItems.length;

  if (focusItems.length === 0) {
    return {
      title: '今日は見るところなし',
      message: 'manual / blocked はありません。細かい一覧は閉じていて大丈夫です。',
      focusItems,
      hiddenCount,
    };
  }

  if (focusItems.some((item) => item.status === 'blocked')) {
    return {
      title: '今日は止まっている所だけ見る',
      message: 'blocked があるので、まずここだけ確認します。ほかは後で大丈夫です。',
      focusItems,
      hiddenCount,
    };
  }

  return {
    title: '今日は手動確認だけ見る',
    message: 'manual の項目だけ軽く確認します。checking / ok は追いかけなくて大丈夫です。',
    focusItems,
    hiddenCount,
  };
}
