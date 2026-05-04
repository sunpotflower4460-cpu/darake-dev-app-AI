import type { ReviewRiskLevel, ReviewWatchAction, ReviewWatchLink, WatchStatus } from '../data/reviewWatch';

export type CiWatchItem = {
  id: string;
  label: string;
  status: WatchStatus;
  message: string;
  url?: string;
  risk?: ReviewRiskLevel;
  links?: ReviewWatchLink[];
  actions?: ReviewWatchAction[];
  meta?: {
    runId?: number;
    name?: string;
    status?: string;
    conclusion?: string | null;
    event?: string;
    branch?: string;
    headSha?: string;
    createdAt?: string;
    updatedAt?: string;
    actor?: string;
  };
};

export type CiWatchState = {
  source: string;
  generatedAt?: string;
  repository?: string;
  items: CiWatchItem[];
};

type CiWatchJson = {
  source?: string;
  generatedAt?: string;
  repository?: string;
  items?: CiWatchItem[];
};

const fallbackState: CiWatchState = {
  source: 'fallback',
  repository: 'sunpotflower4460-cpu/darake-dev-app-AI',
  items: [],
};

export async function loadCiWatchState(): Promise<CiWatchState> {
  try {
    const response = await fetch('/ci-watch.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('ci watch file is not available');
    }

    const data = (await response.json()) as CiWatchJson;

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
