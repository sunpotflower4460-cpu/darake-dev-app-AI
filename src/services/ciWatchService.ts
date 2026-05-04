import type { ReviewRiskLevel, ReviewWatchAction, ReviewWatchLink, WatchStatus } from '../data/reviewWatch';

export type CiFreshnessLevel = 'fresh' | 'aging' | 'stale' | 'unknown';

export type CiFreshness = {
  level: CiFreshnessLevel;
  label: string;
  message: string;
  minutesOld?: number;
  shouldUpdate: boolean;
};

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
  freshness: CiFreshness;
  items: CiWatchItem[];
};

type CiWatchJson = {
  source?: string;
  generatedAt?: string;
  repository?: string;
  items?: CiWatchItem[];
};

function getCiFreshness(generatedAt?: string): CiFreshness {
  if (!generatedAt) {
    return {
      level: 'unknown',
      label: '更新時刻不明',
      message: 'CI状態の更新時刻が分からないので、必要なら手動更新します。',
      shouldUpdate: true,
    };
  }

  const parsed = Date.parse(generatedAt);

  if (Number.isNaN(parsed)) {
    return {
      level: 'unknown',
      label: '更新時刻不明',
      message: 'CI状態の更新時刻を読めませんでした。',
      shouldUpdate: true,
    };
  }

  const minutesOld = Math.max(0, Math.round((Date.now() - parsed) / 60000));

  if (minutesOld <= 20) {
    return {
      level: 'fresh',
      label: '新しい',
      message: '今はだらけてOK。CI状態は新しめです。',
      minutesOld,
      shouldUpdate: false,
    };
  }

  if (minutesOld <= 120) {
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
    message: 'CI状態を見るなら、CI Watchの手動更新をおすすめします。',
    minutesOld,
    shouldUpdate: true,
  };
}

const fallbackState: CiWatchState = {
  source: 'fallback',
  repository: 'sunpotflower4460-cpu/darake-dev-app-AI',
  freshness: getCiFreshness(undefined),
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
      freshness: getCiFreshness(data.generatedAt),
      items: Array.isArray(data.items) ? data.items : [],
    };
  } catch {
    return fallbackState;
  }
}
