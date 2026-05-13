import type { DarakeNavGroupId } from './navigationGroups';

export const DARAKE_NAV_GROUP_CHANGE_EVENT = 'darake:nav-group-change';

export type DarakeNavGroupChangeDetail = {
  group: DarakeNavGroupId | 'all';
};

export function requestDarakeNavGroupChange(group: DarakeNavGroupId | 'all'): void {
  try {
    localStorage.setItem('darake.navGroup.v1', group);
  } catch {
    // ignore
  }
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<DarakeNavGroupChangeDetail>(DARAKE_NAV_GROUP_CHANGE_EVENT, {
      detail: { group },
    })
  );
}
