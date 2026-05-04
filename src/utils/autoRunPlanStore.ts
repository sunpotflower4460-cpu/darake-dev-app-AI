export type SavedAutoRunPlan = {
  appName: string;
  seed: string;
  completionDefinition: string;
  autoScope: string;
  savedAt?: string;
};

const KEY = 'darake.autoRunPlan.v1';

export const emptyAutoRunPlan: SavedAutoRunPlan = {
  appName: '',
  seed: '',
  completionDefinition: '',
  autoScope: '',
};

export function loadAutoRunPlan(): SavedAutoRunPlan {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyAutoRunPlan, ...JSON.parse(raw) } : emptyAutoRunPlan;
  } catch {
    return emptyAutoRunPlan;
  }
}

export function saveAutoRunPlan(plan: SavedAutoRunPlan): SavedAutoRunPlan {
  const next = {
    ...plan,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return next;
  }

  return next;
}

export function clearAutoRunPlan(): SavedAutoRunPlan {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return emptyAutoRunPlan;
  }

  return emptyAutoRunPlan;
}
