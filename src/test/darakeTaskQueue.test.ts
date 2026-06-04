import { beforeEach, describe, expect, it } from 'vitest';
import {
  addDarakeTask,
  getNextRunnableTask,
  loadDarakeTaskQueue,
  moveTaskToAskLater,
  saveDarakeTaskQueue,
} from '../utils/darakeTaskQueue';

describe('darakeTaskQueue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty list when no queue is saved', () => {
    expect(loadDarakeTaskQueue()).toEqual([]);
  });

  it('returns empty list when stored json is broken', () => {
    localStorage.setItem('darake.taskQueue.v1', '{bad-json');
    expect(loadDarakeTaskQueue()).toEqual([]);
  });

  it('adds a task with generated id and timestamps', () => {
    const added = addDarakeTask({
      title: 'Issue作成',
      kind: 'issue-create',
      status: 'queued',
      priority: 10,
      appName: 'Demo',
    });

    expect(added.id.startsWith('task-')).toBe(true);
    expect(added.createdAt).toBeTruthy();
    expect(added.updatedAt).toBeTruthy();
    expect(loadDarakeTaskQueue()).toHaveLength(1);
  });

  it('selects next runnable task by dependency and priority', () => {
    saveDarakeTaskQueue([
      {
        id: 'done-1',
        title: 'done',
        kind: 'blueprint',
        status: 'done',
        priority: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'blocked-by-dep',
        title: 'blocked',
        kind: 'agent-run',
        status: 'queued',
        priority: 100,
        dependsOn: ['missing-id'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'runnable-low',
        title: 'runnable low',
        kind: 'issue-create',
        status: 'queued',
        priority: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'runnable-high',
        title: 'runnable high',
        kind: 'pr-watch',
        status: 'queued',
        priority: 20,
        dependsOn: ['done-1'],
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
    ]);

    const next = getNextRunnableTask(loadDarakeTaskQueue());
    expect(next?.id).toBe('runnable-high');
  });

  it('moves task to ask-later with reason', () => {
    saveDarakeTaskQueue([
      {
        id: 'task-1',
        title: 'task',
        kind: 'issue-create',
        status: 'queued',
        priority: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]);

    const updated = moveTaskToAskLater('task-1', 'need human input');
    expect(updated[0]?.status).toBe('ask-later');
    expect(updated[0]?.laterReviewReason).toBe('need human input');
  });
});
