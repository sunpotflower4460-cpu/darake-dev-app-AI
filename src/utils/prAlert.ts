import type { PrWatchItem } from '../services/prWatchService';

const DEFAULT_ACTION_URL = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/pulls';

export type PrAlert = {
  show: boolean;
  title: string;
  message: string;
  count: number;
  actionLabel?: string;
  actionUrl?: string;
};

export function buildPrAlert(items: PrWatchItem[]): PrAlert {
  const importantItems = items.filter((item) => item.status === 'manual' || item.status === 'blocked');
  const blockedCount = importantItems.filter((item) => item.status === 'blocked').length;
  const firstActionUrl = importantItems.find((item) => item.url)?.url ?? DEFAULT_ACTION_URL;

  if (importantItems.length === 0) {
    return {
      show: false,
      title: '今見るPRはありません',
      message: '大事な確認はなさそうです。',
      count: 0,
    };
  }

  if (blockedCount > 0) {
    return {
      show: true,
      title: '止まっているPRがあります',
      message: 'blocked のPRがあるので、ここだけ見ると安心です。',
      count: importantItems.length,
      actionLabel: '該当PRを開く',
      actionUrl: firstActionUrl,
    };
  }

  return {
    show: true,
    title: '人間判断が必要なPRがあります',
    message: 'manual のPRがあるので、軽く確認します。',
    count: importantItems.length,
    actionLabel: '確認する',
    actionUrl: firstActionUrl,
  };
}
