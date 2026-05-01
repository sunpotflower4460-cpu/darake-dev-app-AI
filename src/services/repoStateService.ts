import { repoSnapshot } from '../data/repoSnapshot';
import type { RepoSnapshot } from '../data/repoSnapshot';

export type LoadedRepoState = RepoSnapshot & {
  source: string;
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

export async function loadRepoState(): Promise<LoadedRepoState> {
  try {
    const response = await fetch('/repo-state.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('state file is not available');
    }

    const data = (await response.json()) as RepoStateJson;

    return {
      ...repoSnapshot,
      name: data.repository?.name ?? repoSnapshot.name,
      fullName: data.repository?.fullName ?? repoSnapshot.fullName,
      visibility: data.repository?.visibility ?? repoSnapshot.visibility,
      defaultBranch: data.repository?.defaultBranch ?? repoSnapshot.defaultBranch,
      issueCount: data.counts?.issues ?? repoSnapshot.issueCount,
      lastUpdatedLabel: data.generatedAt ?? repoSnapshot.lastUpdatedLabel,
      pullRequests: data.pullRequests?.map((item) => ({
        number: item.number,
        title: item.title,
        status: item.status,
        url: repoSnapshot.pullRequests.find((pr) => pr.number === item.number)?.url ?? '',
        summary: repoSnapshot.pullRequests.find((pr) => pr.number === item.number)?.summary ?? '状態ファイルから読み込まれた項目です。',
      })) ?? repoSnapshot.pullRequests,
      source: data.source ?? 'fallback',
    };
  } catch {
    return {
      ...repoSnapshot,
      source: 'fallback',
    };
  }
}
