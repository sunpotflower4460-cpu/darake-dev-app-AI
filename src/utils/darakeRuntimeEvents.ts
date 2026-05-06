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

export function subscribeDarakeRuntimeEvents(
  listener: () => void,
  eventNames: DarakeRuntimeEventName[] = [
    DARAKE_FIRST_LAUNCH_UPDATED_EVENT,
    DARAKE_GENTLE_FORM_UPDATED_EVENT,
    DARAKE_FIRST_APP_START_UPDATED_EVENT,
  ],
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  eventNames.forEach((name) => window.addEventListener(name, listener));
  return () => eventNames.forEach((name) => window.removeEventListener(name, listener));
}
