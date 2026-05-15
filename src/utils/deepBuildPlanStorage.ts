import { DEEP_BUILD_MODE_STORAGE_KEY, type DeepBuildPlan } from './deepBuildPlan';
import { DARAKE_FIRST_APP_START_UPDATED_EVENT } from './darakeRuntimeEvents';

function emitDeepBuildUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DARAKE_FIRST_APP_START_UPDATED_EVENT));
}

export function loadDeepBuildPlan(): DeepBuildPlan | null {
  try {
    const raw = localStorage.getItem(DEEP_BUILD_MODE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeepBuildPlan;
    if (!parsed || !Array.isArray(parsed.phases) || !parsed.appName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDeepBuildPlan(plan: DeepBuildPlan): DeepBuildPlan {
  const next: DeepBuildPlan = {
    ...plan,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(DEEP_BUILD_MODE_STORAGE_KEY, JSON.stringify(next));
    emitDeepBuildUpdated();
  } catch {
    // Keep UI resilient when storage is unavailable.
  }
  return next;
}

export function clearDeepBuildPlan(): void {
  try {
    localStorage.removeItem(DEEP_BUILD_MODE_STORAGE_KEY);
    emitDeepBuildUpdated();
  } catch {
    // ignore
  }
}
