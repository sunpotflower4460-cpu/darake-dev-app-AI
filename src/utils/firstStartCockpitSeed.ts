import type { GentleAppStartForm } from './gentleAppStartForm';
import { buildGentleFormToBlueprintBridge } from './gentleFormToBlueprintBridge';
import {
  addBlueprint,
  createTasksFromBlueprint,
  loadBlueprintStock,
  type DarakeBlueprintPhase,
} from './darakeBlueprintStock';
import { createSleepSessionFromQueue } from './darakeSleepSession';

const FIRST_START_SEED_NOTE = 'first-start-cockpit-seed.v1';
const DEFAULT_HARD_STOPS = [
  'GitHub APIは実行しない',
  'App Store APIは実行しない',
  'secretを保存しない',
];
const SLEEP_SESSION_TITLE_SUFFIX = '今夜進める候補';

function splitTextList(value: string): string[] {
  return value
    .split(/\r?\n|、|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildBlueprintPhases(form: GentleAppStartForm): DarakeBlueprintPhase[] {
  const bridge = buildGentleFormToBlueprintBridge(form);
  return bridge.suggestedPhases.map((phase, index) => ({
    id: `phase-${index + 1}`,
    title: phase.title,
    goal: phase.purpose,
    doneDefinition: phase.doneConditions.join(' / '),
    suggestedTasks: phase.doneConditions,
  }));
}

export function createCockpitSeedFromFirstStartForm(formData: GentleAppStartForm | null): void {
  if (!formData) return;
  const appName = formData.appName.trim();
  const oneLineIdea = formData.oneLineIdea.trim();
  if (!appName || !oneLineIdea) return;

  const existing = loadBlueprintStock().find(
    (bp) =>
      bp.appName.trim() === appName &&
      bp.oneLineIdea.trim() === oneLineIdea &&
      bp.notes?.includes(FIRST_START_SEED_NOTE),
  );
  if (existing) return;

  const bridge = buildGentleFormToBlueprintBridge(formData);
  if (bridge.blockers.length > 0) return;

  const mustHave = splitTextList(formData.mustHave);
  const mustNotDo = splitTextList(formData.mustNotDo);
  const phases = buildBlueprintPhases(formData);

  const blueprint = addBlueprint({
    appName,
    oneLineIdea,
    targetUser: formData.targetUser.trim() || undefined,
    platform: formData.platform,
    mvp: bridge.mvpScope,
    mustHave,
    mustNotDo,
    phases,
    hardStops: DEFAULT_HARD_STOPS,
    notes: [formData.notes.trim(), FIRST_START_SEED_NOTE].filter(Boolean).join('\n'),
  });

  const tasks = createTasksFromBlueprint(blueprint);
  if (tasks.length === 0) return;

  const seedTaskIds = tasks.slice(0, 5).map((task) => task.id);
  createSleepSessionFromQueue(seedTaskIds, `${appName} ${SLEEP_SESSION_TITLE_SUFFIX}`);
}
