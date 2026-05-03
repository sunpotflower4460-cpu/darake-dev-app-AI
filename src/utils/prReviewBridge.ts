import type { WatchItem, WatchStatus } from '../data/reviewWatch';
import type { PrWatchItem } from '../services/prWatchService';

export type PrReviewBridgeSummary = {
  title: string;
  message: string;
  status: WatchStatus;
  count: number;
  convertedItems: WatchItem[];
};

function toBridgeStatus(items: PrWatchItem[]): WatchStatus {
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

function toBridgeRisk(item: PrWatchItem): WatchItem['risk'] {
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

export function convertPrToReviewWatchItem(item: PrWatchItem): WatchItem {
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

export function buildPrReviewBridgeSummary(items: PrWatchItem[]): PrReviewBridgeSummary {
  const convertedItems = items.map(convertPrToReviewWatchItem);
  const status = toBridgeStatus(items);

  if (items.length === 0) {
    return {
      title: 'PR由来の確認はありません',
      message: 'PR WatchからReview Watchへ渡す項目はまだありません。',
      status: 'ok',
      count: 0,
      convertedItems,
    };
  }

  if (status === 'blocked') {
    return {
      title: 'PR由来の停止確認があります',
      message: 'PR Watch側のblockedをReview Watch側でも見えるようにする準備ができています。',
      status,
      count: items.length,
      convertedItems,
    };
  }

  if (status === 'manual') {
    return {
      title: 'PR由来の手動確認があります',
      message: 'PR Watch側のmanualをReview Watch側へ橋渡しできます。',
      status,
      count: items.length,
      convertedItems,
    };
  }

  if (status === 'checking') {
    return {
      title: 'PR由来の確認中項目があります',
      message: 'PR Watch側の進行中PRをReview Watch側へ渡す準備ができています。',
      status,
      count: items.length,
      convertedItems,
    };
  }

  return {
    title: 'PR由来の項目は落ち着いています',
    message: 'PR Watch側の状態はReview Watchへ渡しても低リスクです。',
    status,
    count: items.length,
    convertedItems,
  };
}
