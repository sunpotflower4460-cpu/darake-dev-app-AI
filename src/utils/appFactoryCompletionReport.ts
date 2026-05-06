import { loadAppIdeaBatch, sortByPriority } from './appIdeaBatch';

export type AppFactoryCompletionReport = {
  totalIdeas: number;
  topPriorityApps: string[];
  quickBuildApps: string[];
  dreamCoreApps: string[];
  revenueApps: string[];
  nextGitHubApp: string;
  thisMonthRoadmap: string[];
  nextRecommendations: string[];
};

export function buildAppFactoryCompletionReport(): AppFactoryCompletionReport {
  const ideas = loadAppIdeaBatch();
  const sorted = sortByPriority(ideas);

  const topPriorityApps = sorted.slice(0, 3).map((i) => i.title || `（未設定 #${i.id}）`);
  const quickBuildApps = ideas
    .filter((i) => i.complexity === 'small' && i.easeScore >= 4)
    .map((i) => i.title || `（未設定）`)
    .slice(0, 3);
  const dreamCoreApps = ideas
    .filter((i) => i.dreamScore >= 4)
    .map((i) => i.title || `（未設定）`)
    .slice(0, 3);
  const revenueApps = ideas
    .filter((i) => i.revenuePotentialScore >= 4)
    .map((i) => i.title || `（未設定）`)
    .slice(0, 3);

  const nextGitHubApp =
    sorted[0]?.title || quickBuildApps[0] || '（アプリ案を登録してください）';

  const thisMonthRoadmap =
    sorted.slice(0, 2).length > 0
      ? [
          `1. ${sorted[0]?.title ?? 'アプリ1'} のBlueprint作成・リポジトリ作成`,
          sorted[1] ? `2. ${sorted[1].title} の計画作成` : '2. 次のアプリ案を追加する',
          '3. Wave 1 のアプリを Cloud Agent に渡す',
        ]
      : ['1. アプリ案を登録する', '2. スコアを入力して優先順位を決める', '3. Blueprint を生成する'];

  const nextRecommendations: string[] = [];
  if (ideas.length === 0) {
    nextRecommendations.push('アプリ案を登録する（目標: 5件以上）');
  } else {
    nextRecommendations.push('優先度1位のアプリをBlueprintへ変換する');
    nextRecommendations.push('App Factory Roadmap で制作順序を確定する');
    nextRecommendations.push('Wave 1 のアプリのGitHubリポジトリを作成する');
  }

  return {
    totalIdeas: ideas.length,
    topPriorityApps,
    quickBuildApps,
    dreamCoreApps,
    revenueApps,
    nextGitHubApp,
    thisMonthRoadmap,
    nextRecommendations,
  };
}

export function formatAppFactoryCompletionReportMarkdown(report: AppFactoryCompletionReport): string {
  return [
    '# アプリ工房 完成レポート',
    '',
    `- 登録アプリ案数: ${report.totalIdeas}件`,
    '',
    '## 優先度上位',
    report.topPriorityApps.length > 0
      ? report.topPriorityApps.map((a, i) => `${i + 1}. ${a}`).join('\n')
      : '- アプリ案なし',
    '',
    '## すぐ作れる案（小規模・容易）',
    report.quickBuildApps.length > 0 ? report.quickBuildApps.map((a) => `- ${a}`).join('\n') : '- なし',
    '',
    '## 夢コア案（dreamScore高）',
    report.dreamCoreApps.length > 0 ? report.dreamCoreApps.map((a) => `- ${a}`).join('\n') : '- なし',
    '',
    '## 収益候補（revenuePotential高）',
    report.revenueApps.length > 0 ? report.revenueApps.map((a) => `- ${a}`).join('\n') : '- なし',
    '',
    `## 次にGitHub化する案`,
    report.nextGitHubApp,
    '',
    '## 今月の制作ロードマップ',
    ...report.thisMonthRoadmap.map((r) => `- ${r}`),
    '',
    '## 次のおすすめ',
    ...report.nextRecommendations.map((r) => `- ${r}`),
  ].join('\n');
}
