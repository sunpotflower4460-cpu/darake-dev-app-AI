import { describe, expect, it } from 'vitest';
import {
  getDeepBuildNextAction,
  getDeepBuildProgress,
  judgeDeepBuildCompletion,
  markCompletionCandidates,
} from '../utils/deepBuildCompletionJudge';
import type { DeepBuildPlan } from '../utils/deepBuildPlan';

function buildPlan(overrides?: Partial<DeepBuildPlan>): DeepBuildPlan {
  return {
    id: 'plan-1',
    appName: 'Demo',
    oneLineIdea: 'idea',
    goal: 'goal',
    overallStatus: 'building',
    phases: [
      {
        id: 'phase-1',
        order: 1,
        kind: 'design',
        title: '設計',
        purpose: 'purpose',
        agentInstruction: 'instruction',
        doneWhen: ['done'],
        status: 'done',
        riskLevel: 'low',
        ciStatus: 'passed',
        previewUrl: 'https://example.com',
        humanCheckDone: false,
      },
    ],
    completionContract: {
      mustPass: [],
      humanReviewRequiredFor: [],
      finalReviewChecklist: [],
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('deepBuildCompletionJudge', () => {
  it('returns complete-candidate when no blocking/missing exists', () => {
    const result = judgeDeepBuildCompletion(buildPlan());
    expect(result.status).toBe('complete-candidate');
    expect(result.missing).toEqual([]);
    expect(result.blocking).toEqual([]);
  });

  it('returns blocked-hard when blocked phases or high risk exists', () => {
    const result = judgeDeepBuildCompletion(
      buildPlan({
        phases: [
          {
            ...buildPlan().phases[0],
            status: 'blocked-hard',
            riskLevel: 'high',
          },
        ],
      }),
    );

    expect(result.status).toBe('blocked-hard');
    expect(result.blocking.join(' ')).toContain('停止フェーズ');
    expect(result.blocking.join(' ')).toContain('高リスク');
  });

  it('returns not-ready when unfinished phases exist without blocking', () => {
    const result = judgeDeepBuildCompletion(
      buildPlan({
        phases: [
          {
            ...buildPlan().phases[0],
            status: 'reviewing',
            riskLevel: 'low',
          },
        ],
        completionContract: {
          mustPass: [],
          humanReviewRequiredFor: [],
          finalReviewChecklist: ['final check'],
        },
      }),
    );

    expect(result.status).toBe('not-ready');
    expect(result.missing.join(' ')).toContain('未完了');
    expect(result.missing.join(' ')).toContain('最終レビュー項目');
  });

  it('marks issue-based completion candidates for design phase', () => {
    const marked = markCompletionCandidates(
      buildPlan({
        phases: [
          {
            ...buildPlan().phases[0],
            kind: 'design',
            status: 'issue-ready',
            issueNumber: 1,
            ciStatus: 'unknown',
            previewUrl: null,
            humanCheckRequired: false,
          },
        ],
      }),
    );

    expect(marked.phases[0]?.completionCandidate).toBe(true);
  });

  it('calculates progress and next action labels', () => {
    const progress = getDeepBuildProgress(
      buildPlan({
        phases: [
          buildPlan().phases[0],
          {
            ...buildPlan().phases[0],
            id: 'phase-2',
            status: 'reviewing',
          },
        ],
      }),
    );

    expect(progress).toEqual({ done: 1, total: 2, percent: 50 });
    expect(getDeepBuildNextAction({ ...buildPlan().phases[0], status: 'issue-ready' })).toBe('Issueを作る');
  });
});
