// Phase 37.4: Completion-first Report

import type { CompletionGoalMap } from './completionGoalMap';
import type { ShortestDarakePath } from './shortestDarakePath';

export type CompletionFirstReport = {
  title: string;
  generatedAt: string;
  completionConditions: string[];
  doneItems: string[];
  autoProgressItems: string[];
  needsHumanItems: string[];
  blockedItems: string[];
  shortestDarakePathSummary: string;
  recommendation: string;
};

export function buildCompletionFirstReport(
  goalMap: CompletionGoalMap,
  darakePath: ShortestDarakePath
): CompletionFirstReport {
  const completionConditions = [
    'App Store提出前確認が完了',
    'UIスクリーンショット撮影が完了',
    'CIが全パス',
    'AI/ヒューマンレビューが完了',
    'リリース前ゲートが通過',
  ];

  const doneItems = goalMap.goals
    .filter((g) => g.status === 'done')
    .map((g) => g.label);

  const autoProgressItems = goalMap.goals
    .filter((g) => g.status === 'auto-progressable')
    .map((g) => `${g.label} → ${g.nextAction}`);

  const needsHumanItems = goalMap.goals
    .filter((g) => g.status === 'needs-human')
    .map((g) => `${g.label} → ${g.nextAction}`);

  const blockedItems = goalMap.goals
    .filter((g) => g.status === 'blocked')
    .map((g) => g.label);

  let recommendation = '自動で進められるものから順に処理します。';
  if (blockedItems.length > 0) {
    recommendation = `ブロック解消が優先です: ${blockedItems.join(', ')}`;
  } else if (needsHumanItems.length > 0) {
    recommendation = `次は人間確認: ${needsHumanItems[0]}`;
  } else if (autoProgressItems.length > 0) {
    recommendation = '全て自動で進められます。';
  }

  return {
    title: '完成ファーストレポート',
    generatedAt: new Date().toISOString(),
    completionConditions,
    doneItems,
    autoProgressItems,
    needsHumanItems,
    blockedItems,
    shortestDarakePathSummary: darakePath.canBeLazySummary,
    recommendation,
  };
}

export function formatCompletionFirstReportMarkdown(report: CompletionFirstReport): string {
  const lines = [
    `# ${report.title}`,
    `生成: ${report.generatedAt}`,
    '',
    `## 完成条件`,
    ...report.completionConditions.map((c) => `- [ ] ${c}`),
    '',
    `## 完了済み (${report.doneItems.length}件)`,
    ...(report.doneItems.length > 0
      ? report.doneItems.map((i) => `- ✅ ${i}`)
      : ['- （まだなし）']),
    '',
    `## 自動進行可能 (${report.autoProgressItems.length}件)`,
    ...(report.autoProgressItems.length > 0
      ? report.autoProgressItems.map((i) => `- 🔄 ${i}`)
      : ['- （なし）']),
    '',
    `## 人間待ち (${report.needsHumanItems.length}件)`,
    ...(report.needsHumanItems.length > 0
      ? report.needsHumanItems.map((i) => `- 👤 ${i}`)
      : ['- （なし）']),
    '',
    `## ブロック (${report.blockedItems.length}件)`,
    ...(report.blockedItems.length > 0
      ? report.blockedItems.map((i) => `- 🚫 ${i}`)
      : ['- （なし）']),
    '',
    `## 最短だらけルート`,
    report.shortestDarakePathSummary,
    '',
    `## 次におすすめ`,
    report.recommendation,
  ];
  return lines.join('\n');
}
