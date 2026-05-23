import { parseGitHubRepoUrl } from './githubRepoUrl';

export type RealPrCiStatus = {
  mode: 'real' | 'unavailable';
  prNumber: number | null;
  prUrl: string | null;
  ciStatus: 'passed' | 'failed' | 'running' | 'unknown' | 'skipped';
  reviewStatus: 'approved' | 'changes-requested' | 'pending' | 'none';
  mergeReadiness: 'ready' | 'not-ready' | 'merged' | 'unknown';
  headSha: string | null;
  message?: string;
};

export type PrCiLastQuery = {
  repoUrl: string;
  prNumber: string;
};

export const PR_CI_LAST_QUERY_KEY = 'darake.prCiHuman.lastQuery.v1';
const DEFAULT_STATUS: Omit<RealPrCiStatus, 'mode' | 'prNumber' | 'prUrl' | 'message'> = {
  ciStatus: 'unknown',
  reviewStatus: 'none',
  mergeReadiness: 'unknown',
  headSha: null,
};

type PrHealthApiResponse = {
  ok?: boolean;
  health?: string;
  summary?: string;
  message?: string;
  details?: string[];
  prNumber?: number;
  prUrl?: string;
  ciStatus?: RealPrCiStatus['ciStatus'];
  reviewStatus?: RealPrCiStatus['reviewStatus'];
  mergeReadiness?: RealPrCiStatus['mergeReadiness'];
  headSha?: string | null;
  error?: string;
};

export function loadPrCiLastQuery(): PrCiLastQuery {
  try {
    const raw = localStorage.getItem(PR_CI_LAST_QUERY_KEY);
    if (!raw) {
      return { repoUrl: '', prNumber: '' };
    }
    const parsed = JSON.parse(raw) as Partial<PrCiLastQuery>;
    return {
      repoUrl: typeof parsed.repoUrl === 'string' ? parsed.repoUrl : '',
      prNumber: typeof parsed.prNumber === 'string' ? parsed.prNumber : '',
    };
  } catch {
    return { repoUrl: '', prNumber: '' };
  }
}

export function savePrCiLastQuery(query: PrCiLastQuery): void {
  try {
    localStorage.setItem(PR_CI_LAST_QUERY_KEY, JSON.stringify(query));
  } catch {
    // ignore
  }
}

export function buildGitHubPrUrl(repoUrl: string, prNumber: number): string | null {
  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed.ok || !Number.isInteger(prNumber) || prNumber <= 0) {
    return null;
  }
  return `https://github.com/${parsed.owner}/${parsed.repo}/pull/${prNumber}`;
}

function mapLegacyHealth(data: PrHealthApiResponse): Omit<RealPrCiStatus, 'mode' | 'prNumber' | 'prUrl' | 'message'> {
  const health = data.health?.toLowerCase() ?? '';

  if (health === 'checks-failed') {
    return { ...DEFAULT_STATUS, ciStatus: 'failed', mergeReadiness: 'not-ready' };
  }

  if (health === 'checks-running' || health === 'waiting') {
    return { ...DEFAULT_STATUS, ciStatus: 'running' };
  }

  if (health === 'review-needed') {
    return {
      ...DEFAULT_STATUS,
      ciStatus: 'passed',
      reviewStatus: 'pending',
      mergeReadiness: 'not-ready',
    };
  }

  if (health === 'ready-to-merge') {
    return {
      ...DEFAULT_STATUS,
      ciStatus: 'passed',
      mergeReadiness: 'ready',
    };
  }

  if (health === 'checks-passed') {
    return {
      ...DEFAULT_STATUS,
      ciStatus: 'passed',
      mergeReadiness: 'not-ready',
    };
  }

  return DEFAULT_STATUS;
}

function normalizeStatus(
  repoUrl: string,
  prNumber: number,
  data: PrHealthApiResponse,
): RealPrCiStatus {
  const fallback = mapLegacyHealth(data);
  return {
    mode: 'real',
    prNumber: data.prNumber ?? prNumber,
    prUrl: data.prUrl ?? buildGitHubPrUrl(repoUrl, data.prNumber ?? prNumber),
    ciStatus: data.ciStatus ?? fallback.ciStatus,
    reviewStatus: data.reviewStatus ?? fallback.reviewStatus,
    mergeReadiness: data.mergeReadiness ?? fallback.mergeReadiness,
    headSha: typeof data.headSha === 'string' ? data.headSha : fallback.headSha,
    message: data.summary ?? data.message,
  };
}

export async function fetchRealPrCiStatus(repoUrl: string, prNumber: number): Promise<RealPrCiStatus> {
  const parsed = parseGitHubRepoUrl(repoUrl);
  const prUrl = buildGitHubPrUrl(repoUrl, prNumber);

  if (!parsed.ok) {
    return {
      mode: 'unavailable',
      prNumber,
      prUrl,
      ...DEFAULT_STATUS,
      message: parsed.error,
    };
  }

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    return {
      mode: 'unavailable',
      prNumber: null,
      prUrl: null,
      ...DEFAULT_STATUS,
      message: 'PR番号を確認してください。',
    };
  }

  try {
    const res = await fetch('/api/github/prs/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl: repoUrl.trim(), prNumber }),
    });

    const data = (await res.json().catch(() => null)) as PrHealthApiResponse | null;
    if (!res.ok || !data?.ok) {
      return {
        mode: 'unavailable',
        prNumber,
        prUrl,
        ...DEFAULT_STATUS,
        message: data?.error ?? data?.message ?? `HTTP ${res.status}`,
      };
    }

    return normalizeStatus(repoUrl.trim(), prNumber, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      mode: 'unavailable',
      prNumber,
      prUrl,
      ...DEFAULT_STATUS,
      message: `ネットワークエラー: ${message}`,
    };
  }
}
