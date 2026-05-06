import type { HumanCheckMinimalCard } from './humanCheckMinimalMode';
import type { HumanCheckMinimalSettings } from './humanCheckMinimalSettings';

export type HumanCheckMinimalCompletionReport = {
  title: string;
  isMinimalModeAvailable: boolean;
  hasOneActionCandidate: boolean;
  okCount: number;
  stopCount: number;
  laterCount: number;
  hiddenDetailsCount: number;
  safetyMode: string;
  nextRecommendations: string[];
};

type DecisionSummary = {
  ok: number;
  stop: number;
  later: number;
};

export function buildHumanCheckMinimalCompletionReport(
  cards: HumanCheckMinimalCard[],
  settings: HumanCheckMinimalSettings,
  decisions: DecisionSummary
): HumanCheckMinimalCompletionReport {
  const readyCards = cards.filter((c) => c.status === 'ready');
  const hiddenDetailsCount = cards.reduce(
    (sum, c) => sum + c.hiddenDetails.length,
    0
  );

  const nextRecommendations: string[] = [];
  if (readyCards.length === 0) {
    nextRecommendations.push('新しい候補を追加してください');
  } else {
    nextRecommendations.push(`${readyCards.length} 件の候補があります`);
  }
  if (decisions.later > 0) {
    nextRecommendations.push(
      `${decisions.later} 件のあとで案件を確認してください`
    );
  }
  if (decisions.stop > 0) {
    nextRecommendations.push(`${decisions.stop} 件が止まっています`);
  }

  return {
    title: 'Human Check Minimal Mode Completion Report',
    isMinimalModeAvailable: settings.defaultMode === 'minimal',
    hasOneActionCandidate: readyCards.length > 0,
    okCount: decisions.ok,
    stopCount: decisions.stop,
    laterCount: decisions.later,
    hiddenDetailsCount,
    safetyMode: settings.fixedSafetyMode,
    nextRecommendations,
  };
}

export function formatHumanCheckMinimalCompletionReportMarkdown(
  report: HumanCheckMinimalCompletionReport
): string {
  const lines = [
    `# ${report.title}`,
    '',
    `- minimal mode: ${report.isMinimalModeAvailable ? '✅ 有効' : '❌ 無効'}`,
    `- 今日の1件: ${report.hasOneActionCandidate ? '✅ あり' : '❌ なし'}`,
    `- OK: ${report.okCount}`,
    `- あとで: ${report.laterCount}`,
    `- 止め: ${report.stopCount}`,
    `- 隠し詳細: ${report.hiddenDetailsCount} 件`,
    `- safety mode: ${report.safetyMode}`,
  ];
  if (report.nextRecommendations.length > 0) {
    lines.push('', '## 次のおすすめ');
    report.nextRecommendations.forEach((r) => lines.push(`- ${r}`));
  }
  return lines.join('\n');
}
