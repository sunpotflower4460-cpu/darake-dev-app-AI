import type { WatchItem } from '../data/reviewWatch';

export type ReviewAlert = {
  show: boolean;
  title: string;
  message: string;
  count: number;
};

export function buildReviewAlert(items: WatchItem[]): ReviewAlert {
  const importantItems = items.filter((item) => item.status === 'manual' || item.status === 'blocked');
  const blockedCount = importantItems.filter((item) => item.status === 'blocked').length;

  if (importantItems.length === 0) {
    return {
      show: false,
      title: '今見るものはありません',
      message: '大事な確認はなさそうです。',
      count: 0,
    };
  }

  if (blockedCount > 0) {
    return {
      show: true,
      title: '止まっている確認があります',
      message: 'blocked があるので、ここだけ見ると安心です。',
      count: importantItems.length,
    };
  }

  return {
    show: true,
    title: '人間判断が必要です',
    message: 'manual があるので、ここだけ軽く見ます。',
    count: importantItems.length,
  };
}
