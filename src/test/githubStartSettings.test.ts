import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildEmptyGitHubStartSettings,
  clearGitHubStartSettings,
  loadGitHubStartSettings,
  saveGitHubStartSettings,
} from '../utils/githubStartSettings';

describe('githubStartSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no settings are saved', () => {
    expect(loadGitHubStartSettings()).toBeNull();
  });

  it('returns null when stored json is broken', () => {
    localStorage.setItem('darake.githubStartSettings.v1', '{bad-json');
    expect(loadGitHubStartSettings()).toBeNull();
  });

  it('saves and loads settings while refreshing updatedAt', () => {
    const base = {
      ...buildEmptyGitHubStartSettings(),
      repoUrl: 'https://github.com/example/repo',
      mode: 'cloud-agent' as const,
      updatedAt: '2000-01-01T00:00:00.000Z',
    };

    saveGitHubStartSettings(base);
    const loaded = loadGitHubStartSettings();

    expect(loaded?.repoUrl).toBe('https://github.com/example/repo');
    expect(loaded?.mode).toBe('cloud-agent');
    expect(loaded?.updatedAt).not.toBe(base.updatedAt);
    expect(Number.isNaN(Date.parse(String(loaded?.updatedAt)))).toBe(false);
  });

  it('clears saved settings', () => {
    saveGitHubStartSettings(buildEmptyGitHubStartSettings());
    clearGitHubStartSettings();
    expect(loadGitHubStartSettings()).toBeNull();
  });
});
