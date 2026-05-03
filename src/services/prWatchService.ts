import type { ReviewRiskLevel, ReviewWatchAction, ReviewWatchLink, WatchStatus } from '../data/reviewWatch';

export type PrWatchItem = {
  id: string;
  label: string;
  status: WatchStatus;
  message: string;
  url?: string;
  risk?: ReviewRiskLevel;
  links?: ReviewWatchLink[];
  actions?: ReviewWatchAction[];
  meta?: {
    number?: number;
    state?: string;
    draft?: boolean;
    head?: string;
    base?: string;
    updatedAt?: string;
    author?: string;
  };
};

export type PrWatchState = {
  source: string;
  generatedAt?: string;
  repository?: string;
  items: PrWatchItem[];
};

type PrWatchJson = {
  source?: string;
  generatedAt?: string;
  repository?: string;
  items?: PrWatchItem[];
};

const fallbackState: PrWatchState = {
  source: 'fallback',
  repository: 'sunpotflower4460-cpu/darake-dev-app-AI',
  items: [],
};

export async function loadPrWatchState(): Promise<PrWatchState> {
  try {
    const response = await fetch('/pr-watch.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('pr watch file is not available');
    }

    const data = (await response.json()) as PrWatchJson;

    return {
      source: data.source ?? 'json',
      generatedAt: data.generatedAt,
      repository: data.repository,
      items: Array.isArray(data.items) ? data.items : [],
    };
  } catch {
    return fallbackState;
  }
}
