import { describe, expect, it } from 'vitest';
import { buildDeepBuildAiPrompt } from '../utils/deepBuildAiPrompt';
import type { DeepBuildCompletionJudgement, DeepBuildPlan } from '../utils/deepBuildPlan';

function buildPlan(overrides?: Partial<DeepBuildPlan>): DeepBuildPlan {
  return {
    id: 'test-plan',
    appName: 'テストアプリ',
    oneLineIdea: 'テスト用のアプリです',
    goal: '最小限の完成を目指す',
    overallStatus: 'building',
    phases: [
      {
        id: 'phase-1',
        order: 1,
        kind: 'design',
        title: '設計フェーズ',
        purpose: '設計を固める',
        agentInstruction: 'Issueを作る',
        doneWhen: ['設計書ができている'],
        status: 'done',
      },
      {
        id: 'phase-2',
        order: 2,
        kind: 'core-implementation',
        title: '実装フェーズ',
        purpose: 'コアを実装する',
        agentInstruction: 'コードを書く',
        doneWhen: ['ビルドが通る'],
        status: 'agent-working',
      },
    ],
    completionContract: {
      mustPass: ['build-passed'],
      humanReviewRequiredFor: [],
      finalReviewChecklist: [],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function buildJudgement(
  status: DeepBuildCompletionJudgement['status'],
): DeepBuildCompletionJudgement {
  switch (status) {
    case 'complete-candidate':
      return {
        status: 'complete-candidate',
        title: 'かなり完成に近いです',
        message: '最終確認だけできる状態です。',
        missing: [],
        blocking: [],
      };
    case 'not-ready':
      return {
        status: 'not-ready',
        title: 'まだ育成中です',
        message: 'AIが進められる範囲をもう少し進めます。',
        missing: ['1フェーズが未完了です'],
        blocking: [],
      };
    case 'blocked-hard':
      return {
        status: 'blocked-hard',
        title: 'ここは止めます',
        message: '課金・権限・secret・本番操作など、AIが勝手に進めない可能性があります。',
        missing: [],
        blocking: ['1件の停止フェーズがあります'],
      };
  }
}

describe('deepBuildAiPrompt', () => {
  it('always includes mandatory safety instructions', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('complete-candidate'),
    });
    expect(result.prompt).toContain('このアプリから外部AI APIへ送信はしません');
    expect(result.prompt).toContain('API key / token / secret は貼らないでください');
    expect(result.prompt).toContain('private情報や個人情報は貼る前に人間が確認');
    expect(result.prompt).toContain('AIの回答は自動採用せず、人間が確認');
  });

  it('includes plan summary information', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('not-ready'),
    });
    expect(result.prompt).toContain('テストアプリ');
    expect(result.prompt).toContain('最小限の完成を目指す');
  });

  it('sets purpose for complete-candidate judgement', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('complete-candidate'),
    });
    expect(result.purpose).toContain('最終確認');
    expect(result.prompt).toContain('完成候補の最終確認');
  });

  it('sets purpose for not-ready judgement', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('not-ready'),
    });
    expect(result.purpose).toContain('育成中');
    expect(result.prompt).toContain('次に育てるべきポイント');
  });

  it('sets purpose for blocked-hard judgement', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('blocked-hard'),
    });
    expect(result.purpose).toContain('停止/保留');
    expect(result.prompt).toContain('止める理由と再開条件');
  });

  it('includes blocking items when blocked-hard', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('blocked-hard'),
    });
    expect(result.prompt).toContain('1件の停止フェーズがあります');
  });

  it('includes missing items when not-ready', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('not-ready'),
    });
    expect(result.prompt).toContain('1フェーズが未完了です');
  });

  it('includes human gate instructions', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('complete-candidate'),
    });
    expect(result.prompt).toContain('人間が最終判断します');
    expect(result.prompt).toContain('Human Gate');
  });

  it('includes not-doing-now list', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('not-ready'),
    });
    expect(result.prompt).toContain('まだやらないこと');
    expect(result.prompt).toContain('AI回答の自動反映');
  });

  it('title includes judgement title', () => {
    const result = buildDeepBuildAiPrompt({
      plan: buildPlan(),
      judgement: buildJudgement('complete-candidate'),
    });
    expect(result.title).toContain('かなり完成に近いです');
  });
});
