import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearOmakaseStartState,
  loadOmakaseStartState,
  saveOmakaseStartState,
} from '../utils/omakaseStartState';

describe('omakaseStartState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no state exists', () => {
    expect(loadOmakaseStartState()).toBeNull();
  });

  it('saves and loads state with updatedAt', () => {
    saveOmakaseStartState({
      status: 'preparing',
      appName: 'Demo',
      repoUrl: 'https://github.com/example/repo',
      nextActionLabel: 'next',
      userMessage: 'hello',
    });

    const loaded = loadOmakaseStartState();
    expect(loaded?.status).toBe('preparing');
    expect(loaded?.appName).toBe('Demo');
    expect(loaded?.updatedAt).toBeTruthy();
    expect(Number.isNaN(Date.parse(String(loaded?.updatedAt)))).toBe(false);
  });

  it('clears saved state', () => {
    saveOmakaseStartState({
      status: 'failed',
      appName: 'Demo',
      repoUrl: 'https://github.com/example/repo',
      nextActionLabel: 'retry',
      userMessage: 'oops',
    });

    clearOmakaseStartState();
    expect(loadOmakaseStartState()).toBeNull();
  });
});
