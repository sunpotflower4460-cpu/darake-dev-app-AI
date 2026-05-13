export type DarakeHealthItemStatus =
  | 'ok'
  | 'missing'
  | 'disabled'
  | 'warning'
  | 'unknown';

export type DarakeHealthItem = {
  id: string;
  label: string;
  status: DarakeHealthItemStatus;
  userMessage: string;
  nextAction?: string;
};

export type DarakeHealthCheckResult = {
  overall: 'ready' | 'mostly-ready' | 'partial' | 'blocked' | 'unknown';
  title: string;
  userMessage: string;
  nextActionLabel: string;
  items: DarakeHealthItem[];
  checkedAt: string;
  readinessScore: number;
};

const HEALTH_STORAGE_KEY = 'darake.healthCheckResult.v1';
const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

export function saveHealthCheckResult(result: DarakeHealthCheckResult): void {
  try {
    localStorage.setItem(
      HEALTH_STORAGE_KEY,
      JSON.stringify({ result, checkedAt: result.checkedAt }),
    );
  } catch {
    // ignore
  }
}

export function loadHealthCheckResult(): DarakeHealthCheckResult | null {
  try {
    const raw = localStorage.getItem(HEALTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      result: DarakeHealthCheckResult;
      checkedAt: string;
    };
    return parsed.result ?? null;
  } catch {
    return null;
  }
}

export function isHealthCheckStale(checkedAt: string): boolean {
  const checkedMs = new Date(checkedAt).getTime();
  return Date.now() - checkedMs > STALE_THRESHOLD_MS;
}
