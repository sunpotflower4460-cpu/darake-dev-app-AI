import type { ReviewRiskLevel, ReviewWatchAction, ReviewWatchLink, WatchStatus } from '../data/reviewWatch';

export type PrFreshnessLevel = 'fresh' | 'aging' | 'stale' | 'unknown';

export type PrFreshness = {
  level: PrFreshnessLevel;
  label: string;
  message: string;
  minutesOld?: number;
  shouldUpdate: boolean;
};

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
  freshness: PrFreshness;
  items: PrWatchItem[];
};

type PrWatchJson = {
  source?: string;
  generatedAt?: string;
  repository?: string;
  items?: PrWatchItem[];
};

function getPrFreshness(generatedAt?: string): PrFreshness {
  if (!generatedAt) {
    return {
      level: 'unknown',
      label: '更新時刻不明',
      message: 'PR一覧の更新時刻が分からないので、必要なら手動更新します。',
      shouldUpdate: true,
    };
  }

  const parsed = Date.parse(generatedAt);

  if (Number.isNaN(parsed)) {
    return {
      level: 'unknown',
      label: '更新時刻不明',
      message: 'PR一覧の更新時刻を読めませんでした。',
      shouldUpdate: true,
    };
  }

  const minutesOld = Math.max(0, Math.round((Date.now() - parsed) / 60000));

  if (minutesOld <= 30) {
    return {
      level: 'fresh',
      label: '新しい',
      message: '今はだらけてOK。PR一覧は新しめです。',
      minutesOld,
      shouldUpdate: false,
    };
  }

  if (minutesOld <= 180) {
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
    message: 'PR状況を見るなら、PR Watchの手動更新をおすすめします。',
    minutesOld,
    shouldUpdate: true,
  };
}

const fallbackState: PrWatchState = {
  source: 'fallback',
  repository: 'sunpotflower4460-cpu/darake-dev-app-AI',
  freshness: getPrFreshness(undefined),
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
      freshness: getPrFreshness(data.generatedAt),
      items: Array.isArray(data.items) ? data.items : [],
    };
  } catch {
    return fallbackState;
  }
}
