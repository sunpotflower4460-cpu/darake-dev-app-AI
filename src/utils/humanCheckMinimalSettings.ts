export type HumanCheckMinimalSettings = {
  defaultMode: 'minimal' | 'normal';
  showOnlyOneAction: boolean;
  hideLowPriorityWarnings: boolean;
  requireReasonOnStop: boolean;
  laterSnoozeLabel: 'today' | 'tomorrow' | 'next-session';
  fixedSafetyMode: 'strict-manual-gate';
};

export const DEFAULT_HUMAN_CHECK_MINIMAL_SETTINGS: HumanCheckMinimalSettings =
  {
    defaultMode: 'minimal',
    showOnlyOneAction: true,
    hideLowPriorityWarnings: true,
    requireReasonOnStop: true,
    laterSnoozeLabel: 'next-session',
    // fixedSafetyMode cannot be changed
    fixedSafetyMode: 'strict-manual-gate',
  };

const STORAGE_KEY = 'darake.humanCheckMinimalSettings.v1';

export function loadHumanCheckMinimalSettings(): HumanCheckMinimalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_HUMAN_CHECK_MINIMAL_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<HumanCheckMinimalSettings>;
    return {
      ...DEFAULT_HUMAN_CHECK_MINIMAL_SETTINGS,
      ...parsed,
      // fixedSafetyMode is immutable
      fixedSafetyMode: 'strict-manual-gate',
    };
  } catch {
    return { ...DEFAULT_HUMAN_CHECK_MINIMAL_SETTINGS };
  }
}

export function saveHumanCheckMinimalSettings(
  settings: HumanCheckMinimalSettings
): void {
  try {
    // ensure fixedSafetyMode is always preserved
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...settings, fixedSafetyMode: 'strict-manual-gate' })
    );
  } catch {
    // ignore
  }
}
