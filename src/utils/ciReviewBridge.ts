import type { WatchItem, WatchStatus } from '../data/reviewWatch';
import type { CiWatchItem } from '../services/ciWatchService';

export type CiReviewBridgeSummary = {
  title: string;
  message: string;
  status: WatchStatus;
  count: number;
  convertedItems: WatchItem[];
};

function toBridgeStatus(items: CiWatchItem[]): WatchStatus {
  if (items.some((item) => item.status === 'blocked')) {
    return 'blocked';
  }

  if (items.some((item) => item.status === 'manual')) {
    return 'manual';
  }

  if (items.some((item) => item.status === 'checking')) {
    return 'checking';
  }

  return 'ok';
}

function toBridgeRisk(item: CiWatchItem): WatchItem['risk'] {
  if (item.risk) {
    return item.risk;
  }

  if (item.status === 'blocked') {
    return 'high';
  }

  if (item.status === 'manual' || item.status === 'checking') {
    return 'medium';
  }

  return 'low';
}

export function convertCiToReviewWatchItem(item: CiWatchItem): WatchItem {
  return {
    id: `from-${item.id}`,
    label: item.label,
    status: item.status,
    message: item.message,
    url: item.url,
    risk: toBridgeRisk(item),
    links: item.links,
    actions: item.actions,
  };
}

export function buildCiReviewBridgeSummary(items: CiWatchItem[]): CiReviewBridgeSummary {
  const convertedItems = items.map(convertCiToReviewWatchItem);
  const status = toBridgeStatus(items);

  if (items.length === 0) {
    return {
      title: 'CI由来の確認はありません',
      message: 'CI WatchからReview Watchへ渡す項目はまだありません。',
      status: 'ok',
      count: 0,
      convertedItems,
    };
  }

  if (status === 'blocked') {
    return {
      title: 'CI由来の停止確認があります',
      message: 'CI Watch側のblockedをReview Watch側でも見えるようにする準備ができています。',
      status,
      count: items.length,
      convertedItems,
    };
  }

  if (status === 'manual') {
    return {
      title: 'CI由来の手動確認があります',
      message: 'CI Watch側のmanualをReview Watch側へ橋渡しできます。',
      status,
      count: items.length,
      convertedItems,
    };
  }

  if (status === 'checking') {
    return {
      title: 'CI由来の確認中項目があります',
      message: 'CI Watch側の実行中workflowをReview Watch側へ渡す準備ができています。',
      status,
      count: items.length,
      convertedItems,
    };
  }

  return {
    title: 'CI由来の項目は落ち着いています',
    message: 'CI Watch側の状態はReview Watchへ渡しても低リスクです。',
    status,
    count: items.length,
    convertedItems,
  };
}
