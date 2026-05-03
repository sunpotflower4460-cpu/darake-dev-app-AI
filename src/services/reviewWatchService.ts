import { reviewWatchItems, type WatchItem, type WatchStatus } from '../data/reviewWatch';

export type ReviewWatchState = {
  source: string;
  generatedAt?: string;
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
  }>;
};

function isWatchStatus(value: string): value is WatchStatus {
  return value === 'ok' || value === 'checking' || value === 'manual' || value === 'blocked';
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
      items: normalizeItems(data.items),
    };
  } catch {
    return {
      source: 'fallback',
      items: reviewWatchItems,
    };
  }
}
