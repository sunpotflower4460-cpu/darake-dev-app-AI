import type { DeepBuildCompletionJudgement, DeepBuildPhase, DeepBuildPlan } from './deepBuildPlan';

export function markCompletionCandidates(plan: DeepBuildPlan): DeepBuildPlan {
  const phases = plan.phases.map((phase): DeepBuildPhase => {
    const candidate = Boolean(phase.prUrl && (phase.ciStatus === 'passed' || phase.prUrl));
    return { ...phase, completionCandidate: candidate && !phase.humanCheckDone };
  });
  return { ...plan, phases };
}

export function judgeDeepBuildCompletion(plan: DeepBuildPlan): DeepBuildCompletionJudgement {
  const blocking: string[] = [];
  const missing: string[] = [];

  const blockedPhases = plan.phases.filter((phase) => phase.status === 'blocked-hard');
  const unfinishedPhases = plan.phases.filter((phase) => phase.status !== 'done');
  const riskyPhases = plan.phases.filter(
    (phase) => phase.riskLevel === 'high' || phase.riskLevel === 'unknown',
  );

  if (blockedPhases.length > 0) {
    blocking.push(`${blockedPhases.length}件の停止フェーズがあります`);
  }

  if (riskyPhases.length > 0) {
    blocking.push(`${riskyPhases.length}件の高リスク/不明リスクがあります`);
  }

  if (unfinishedPhases.length > 0) {
    missing.push(`${unfinishedPhases.length}フェーズが未完了です`);
  }

  if (plan.completionContract.finalReviewChecklist.length > 0) {
    missing.push('最終レビュー項目が残っています');
  }

  if (blocking.length > 0) {
    return {
      status: 'blocked-hard',
      title: 'ここは止めます',
      message: '課金・権限・secret・本番操作など、AIが勝手に進めない可能性があります。',
      missing,
      blocking,
    };
  }

  if (missing.length === 0) {
    return {
      status: 'complete-candidate',
      title: 'かなり完成に近いです',
      message: '最終確認だけできる状態です。完全完成とは断定せず、提出や本番公開は人間確認に戻します。',
      missing: [],
      blocking: [],
    };
  }

  return {
    status: 'not-ready',
    title: 'まだ育成中です',
    message: 'AIが進められる範囲をもう少し進めます。必要な時だけ知らせます。',
    missing,
    blocking: [],
  };
}

export function getDeepBuildProgress(plan: DeepBuildPlan): {
  done: number;
  total: number;
  percent: number;
} {
  const total = plan.phases.length;
  const done = plan.phases.filter((phase) => phase.status === 'done').length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}
