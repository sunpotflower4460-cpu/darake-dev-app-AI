import type { DarakeWorkSession } from './darakeWorkSession';
import type { DeepBuildCompletionJudgement, DeepBuildPhase, DeepBuildPlan } from './deepBuildPlan';
import type { RealPrCiStatus } from './prCiStatusClient';

const HUMAN_CHECK_KEYWORDS = [
  'App Store提出',
  '本番公開',
  '課金',
  'Secret変更',
  '法律',
  '規約',
  '大規模リファクタ',
  'mainへの直接反映',
] as const;

function inferHumanCheckRequired(phase: DeepBuildPhase): boolean {
  const text = `${phase.title} ${phase.purpose}`.toLowerCase();
  return HUMAN_CHECK_KEYWORDS.some((keyword) => text.includes(keyword.toLowerCase()));
}

function mapWorkSessionStatusToPhaseStatus(
  phase: DeepBuildPhase,
  session: DarakeWorkSession,
  prStatus: RealPrCiStatus | null,
): DeepBuildPhase['status'] {
  if (session.status === 'phase-complete') return 'done';
  if (session.status === 'review-needed') {
    return prStatus?.ciStatus === 'failed' || prStatus?.mergeReadiness === 'conflict' ? 'needs-fix' : 'reviewing';
  }
  if (session.status === 'preview-ready') return 'reviewing';
  if (session.status === 'ci-checking') return 'checks-running';
  if (session.status === 'pr-detected') return 'pr-open';
  if (session.status === 'agent-working' || session.status === 'agent-instruction-ready' || session.status === 'issue-created') {
    return 'agent-working';
  }
  if (session.status === 'issue-ready' || session.status === 'idea') return 'issue-ready';
  return phase.status;
}

export function syncCurrentDeepBuildPhase(
  plan: DeepBuildPlan,
  session: DarakeWorkSession | null,
  prStatus: RealPrCiStatus | null,
): DeepBuildPlan {
  const phases = plan.phases.map((phase) => ({
    ...phase,
    humanCheckRequired: phase.humanCheckRequired ?? inferHumanCheckRequired(phase),
  }));
  const currentIndex = plan.currentPhaseId
    ? phases.findIndex((phase) => phase.id === plan.currentPhaseId)
    : phases.findIndex((phase) => phase.status !== 'done');

  if (!session || currentIndex < 0) {
    return { ...plan, phases };
  }

  const currentPhase = phases[currentIndex];
  if (!currentPhase) {
    return { ...plan, phases };
  }

  const linkedPrStatus =
    prStatus && session.prNumber && prStatus.prNumber === session.prNumber ? prStatus : null;

  phases[currentIndex] = {
    ...currentPhase,
    issueUrl: session.issueUrl ?? currentPhase.issueUrl ?? null,
    issueNumber: session.issueNumber ?? currentPhase.issueNumber ?? null,
    prUrl: session.prUrl ?? currentPhase.prUrl ?? null,
    prNumber: session.prNumber ?? currentPhase.prNumber ?? null,
    previewUrl: session.previewUrl ?? currentPhase.previewUrl ?? null,
    ciStatus:
      linkedPrStatus?.ciStatus === 'skipped'
        ? 'unknown'
        : linkedPrStatus?.ciStatus ?? currentPhase.ciStatus ?? 'unknown',
    status: mapWorkSessionStatusToPhaseStatus(currentPhase, session, linkedPrStatus),
  };

  return { ...plan, phases };
}

export function markCompletionCandidates(plan: DeepBuildPlan): DeepBuildPlan {
  const phases = plan.phases.map((phase): DeepBuildPhase => {
    const hasIssue = Boolean(phase.issueNumber || phase.issueUrl);
    const hasPr = Boolean(phase.prNumber || phase.prUrl);
    const hasPreview = Boolean(phase.previewUrl);
    const candidate =
      !phase.humanCheckRequired &&
      (
        (phase.ciStatus === 'passed' && hasPreview) ||
        (phase.status === 'issue-ready' && hasIssue) ||
        (phase.status === 'agent-working' && hasIssue) ||
        (phase.status === 'pr-open' && hasPr)
      );
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

export function getDeepBuildNextAction(phase: DeepBuildPhase | undefined): string {
  if (!phase) return '次のPhaseへ';
  if (phase.humanCheckRequired && !phase.humanCheckDone) return '人間確認する';
  if (phase.completionCandidate) return '次のPhaseへ';
  if (phase.status === 'issue-ready') return 'Issueを作る';
  if (phase.status === 'agent-working') return 'AI指示をコピー';
  if (phase.status === 'pr-open') return 'PRを登録する';
  if (phase.status === 'checks-running') return 'CIを確認';
  if (phase.previewUrl) return 'Previewを見る';
  if (phase.status === 'needs-fix' || phase.status === 'fix-requested') return '人間確認する';
  return '次のPhaseへ';
}
