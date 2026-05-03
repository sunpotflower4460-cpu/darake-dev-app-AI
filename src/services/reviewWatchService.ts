import { reviewWatchItems, type WatchItem, type WatchStatus } from '../data/reviewWatch';

export type ReviewFreshnessLevel = 'fresh' | 'aging' | 'stale' | 'unknown';

export type ReviewFreshness = {
  level: ReviewFreshnessLevel;
  label: string;
  message: string;
  minutesOld?: number;
  shouldUpdate: boolean;
};

export type ReviewWatchState = {
  source: string;
  generatedAt?: string;
  freshness: ReviewFreshness;
  items: WatchItem[];
};

type ReviewWatchJson = {
  source?: string;
  generatedAt?: string;
  items?: Array<{
    id: string;
    label: string;
    status: WatchStatus;
    message: string;
    url?: string;
  }>;
};

function isWatchStatus(value: string): value is WatchStatus {
  return value === 'ok' || value === 'checking' || value === 'manual' || value === 'blocked';
}

function getReviewFreshness(generatedAt?: string): ReviewFreshness {
  if (!generatedAt) {
    return {
      level: 'unknown',
      label: '更新時刻不明',
      message: '更新時刻が分からないので、必要なら手動更新します。',
      shouldUpdate: true,
    };
  }

  const parsed = Date.parse(generatedAt);

  if (Number.isNaN(parsed)) {
    return {
      level: 'unknown',
      label: '更新時刻不明',
      message: '更新時刻を読めませんでした。',
      shouldUpdate: true,
    };
  }

  const minutesOld = Math.max(0, Math.round((Date.now() - parsed) / 60000));

  if (minutesOld <= 60) {
    return {
      level: 'fresh',
      label: '新しい',
      message: '今はだらけてOK。PR監視状態は新しめです。',
      minutesOld,
      shouldUpdate: false,
    };
  }

  if (minutesOld <= 360) {
    return {
      level: 'aging',
      label: '少し前',
      message: '急ぎでなければまだ大丈夫です。',
      minutesOld,
      shouldUpdate: false,
    };
  }

  return {
    level: 'stale',
    label: '古いかも',
    message: '確認するなら、Review Watchの手動更新をおすすめします。',
    minutesOld,
    shouldUpdate: true,
  };
}

function normalizeItems(data?: ReviewWatchJson['items']): WatchItem[] {
  if (!data) {
    return reviewWatchItems;
  }

  return data.map((item) => ({
    id: item.id,
    label: item.label,
    status: isWatchStatus(item.status) ? item.status : 'manual',
    message: item.message,
    url: item.url,
  }));
}

export async function loadReviewWatchState(): Promise<ReviewWatchState> {
  try {
    const response = await fetch('/review-watch.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('review watch file is not available');
    }

    const data = (await response.json()) as ReviewWatchJson;

    return {
      source: data.source ?? 'json',
      generatedAt: data.generatedAt,
      freshness: getReviewFreshness(data.generatedAt),
      items: normalizeItems(data.items),
    };
  } catch {
    return {
      source: 'fallback',
      freshness: getReviewFreshness(undefined),
      items: reviewWatchItems,
    };
  }
}
