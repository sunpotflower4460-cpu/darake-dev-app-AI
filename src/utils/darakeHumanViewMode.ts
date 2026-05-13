export type DarakeHumanViewMode = 'human' | 'details' | 'debug';

const HUMAN_VIEW_MODE_KEY = 'darake.humanViewMode.v1';
export const DARAKE_HUMAN_VIEW_MODE_CHANGE_EVENT = 'darake:human-view-mode-change';

export type DarakeHumanViewModeChangeDetail = {
  mode: DarakeHumanViewMode;
};

export function loadDarakeHumanViewMode(): DarakeHumanViewMode {
  try {
    const raw = localStorage.getItem(HUMAN_VIEW_MODE_KEY);
    if (raw === 'details' || raw === 'debug' || raw === 'human') return raw;
  } catch {
    // ignore
  }
  return 'human';
}

export function saveDarakeHumanViewMode(mode: DarakeHumanViewMode): void {
  try {
    localStorage.setItem(HUMAN_VIEW_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

export function requestDarakeHumanViewModeChange(mode: DarakeHumanViewMode): void {
  saveDarakeHumanViewMode(mode);
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<DarakeHumanViewModeChangeDetail>(DARAKE_HUMAN_VIEW_MODE_CHANGE_EVENT, {
      detail: { mode },
    })
  );
}
