import { describe, expect, it } from 'vitest';
import { getGitHubWriteGatePolicy } from '../utils/writeGatePolicy';

describe('writeGatePolicy', () => {
  it('marks issue create as low risk with preview and confirmation', () => {
    const policy = getGitHubWriteGatePolicy('issue-create');
    expect(policy.risk).toBe('low');
    expect(policy.requiresPreview).toBe(true);
    expect(policy.requiresExplicitConfirmation).toBe(true);
    expect(policy.blockedForNow).toBe(false);
  });

  it('marks pr create as high risk', () => {
    expect(getGitHubWriteGatePolicy('pr-create').risk).toBe('high');
  });

  it('marks merge as blocked-for-now', () => {
    const policy = getGitHubWriteGatePolicy('merge');
    expect(policy.risk).toBe('blocked-for-now');
    expect(policy.blockedForNow).toBe(true);
  });
});
