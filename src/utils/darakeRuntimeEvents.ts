export const DARAKE_FIRST_LAUNCH_UPDATED_EVENT = 'darake:first-launch-updated';
export const DARAKE_GENTLE_FORM_UPDATED_EVENT = 'darake:gentle-form-updated';
export const DARAKE_FIRST_APP_START_UPDATED_EVENT = 'darake:first-app-start-updated';

export type DarakeRuntimeEventName =
  | typeof DARAKE_FIRST_LAUNCH_UPDATED_EVENT
  | typeof DARAKE_GENTLE_FORM_UPDATED_EVENT
  | typeof DARAKE_FIRST_APP_START_UPDATED_EVENT;

export function emitDarakeRuntimeEvent(name: DarakeRuntimeEventName): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name));
  window.dispatchEvent(new CustomEvent(DARAKE_FIRST_APP_START_UPDATED_EVENT));
}

/**
 * Subscribe to runtime state update events from both same-tab custom events
 * and cross-tab localStorage `storage` events (darake.* keys only).
 * Returns an unsubscribe function.
 */
export function subscribeDarakeRuntimeEvents(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  // Same-tab: custom event
  window.addEventListener(DARAKE_FIRST_APP_START_UPDATED_EVENT, listener);

  // Cross-tab: native storage event (fires only in OTHER tabs)
  function handleStorage(e: StorageEvent): void {
    if (e.key && e.key.startsWith('darake.')) {
      listener();
    }
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(DARAKE_FIRST_APP_START_UPDATED_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
