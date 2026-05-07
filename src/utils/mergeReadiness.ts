export type MergeReadiness =
  | 'not-ready'
  | 'ready-low-risk'
  | 'ready-needs-human-review'
  | 'blocked';

export type MergeReadinessSummary = {
  readiness: MergeReadiness;
  title: string;
  userMessage: string;
  reasons: string[];
  risks: string[];
  prUrl?: string;
};

export type MergeReadinessInput = {
  ciPassed: boolean;
  buildPassed: boolean;
  typecheckPassed: boolean;
  noRiskyChanges: boolean;
  noSecretChanges: boolean;
  prUrl?: string;
};

export function buildMergeReadinessSummary(input: MergeReadinessInput): MergeReadinessSummary {
  const reasons: string[] = [];
  const risks: string[] = [];

  if (input.ciPassed) reasons.push('✅ Build成功');
  else risks.push('❌ Buildが通っていません');

  if (input.typecheckPassed) reasons.push('✅ Typecheck成功');
  else risks.push('❌ Typecheckが通っていません');

  if (input.noRiskyChanges) reasons.push('✅ 危険な変更なし');
  else risks.push('⚠️ 確認が必要な変更があります');

  if (input.noSecretChanges) reasons.push('✅ secret変更なし');
  else risks.push('❌ secretまたはtokenの変更があります');

  const isBlocked = risks.some((r) => r.startsWith('❌'));
  const needsReview = risks.some((r) => r.startsWith('⚠️'));

  if (isBlocked) {
    return {
      readiness: 'blocked',
      title: 'マージできません',
      userMessage: '修正が必要な問題があります。',
      reasons,
      risks,
      prUrl: input.prUrl,
    };
  }

  if (needsReview) {
    return {
      readiness: 'ready-needs-human-review',
      title: 'マージ前に確認してください',
      userMessage: '技術的な問題はありませんが、確認が必要な変更があります。',
      reasons,
      risks,
      prUrl: input.prUrl,
    };
  }

  return {
    readiness: 'ready-low-risk',
    title: 'マージ候補です',
    userMessage: 'PRを開いてマージできます。',
    reasons,
    risks,
    prUrl: input.prUrl,
  };
}

export function buildMergeReadinessSummaryFromPrHealth(prUrl?: string): MergeReadinessSummary {
  // Used when PR health is checks-passed/ready-to-merge but we don't have detailed info
  return buildMergeReadinessSummary({
    ciPassed: true,
    buildPassed: true,
    typecheckPassed: true,
    noRiskyChanges: true,
    noSecretChanges: true,
    prUrl,
  });
}
