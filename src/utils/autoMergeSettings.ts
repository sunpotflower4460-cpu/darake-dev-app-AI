const STORAGE_KEY = 'darake.autoMergeSettings.v1';

export type AutoMergeMode =
  | 'disabled'
  | 'manual-candidate-only'
  | 'low-risk-only';

export type AutoMergeSettings = {
  mode: AutoMergeMode;
  maxChangedFiles: number;
  maxAdditions: number;
  maxDeletions: number;
  requireCiSuccess: boolean;
  requireBuildSuccess: boolean;
  requireNoDangerFiles: boolean;
  requireNoSecurityKeywords: boolean;
  updatedAt: string;
};

const DEFAULT_SETTINGS: AutoMergeSettings = {
  mode: 'manual-candidate-only',
  maxChangedFiles: 12,
  maxAdditions: 800,
  maxDeletions: 500,
  requireCiSuccess: true,
  requireBuildSuccess: true,
  requireNoDangerFiles: true,
  requireNoSecurityKeywords: true,
  updatedAt: new Date().toISOString(),
};

export function loadAutoMergeSettings(): AutoMergeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AutoMergeSettings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAutoMergeSettings(settings: AutoMergeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...settings,
      updatedAt: new Date().toISOString(),
    }));
  } catch {
    // ignore
  }
}

export function resetAutoMergeSettings(): AutoMergeSettings {
  const fresh = { ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() };
  saveAutoMergeSettings(fresh);
  return fresh;
}
