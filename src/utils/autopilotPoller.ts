import { runDarakeAutopilot } from './runDarakeAutopilot';
import { loadDarakeAutopilotState } from './darakeAutopilotState';

export type AutopilotPollerSettings = {
  enabled: boolean;
  intervalSeconds: number;
  pauseWhenNeedsHuman: boolean;
};

export const DEFAULT_AUTOPILOT_POLLER_SETTINGS: AutopilotPollerSettings = {
  enabled: true,
  intervalSeconds: 60,
  pauseWhenNeedsHuman: true,
};

const SETTINGS_KEY = 'darake.autopilotPollerSettings.v1';

export function loadAutopilotPollerSettings(): AutopilotPollerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_AUTOPILOT_POLLER_SETTINGS;
    return { ...DEFAULT_AUTOPILOT_POLLER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUTOPILOT_POLLER_SETTINGS;
  }
}

export function saveAutopilotPollerSettings(
  settings: AutopilotPollerSettings,
): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export type AutopilotPollerHandle = {
  stop: () => void;
};

const MAX_CONSECUTIVE_ERRORS = 3;
const BACKOFF_MULTIPLIER = 2;
const MAX_INTERVAL_SECONDS = 600;

/**
 * Starts the autopilot poller.
 * Calls runDarakeAutopilot() at regular intervals while the page is open.
 * Stops automatically after too many consecutive errors.
 * Returns a handle to stop polling.
 */
export function startAutopilotPoller(
  onError?: (err: unknown) => void,
  onStop?: (reason: 'manual' | 'max-errors') => void,
): AutopilotPollerHandle {
  let stopped = false;
  let consecutiveErrors = 0;
  let currentIntervalMs: number;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function scheduleNext(intervalMs: number): void {
    if (stopped) return;
    timeoutId = setTimeout(() => {
      void runOnce();
    }, intervalMs);
  }

  async function runOnce(): Promise<void> {
    if (stopped) return;

    const settings = loadAutopilotPollerSettings();

    if (!settings.enabled) {
      scheduleNext(settings.intervalSeconds * 1000);
      return;
    }

    if (settings.pauseWhenNeedsHuman) {
      const state = loadDarakeAutopilotState();
      if (
        state &&
        (state.status === 'needs-human' ||
          state.status === 'blocked' ||
          state.status === 'merge-candidate' ||
          state.status === 'done' ||
          state.status === 'failed' ||
          state.status === 'off')
      ) {
        scheduleNext(settings.intervalSeconds * 1000);
        return;
      }
    }

    try {
      await runDarakeAutopilot();
      consecutiveErrors = 0;
      currentIntervalMs = settings.intervalSeconds * 1000;
      scheduleNext(currentIntervalMs);
    } catch (err) {
      consecutiveErrors++;
      onError?.(err);

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        stopped = true;
        onStop?.('max-errors');
        return;
      }

      // Exponential backoff
      const backoffSeconds = Math.min(
        settings.intervalSeconds *
          Math.pow(BACKOFF_MULTIPLIER, consecutiveErrors),
        MAX_INTERVAL_SECONDS,
      );
      scheduleNext(backoffSeconds * 1000);
    }
  }

  // Initial run after first interval
  const settings = loadAutopilotPollerSettings();
  currentIntervalMs = settings.intervalSeconds * 1000;
  scheduleNext(currentIntervalMs);

  return {
    stop: () => {
      stopped = true;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      onStop?.('manual');
    },
  };
}
