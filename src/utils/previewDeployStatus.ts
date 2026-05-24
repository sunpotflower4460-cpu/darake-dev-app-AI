import { isAllowedPreviewUrl } from './previewUrlExtractor';

const STORAGE_KEY = 'darake.previewDeployStatus.v1';

export type DeployStatus = 'unknown' | 'deploying' | 'deployed' | 'failed';

export type PreviewDeployRecord = {
  phaseName: string;
  deployStatus: DeployStatus;
  deployedAt: string | null;
  previewUrl: string | null;
  note: string | null;
};

export function loadPreviewDeployRecord(): PreviewDeployRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PreviewDeployRecord;
  } catch {
    return null;
  }
}

export function sanitizePreviewUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return null;
    }
    parsed.hash = '';
    const sanitized = parsed.toString();
    return isAllowedPreviewUrl(sanitized) ? sanitized : null;
  } catch {
    return null;
  }
}

export function savePreviewDeployRecord(record: PreviewDeployRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore
  }
}

export function buildDefaultPreviewDeployRecord(): PreviewDeployRecord {
  return {
    phaseName: 'Phase 104',
    deployStatus: 'unknown',
    deployedAt: null,
    previewUrl: null,
    note: null,
  };
}

export function deployStatusLabel(status: DeployStatus): string {
  const labels: Record<DeployStatus, string> = {
    unknown: '未確認',
    deploying: 'デプロイ中',
    deployed: '完了',
    failed: '失敗',
  };
  return labels[status];
}

export function deployStatusLevel(status: DeployStatus): 'ok' | 'warn' | 'error' | 'neutral' {
  const levels: Record<DeployStatus, 'ok' | 'warn' | 'error' | 'neutral'> = {
    unknown: 'neutral',
    deploying: 'warn',
    deployed: 'ok',
    failed: 'error',
  };
  return levels[status];
}
