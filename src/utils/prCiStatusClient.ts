import { parseGitHubRepoUrl } from './githubRepoUrl';

export type RealPrCiStatus = {
  mode: 'real' | 'unavailable' | 'error';
  prNumber: number | null;
  prUrl: string | null;
  ciStatus: 'passed' | 'failed' | 'running' | 'unknown' | 'skipped';
  reviewStatus: 'approved' | 'changes-requested' | 'pending' | 'none' | 'unknown';
  mergeReadiness: 'ready' | 'not-ready' | 'merged' | 'conflict' | 'unknown';
  headSha: string | null;
  message?: string;
};

export type PrCiLastQuery = {
  repoUrl: string;
  prNumber: string;
};

export const PR_CI_LAST_QUERY_KEY = 'darake.prCiHuman.lastQuery.v1';

const PR_HEALTH_ENDPOINTS = ['/api/github/prs/health', '/api/darake/pr/health', '/api/pr/health'] as const;
const UNAVAILABLE_MESSAGE = 'PR状態取得APIはまだ未接続です';

const DEFAULT_STATUS: Omit<RealPrCiStatus, 'mode' | 'prNumber' | 'prUrl' | 'message'> = {
  ciStatus: 'unknown',
  reviewStatus: 'unknown',
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
  mergeReadiness?: RealPrCiStatus['mergeReadiness'] | 'blocked';
  headSha?: string | null;
  error?: string;
};
const VALID_REVIEW_STATUSES = ['approved', 'changes-requested', 'pending', 'none'] as const;
const VALID_MERGE_READINESS = ['ready', 'not-ready', 'merged', 'conflict'] as const;

function isValidReviewStatus(value: unknown): value is (typeof VALID_REVIEW_STATUSES)[number] {
  return typeof value === 'string' && (VALID_REVIEW_STATUSES as readonly string[]).includes(value);
}

function isValidMergeReadiness(value: unknown): value is (typeof VALID_MERGE_READINESS)[number] {
  return typeof value === 'string' && (VALID_MERGE_READINESS as readonly string[]).includes(value);
}

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
    return { ...DEFAULT_STATUS, ciStatus: 'running', reviewStatus: 'pending', mergeReadiness: 'not-ready' };
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
      reviewStatus: 'approved',
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

  if (health === 'merged') {
    return {
      ...DEFAULT_STATUS,
      ciStatus: 'passed',
      mergeReadiness: 'merged',
    };
  }

  if (health === 'changes-requested') {
    return {
      ...DEFAULT_STATUS,
      ciStatus: 'passed',
      reviewStatus: 'changes-requested',
      mergeReadiness: 'not-ready',
    };
  }

  if (health === 'conflict' || health === 'blocked') {
    return {
      ...DEFAULT_STATUS,
      mergeReadiness: 'conflict',
    };
  }

  return DEFAULT_STATUS;
}

function normalizeReviewStatus(value: PrHealthApiResponse['reviewStatus']): RealPrCiStatus['reviewStatus'] {
  if (isValidReviewStatus(value)) {
    return value;
  }
  return 'unknown';
}

function normalizeMergeReadiness(value: PrHealthApiResponse['mergeReadiness']): RealPrCiStatus['mergeReadiness'] {
  if (isValidMergeReadiness(value)) {
    return value;
  }
  if (value === 'blocked') {
    return 'conflict';
  }
  return 'unknown';
}

function normalizeStatus(repoUrl: string, prNumber: number, data: PrHealthApiResponse): RealPrCiStatus {
  const fallback = mapLegacyHealth(data);
  return {
    mode: 'real',
    prNumber: data.prNumber ?? prNumber,
    prUrl: data.prUrl ?? buildGitHubPrUrl(repoUrl, data.prNumber ?? prNumber),
    ciStatus: data.ciStatus ?? fallback.ciStatus,
    reviewStatus: data.reviewStatus ? normalizeReviewStatus(data.reviewStatus) : fallback.reviewStatus,
    mergeReadiness: data.mergeReadiness ? normalizeMergeReadiness(data.mergeReadiness) : fallback.mergeReadiness,
    headSha: typeof data.headSha === 'string' ? data.headSha : fallback.headSha,
    message: data.summary ?? data.message,
  };
}

function buildUnavailable(repoUrl: string, prNumber: number, message: string): RealPrCiStatus {
  return {
    mode: 'unavailable',
    prNumber,
    prUrl: buildGitHubPrUrl(repoUrl, prNumber),
    ...DEFAULT_STATUS,
    message,
  };
}

function buildError(repoUrl: string, prNumber: number, message: string): RealPrCiStatus {
  return {
    mode: 'error',
    prNumber,
    prUrl: buildGitHubPrUrl(repoUrl, prNumber),
    ...DEFAULT_STATUS,
    message,
  };
}

export async function fetchPrCiStatus(repoUrl: string, prNumber: number): Promise<RealPrCiStatus> {
  const normalizedRepoUrl = repoUrl.trim();
  const parsed = parseGitHubRepoUrl(normalizedRepoUrl);

  if (!parsed.ok) {
    return {
      mode: 'error',
      prNumber,
      prUrl: buildGitHubPrUrl(repoUrl, prNumber),
      ...DEFAULT_STATUS,
      message: parsed.error,
    };
  }

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    return {
      mode: 'error',
      prNumber: null,
      prUrl: null,
      ...DEFAULT_STATUS,
      message: 'PR番号を確認してください。',
    };
  }

  let sawNotFound = false;

  for (const endpoint of PR_HEALTH_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: normalizedRepoUrl, prNumber }),
      });

      const data = (await res.json().catch(() => null)) as PrHealthApiResponse | null;
      if (res.status === 404) {
        sawNotFound = true;
        continue;
      }

      if (!res.ok) {
        return buildError(normalizedRepoUrl, prNumber, data?.error ?? data?.message ?? `HTTP ${res.status}`);
      }

      if (!data?.ok) {
        return buildError(normalizedRepoUrl, prNumber, data?.error ?? data?.message ?? 'PR状態を取得できませんでした。');
      }

      return normalizeStatus(normalizedRepoUrl, prNumber, data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return buildError(normalizedRepoUrl, prNumber, `ネットワークエラー: ${message}`);
    }
  }

  if (sawNotFound) {
    return buildUnavailable(normalizedRepoUrl, prNumber, UNAVAILABLE_MESSAGE);
  }

  return buildUnavailable(normalizedRepoUrl, prNumber, UNAVAILABLE_MESSAGE);
}

export const fetchRealPrCiStatus = fetchPrCiStatus;
