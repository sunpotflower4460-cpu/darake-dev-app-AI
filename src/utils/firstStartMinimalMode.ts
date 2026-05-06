import { DARAKE_FIRST_APP_START_UPDATED_EVENT, emitDarakeRuntimeEvent } from './darakeRuntimeEvents';

const RELEASE_KEY = 'darake.firstStartMinimalModeReleased.v1';

export function isFirstStartMinimalModeReleased(): boolean {
  try {
    return localStorage.getItem(RELEASE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function releaseFirstStartMinimalMode(): void {
  try {
    localStorage.setItem(RELEASE_KEY, 'true');
    emitDarakeRuntimeEvent(DARAKE_FIRST_APP_START_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function resetFirstStartMinimalModeRelease(): void {
  try {
    localStorage.removeItem(RELEASE_KEY);
    emitDarakeRuntimeEvent(DARAKE_FIRST_APP_START_UPDATED_EVENT);
  } catch {
    // ignore
  }
}
