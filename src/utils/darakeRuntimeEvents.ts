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

export function subscribeDarakeRuntimeEvents(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(DARAKE_FIRST_APP_START_UPDATED_EVENT, listener);
  return () => window.removeEventListener(DARAKE_FIRST_APP_START_UPDATED_EVENT, listener);
}
