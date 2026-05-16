import { fetchPrCiRealData } from './prCiRealDataClient';

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

export async function fetchRealPrCiStatus(
  repoUrl: string,
  prNumber: number,
): Promise<RealPrCiStatus> {
  const result = await fetchPrCiRealData(repoUrl, prNumber);

  if (!result.ok) {
    return {
      mode: 'unavailable',
      prNumber,
      prUrl: null,
      ciStatus: 'unknown',
      reviewStatus: 'none',
      mergeReadiness: 'unknown',
      headSha: null,
      message: result.error,
    };
  }

  const health = result.health.toLowerCase();
  const ciStatus: RealPrCiStatus['ciStatus'] =
    health.includes('pass') || health.includes('success') || health.includes('green')
      ? 'passed'
      : health.includes('fail') || health.includes('red')
        ? 'failed'
        : health.includes('run') || health.includes('pending')
          ? 'running'
          : 'unknown';

  const mergeReadiness: RealPrCiStatus['mergeReadiness'] =
    health.includes('merged') ? 'merged' : ciStatus === 'passed' ? 'ready' : 'not-ready';

  return {
    mode: 'real',
    prNumber,
    prUrl: null,
    ciStatus,
    reviewStatus: 'none',
    mergeReadiness,
    headSha: null,
    message: result.summary,
  };
}
