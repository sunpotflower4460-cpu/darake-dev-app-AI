import { detectFrictionItems } from './frictionDetector';
import { buildFrictionCutPlan } from './frictionCutPlan';

export type FrictionCutCompletionReport = {
  title: string;
  phase: string;
  cutCount: number;
  remainingCount: number;
  safetyKeptCount: number;
  topRemainingFriction: string[];
  nextCutCandidates: string[];
  darakeImprovementLevel: 'high' | 'medium' | 'low';
  completionMarkdown: string;
};

export function buildFrictionCutCompletionReport(): FrictionCutCompletionReport {
  const frictionItems = detectFrictionItems();
  const plan = buildFrictionCutPlan(frictionItems);

  const cutCount = plan.cuts.filter((c) => c.action !== 'keep-for-safety').length;
  const safetyKeptCount = plan.cuts.filter((c) => c.action === 'keep-for-safety').length;
  const remainingHigh = frictionItems.filter((f) => f.severity === 'high' && !f.mustKeepVisibleForSafety);
  const remainingCount = remainingHigh.length;

  const darakeImprovementLevel: 'high' | 'medium' | 'low' =
    remainingCount === 0
      ? 'high'
      : remainingCount <= 2
        ? 'medium'
        : 'low';

  const topRemainingFriction = remainingHigh.slice(0, 3).map((f) => f.label);
  const nextCutCandidates = plan.cuts
    .filter((c) => c.expectedDarakeGain === 'large' && c.action !== 'keep-for-safety')
    .slice(0, 3)
    .map((c) => c.label);

  const lines = [
    '# Friction Cut 完成レポート (Phase 43)',
    '',
    `**だらけ改善度**: ${darakeImprovementLevel === 'high' ? '🟢 高い' : darakeImprovementLevel === 'medium' ? '🟡 やや不足' : '🔴 低い'}`,
    '',
    `**削った手間**: ${cutCount}件`,
    `**安全上残す**: ${safetyKeptCount}件`,
    `**まだ残る高severity手間**: ${remainingCount}件`,
    '',
  ];

  if (topRemainingFriction.length > 0) {
    lines.push('## まだ残る手間');
    topRemainingFriction.forEach((f) => lines.push(`- ${f}`));
    lines.push('');
  }

  if (nextCutCandidates.length > 0) {
    lines.push('## 次に削る候補');
    nextCutCandidates.forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }

  lines.push('## 安全上残す手間');
  plan.doNotCut.forEach((d) => lines.push(`- ${d}`));

  return {
    title: 'Friction Cut 完成レポート',
    phase: '43',
    cutCount,
    remainingCount,
    safetyKeptCount,
    topRemainingFriction,
    nextCutCandidates,
    darakeImprovementLevel,
    completionMarkdown: lines.join('\n'),
  };
}
