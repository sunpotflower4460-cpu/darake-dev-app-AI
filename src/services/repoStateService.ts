import { repoSnapshot } from '../data/repoSnapshot';
import type { RepoSnapshot } from '../data/repoSnapshot';

export type FreshnessLevel = 'fresh' | 'aging' | 'stale' | 'unknown';

export type LoadedRepoState = RepoSnapshot & {
  source: string;
  generatedAt?: string;
  freshness: {
    level: FreshnessLevel;
    label: string;
    message: string;
    minutesOld?: number;
    canRelax: boolean;
  };
};

type RepoStateJson = {
  source?: string;
  generatedAt?: string;
  repository?: {
    name?: string;
    fullName?: string;
    visibility?: 'private' | 'public';
    defaultBranch?: string;
  };
  counts?: {
    issues?: number;
  };
  pullRequests?: Array<{
    number: number;
    title: string;
    status: 'merged' | 'open' | 'closed';
  }>;
};

function getFreshness(generatedAt?: string): LoadedRepoState['freshness'] {
  if (!generatedAt) {
    return {
      level: 'unknown',
      label: '更新時刻不明',
      message: '状態ファイルの更新時刻が分からないので、必要なら手動更新します。',
      canRelax: false,
    };
  }

  const parsed = Date.parse(generatedAt);

  if (Number.isNaN(parsed)) {
    return {
      level: 'unknown',
      label: '更新時刻不明',
      message: '更新時刻の形式を読めませんでした。',
      canRelax: false,
    };
  }

  const minutesOld = Math.max(0, Math.round((Date.now() - parsed) / 60000));

  if (minutesOld <= 60) {
    return {
      level: 'fresh',
      label: '新しい',
      message: '今はだらけて大丈夫。状態はかなり新しめです。',
      minutesOld,
      canRelax: true,
    };
  }

  if (minutesOld <= 360) {
    return {
      level: 'aging',
      label: '少し前',
      message: '急ぎでなければまだ大丈夫。気になる時だけ更新します。',
      minutesOld,
      canRelax: true,
    };
  }

  return {
    level: 'stale',
    label: '古いかも',
    message: '確認するなら、状態ファイルの手動更新をおすすめします。',
    minutesOld,
    canRelax: false,
  };
}

export async function loadRepoState(): Promise<LoadedRepoState> {
  try {
    const response = await fetch('/repo-state.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('state file is not available');
    }

    const data = (await response.json()) as RepoStateJson;
    const generatedAt = data.generatedAt ?? repoSnapshot.lastUpdatedLabel;

    return {
      ...repoSnapshot,
      name: data.repository?.name ?? repoSnapshot.name,
      fullName: data.repository?.fullName ?? repoSnapshot.fullName,
      visibility: data.repository?.visibility ?? repoSnapshot.visibility,
      defaultBranch: data.repository?.defaultBranch ?? repoSnapshot.defaultBranch,
      issueCount: data.counts?.issues ?? repoSnapshot.issueCount,
      lastUpdatedLabel: generatedAt,
      generatedAt,
      pullRequests: data.pullRequests?.map((item) => ({
        number: item.number,
        title: item.title,
        status: item.status,
        url: repoSnapshot.pullRequests.find((pr) => pr.number === item.number)?.url ?? '',
        summary: repoSnapshot.pullRequests.find((pr) => pr.number === item.number)?.summary ?? '状態ファイルから読み込まれた項目です。',
      })) ?? repoSnapshot.pullRequests,
      source: data.source ?? 'fallback',
      freshness: getFreshness(generatedAt),
    };
  } catch {
    return {
      ...repoSnapshot,
      source: 'fallback',
      freshness: getFreshness(repoSnapshot.lastUpdatedLabel),
    };
  }
}
