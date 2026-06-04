import { describe, expect, it } from 'vitest';
import { formatGitHubWriteRiskLabel, getGitHubWriteGatePolicy } from '../utils/writeGatePolicy';

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

  it('does not require explicit confirmation for comment draft generation', () => {
    const policy = getGitHubWriteGatePolicy('issue-comment-draft');
    expect(policy.requiresExplicitConfirmation).toBe(false);
  });

  it('formats risk labels for Japanese UI', () => {
    expect(formatGitHubWriteRiskLabel('high')).toContain('高リスク');
  });
});
