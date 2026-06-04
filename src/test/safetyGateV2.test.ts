import { describe, expect, it } from 'vitest';
import { SAFETY_GATE_V2_TEST_CASES, checkActionSafety } from '../utils/safetyGateV2';

describe('safetyGateV2', () => {
  it.each(SAFETY_GATE_V2_TEST_CASES)('matches smoke case: %s', ({ input, expected }) => {
    const decision = checkActionSafety(input).decision;
    const expectedList = Array.isArray(expected) ? expected : [expected];
    expect(expectedList).toContain(decision);
  });

  it('returns ask for merge action', () => {
    expect(checkActionSafety('PRをマージして').decision).toBe('ask');
  });

  it('returns allow for docs update action', () => {
    expect(checkActionSafety('READMEを更新して').decision).toBe('allow');
  });

  it('returns unknown when no rule matches', () => {
    const result = checkActionSafety('ランダムな文章です');
    expect(result.decision).toBe('unknown');
    expect(result.matchedRule).toBeNull();
  });
});
