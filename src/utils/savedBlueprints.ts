import type { GeneratedPhasePlan } from './phasePlanGenerator';

export type SavedBlueprint = {
  id: string;
  appName: string;
  templateId: string;
  templateLabel: string;
  soul: string;
  platform: string;
  complexity: string;
  plan: GeneratedPhasePlan;
  createdAt: string;
};

const STORAGE_KEY = 'darake.savedBlueprints.v1';

export function loadSavedBlueprints(): SavedBlueprint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedBlueprint[];
  } catch {
    return [];
  }
}

export function saveSavedBlueprints(blueprints: SavedBlueprint[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blueprints));
  } catch {
    // ignore
  }
}

export function addSavedBlueprint(
  blueprints: SavedBlueprint[],
  blueprint: SavedBlueprint,
): SavedBlueprint[] {
  return [...blueprints, blueprint];
}

export function deleteSavedBlueprint(blueprints: SavedBlueprint[], id: string): SavedBlueprint[] {
  return blueprints.filter((b) => b.id !== id);
}
