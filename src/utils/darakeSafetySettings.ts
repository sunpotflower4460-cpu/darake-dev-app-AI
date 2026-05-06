export type DarakeSafetySettings = {
  batchGateMode: boolean;
  autoIssueDraft: boolean;
  autoPRCandidate: boolean;
  autoMergeCandidate: boolean;
  notificationMode: 'quiet' | 'normal' | 'strict';
};

// These are fixed and cannot be changed
export const FIXED_SAFETY_POLICY = {
  appStoreSubmitAutomation: 'always-manual' as const,
  secretsHandling: 'never-store' as const,
};

const STORAGE_KEY = 'darake.safetySettings.v1';

export function buildDefaultSafetySettings(): DarakeSafetySettings {
  return {
    batchGateMode: true,
    autoIssueDraft: false,
    autoPRCandidate: false,
    autoMergeCandidate: false,
    notificationMode: 'normal',
  };
}

export function loadSafetySettings(): DarakeSafetySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultSafetySettings();
    return { ...buildDefaultSafetySettings(), ...JSON.parse(raw) };
  } catch {
    return buildDefaultSafetySettings();
  }
}

export function saveSafetySettings(settings: DarakeSafetySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
