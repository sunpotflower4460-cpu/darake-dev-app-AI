import type { FirstLaunchCareState } from './firstLaunchCareOnboarding';

const STORAGE_KEY = 'darake.firstStartHandoff.v1';

export type FirstStartHandoff = {
  appName: string;
  oneLineIdea: string;
  targetUser: string;
  platform: 'iphone' | 'web' | 'both' | 'not-sure';
  autoPreference:
    | 'explain-everything'
    | 'ask-only-important'
    | 'do-safe-things-silently'
    | 'maximum-darake';
  updatedAt: string;
};

function mapPlatform(platform: FirstLaunchCareState['platform']): FirstStartHandoff['platform'] {
  if (platform === 'ios') return 'iphone';
  if (platform === 'web') return 'web';
  return 'not-sure';
}

function mapAutoPreference(level: FirstLaunchCareState['darakeLevel']): FirstStartHandoff['autoPreference'] {
  if (level === 'maximum-darake') return 'maximum-darake';
  if (level === 'mostly-auto') return 'do-safe-things-silently';
  return 'ask-only-important';
}

export function buildFirstStartHandoffFromOnboarding(state: FirstLaunchCareState): FirstStartHandoff {
  return {
    appName: state.appName,
    oneLineIdea: state.appSeed,
    targetUser: state.targetUser,
    platform: mapPlatform(state.platform),
    autoPreference: mapAutoPreference(state.darakeLevel),
    updatedAt: new Date().toISOString(),
  };
}

export function saveFirstStartHandoff(handoff: FirstStartHandoff): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(handoff));
  } catch {
    // ignore
  }
}

export function loadFirstStartHandoff(): FirstStartHandoff | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FirstStartHandoff;
    return parsed;
  } catch {
    return null;
  }
}

export function clearFirstStartHandoff(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
