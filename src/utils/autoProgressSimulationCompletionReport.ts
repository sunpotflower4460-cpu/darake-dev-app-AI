import type { AutoProgressSimulation } from './autoProgressSimulation';
import type { PredictedStopPoint } from './stopPointPredictor';
import type { CompletionReportForecast } from './completionReportForecast';

export type AutoProgressSimulationCompletionReport = {
  title: string;
  isSimulationAvailable: boolean;
  stopPoints: PredictedStopPoint[];
  forecast: CompletionReportForecast | null;
  preRunChecklist: string[];
  nextRecommendations: string[];
};

export function buildAutoProgressSimulationCompletionReport(
  simulation: AutoProgressSimulation | null,
  stopPoints: PredictedStopPoint[],
  forecast: CompletionReportForecast | null
): AutoProgressSimulationCompletionReport {
  const preRunChecklist: string[] = [
    'secret / token が不要なことを確認しましたか？',
    'GitHub操作なしで進むことを確認しましたか？',
    'AI API を呼ばないことを確認しましたか？',
    'コピー手順のみで進むことを確認しましたか？',
  ];

  const highStops = stopPoints.filter((s) => s.severity === 'high');

  const nextRecommendations: string[] = [];
  if (!simulation) {
    nextRecommendations.push('まずシミュレーションを作成してください');
  }
  if (highStops.length > 0) {
    nextRecommendations.push(
      `${highStops.length} 件の高リスク止まり場所があります`
    );
  }
  if (forecast?.status === 'likely-success') {
    nextRecommendations.push('成功見込みです。OK を押して進めてください');
  } else if (forecast?.status === 'likely-needs-review') {
    nextRecommendations.push('人間確認が必要な部分があります');
  }

  return {
    title: 'Auto Progress Simulation Completion Report',
    isSimulationAvailable: simulation !== null,
    stopPoints,
    forecast,
    preRunChecklist,
    nextRecommendations,
  };
}

export function formatAutoProgressSimulationCompletionReportMarkdown(
  report: AutoProgressSimulationCompletionReport
): string {
  const lines = [
    `# ${report.title}`,
    '',
    `- シミュレーション: ${report.isSimulationAvailable ? '✅ 作成済み' : '❌ 未作成'}`,
    `- stop points: ${report.stopPoints.length} 件`,
  ];
  if (report.preRunChecklist.length > 0) {
    lines.push('', '## OK前確認チェックリスト');
    report.preRunChecklist.forEach((c) => lines.push(`- [ ] ${c}`));
  }
  if (report.nextRecommendations.length > 0) {
    lines.push('', '## 次のおすすめ');
    report.nextRecommendations.forEach((r) => lines.push(`- ${r}`));
  }
  return lines.join('\n');
}
