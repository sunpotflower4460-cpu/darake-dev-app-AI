import type { RealUseRehearsalResult } from './realUseRehearsalRunner';
import type { RealUseRehearsalScenario } from './realUseRehearsalScenario';
import { runRealUseRehearsal } from './realUseRehearsalRunner';
import { REHEARSAL_SCENARIOS } from './realUseRehearsalScenario';

export type RealUseRehearsalCompletionReport = {
  title: string;
  phase: string;
  scenarioResults: RealUseRehearsalResult[];
  overallDarakeScore: 'high' | 'medium' | 'low';
  frictionRemainingCount: number;
  topPriorityCuts: string[];
  nextRecommendation: string;
  completionMarkdown: string;
};

export function buildRealUseRehearsalCompletionReport(
  scenarios: RealUseRehearsalScenario[] = REHEARSAL_SCENARIOS,
): RealUseRehearsalCompletionReport {
  const scenarioResults = scenarios.map(runRealUseRehearsal);
  const frictionRemainingCount = scenarioResults.reduce(
    (sum, r) => sum + r.unnecessaryFriction.length,
    0,
  );
  const successCount = scenarioResults.filter((r) => r.status === 'darake-success').length;
  const overallDarakeScore: 'high' | 'medium' | 'low' =
    successCount === scenarios.length
      ? 'high'
      : successCount >= Math.ceil(scenarios.length / 2)
        ? 'medium'
        : 'low';

  const allCuts = scenarioResults.flatMap((r) => r.recommendedCuts);
  const uniqueCuts = [...new Set(allCuts)];
  const topPriorityCuts = uniqueCuts.slice(0, 3);

  const nextRecommendation =
    frictionRemainingCount === 0
      ? '通し稽古クリア！ Phase 43 Friction Cut Audit へ進んでください'
      : `手間が ${frictionRemainingCount} 件残っています。削る候補を確認してください`;

  const lines = [
    '# 通し稽古 完成レポート (Phase 42)',
    '',
    `**だらけ成功度**: ${overallDarakeScore === 'high' ? '🟢 高い' : overallDarakeScore === 'medium' ? '🟡 やや不足' : '🔴 低い'}`,
    `**シナリオ数**: ${scenarios.length}件 / 成功: ${successCount}件`,
    `**残り手間**: ${frictionRemainingCount}件`,
    '',
  ];

  scenarioResults.forEach((r) => {
    lines.push(`## ${r.title}`);
    lines.push(`**状態**: ${r.status}`);
    if (r.unnecessaryFriction.length > 0) {
      lines.push('**手間:**');
      r.unnecessaryFriction.forEach((f) => lines.push(`- ${f}`));
    }
    lines.push('');
  });

  if (topPriorityCuts.length > 0) {
    lines.push('## 最優先で削る');
    topPriorityCuts.forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }

  lines.push(`## 次のおすすめ`);
  lines.push(nextRecommendation);

  return {
    title: '通し稽古 完成レポート',
    phase: '42',
    scenarioResults,
    overallDarakeScore,
    frictionRemainingCount,
    topPriorityCuts,
    nextRecommendation,
    completionMarkdown: lines.join('\n'),
  };
}
