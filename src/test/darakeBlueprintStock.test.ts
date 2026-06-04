import { beforeEach, describe, expect, it } from 'vitest';
import {
  addBlueprint,
  createTasksFromBlueprint,
  loadBlueprintStock,
  updateBlueprint,
} from '../utils/darakeBlueprintStock';
import { loadDarakeTaskQueue } from '../utils/darakeTaskQueue';

const blueprintInput = {
  appName: 'Demo App',
  oneLineIdea: 'one line idea',
  targetUser: 'everyone',
  platform: 'web',
  repoUrl: 'https://github.com/example/repo',
  mvp: ['mvp-1'],
  mustHave: ['must-1'],
  mustNotDo: ['must-not-1'],
  phases: [
    {
      id: 'phase-1',
      title: 'Phase 1',
      goal: 'Goal',
      doneDefinition: 'Done',
      suggestedTasks: ['task'],
    },
  ],
  hardStops: ['none'],
  notes: 'memo',
};

describe('darakeBlueprintStock', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty list when nothing is saved', () => {
    expect(loadBlueprintStock()).toEqual([]);
  });

  it('adds blueprint with generated id and timestamps', () => {
    const added = addBlueprint(blueprintInput);
    expect(added.id.startsWith('bp-')).toBe(true);
    expect(added.createdAt).toBeTruthy();
    expect(added.updatedAt).toBeTruthy();

    const loaded = loadBlueprintStock();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.appName).toBe('Demo App');
  });

  it('updates existing blueprint fields', () => {
    const added = addBlueprint(blueprintInput);
    const updated = updateBlueprint(added.id, { appName: 'Renamed App' });

    expect(updated[0]?.appName).toBe('Renamed App');
    expect(Number.isNaN(Date.parse(String(updated[0]?.updatedAt)))).toBe(false);
  });

  it('creates queue tasks from blueprint phases', () => {
    const added = addBlueprint(blueprintInput);
    const tasks = createTasksFromBlueprint(added);

    expect(tasks).toHaveLength(5);
    expect(tasks[0]?.kind).toBe('blueprint');
    expect(tasks[1]?.dependsOn).toContain(tasks[0]?.id);
    expect(loadDarakeTaskQueue()).toHaveLength(5);
  });
});
