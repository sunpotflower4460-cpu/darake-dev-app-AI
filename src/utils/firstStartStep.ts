import { DARAKE_FIRST_APP_START_UPDATED_EVENT, emitDarakeRuntimeEvent } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.firstStartStep.v1';

export type FirstStartStep = 'onboarding' | 'form' | 'pon';

export function loadFirstStartStep(): FirstStartStep | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'onboarding' || raw === 'form' || raw === 'pon') return raw;
    return null;
  } catch {
    return null;
  }
}

export function saveFirstStartStep(step: FirstStartStep): void {
  try {
    localStorage.setItem(STORAGE_KEY, step);
    emitDarakeRuntimeEvent(DARAKE_FIRST_APP_START_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function clearFirstStartStep(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_FIRST_APP_START_UPDATED_EVENT);
  } catch {
    // ignore
  }
}
