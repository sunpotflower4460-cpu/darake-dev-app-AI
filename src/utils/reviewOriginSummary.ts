import type { WatchItem, WatchStatus } from '../data/reviewWatch';

export type ReviewOrigin = 'fixed' | 'pr' | 'ci';

export type ReviewOriginSummaryItem = {
  origin: ReviewOrigin;
  label: string;
  count: number;
  nowCount: number;
  status: WatchStatus;
};

export type ReviewUnifiedSummary = {
  total: number;
  nowCount: number;
  laterCount: number;
  leaveCount: number;
  status: WatchStatus;
  message: string;
  origins: ReviewOriginSummaryItem[];
};

function getOrigin(item: WatchItem): ReviewOrigin {
  if (item.id.startsWith('from-ci-')) {
    return 'ci';
  }

  if (item.id.startsWith('from-pr-')) {
    return 'pr';
  }

  return 'fixed';
}

function isNowStatus(status: WatchStatus): boolean {
  return status === 'manual' || status === 'blocked';
}

function getStatus(items: WatchItem[]): WatchStatus {
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

function getMessage(status: WatchStatus, nowCount: number): string {
  if (nowCount === 0) {
    return '今すぐ見るべきものはありません。だらけてOKです。';
  }

  if (status === 'blocked') {
    return '止まっている項目があります。ここだけ見れば十分です。';
  }

  return '手動確認が必要な項目があります。必要なところだけ軽く見ます。';
}

export function buildReviewUnifiedSummary(items: WatchItem[]): ReviewUnifiedSummary {
  const total = items.length;
  const nowCount = items.filter((item) => isNowStatus(item.status)).length;
  const laterCount = items.filter((item) => item.status === 'checking').length;
  const leaveCount = items.filter((item) => item.status === 'ok').length;
  const status = getStatus(items);

  const originConfigs: Array<{ origin: ReviewOrigin; label: string }> = [
    { origin: 'fixed', label: '固定' },
    { origin: 'pr', label: 'PR由来' },
    { origin: 'ci', label: 'CI由来' },
  ];

  const origins = originConfigs.map((config) => {
    const originItems = items.filter((item) => getOrigin(item) === config.origin);

    return {
      ...config,
      count: originItems.length,
      nowCount: originItems.filter((item) => isNowStatus(item.status)).length,
      status: getStatus(originItems),
    };
  });

  return {
    total,
    nowCount,
    laterCount,
    leaveCount,
    status,
    message: getMessage(status, nowCount),
    origins,
  };
}
