import type { CiWatchItem } from '../services/ciWatchService';

const DEFAULT_ACTION_URL = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions';

export type CiAlert = {
  show: boolean;
  title: string;
  message: string;
  count: number;
  actionLabel?: string;
  actionUrl?: string;
};

export function buildCiAlert(items: CiWatchItem[]): CiAlert {
  const importantItems = items.filter((item) => item.status === 'manual' || item.status === 'blocked');
  const blockedCount = importantItems.filter((item) => item.status === 'blocked').length;
  const firstActionUrl = importantItems.find((item) => item.url)?.url ?? DEFAULT_ACTION_URL;

  if (importantItems.length === 0) {
    return {
      show: false,
      title: '今見るCIはありません',
      message: '大事な確認はなさそうです。',
      count: 0,
    };
  }

  if (blockedCount > 0) {
    return {
      show: true,
      title: '止まっているCIがあります',
      message: 'blocked のCIがあるので、ここだけ見ると安心です。',
      count: importantItems.length,
      actionLabel: '該当Runを開く',
      actionUrl: firstActionUrl,
    };
  }

  return {
    show: true,
    title: '人間判断が必要なCIがあります',
    message: 'manual のCIがあるので、軽く確認します。',
    count: importantItems.length,
    actionLabel: '確認する',
    actionUrl: firstActionUrl,
  };
}
