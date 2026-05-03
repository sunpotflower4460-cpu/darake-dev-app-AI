import type { WatchItem } from '../data/reviewWatch';

const DEFAULT_ACTION_URL = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/update-review-watch.yml';

export type ReviewAlert = {
  show: boolean;
  title: string;
  message: string;
  count: number;
  actionLabel?: string;
  actionUrl?: string;
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
      message: 'blocked があるので、まずActionsを開いて状態を見ます。',
      count: importantItems.length,
      actionLabel: 'Actionsを開く',
      actionUrl: DEFAULT_ACTION_URL,
    };
  }

  return {
    show: true,
    title: '人間判断が必要です',
    message: 'manual があるので、次に見る場所を開きます。',
    count: importantItems.length,
    actionLabel: '確認場所を開く',
    actionUrl: DEFAULT_ACTION_URL,
  };
}
