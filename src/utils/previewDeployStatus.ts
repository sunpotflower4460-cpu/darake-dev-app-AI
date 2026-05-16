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

export function savePreviewDeployRecord(record: PreviewDeployRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore
  }
}

export function buildDefaultPreviewDeployRecord(): PreviewDeployRecord {
  return {
    phaseName: 'Phase 97',
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
