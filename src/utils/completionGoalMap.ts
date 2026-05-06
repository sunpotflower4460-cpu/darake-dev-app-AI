// Phase 37.1: Completion Goal Map

export type CompletionGoalStatus =
  | 'done'
  | 'auto-progressable'
  | 'batched'
  | 'needs-human'
  | 'blocked'
  | 'not-started';

export type CompletionGoal = {
  id: string;
  label: string;
  category:
    | 'planning'
    | 'implementation'
    | 'ci'
    | 'screenshot'
    | 'ui-check'
    | 'ai-review'
    | 'notification'
    | 'app-store'
    | 'release'
    | 'post-release'
    | 'portfolio'
    | 'template'
    | 'safety';
  status: CompletionGoalStatus;
  importance: 'low' | 'medium' | 'high' | 'critical';
  humanEffort:
    | 'none'
    | 'almost-none'
    | 'copy-paste'
    | 'quick-check'
    | 'manual-gate'
    | 'heavy';
  autoCanHandle: boolean;
  reason: string;
  nextAction: string;
};

export type CompletionGoalMap = {
  title: string;
  generatedAt: string;
  goals: CompletionGoal[];
  doneCount: number;
  autoProgressCount: number;
  needsHumanCount: number;
  blockedCount: number;
  notStartedCount: number;
  shortestPathSummary: string;
};

const DEFAULT_GOALS: CompletionGoal[] = [
  {
    id: 'goal-planning',
    label: '計画・設計',
    category: 'planning',
    status: 'auto-progressable',
    importance: 'medium',
    humanEffort: 'none',
    autoCanHandle: true,
    reason: 'Phase設計・Issue下書きは自動生成できる',
    nextAction: 'Cloud Agent指示書を生成する',
  },
  {
    id: 'goal-ci',
    label: 'CI / ビルド確認',
    category: 'ci',
    status: 'auto-progressable',
    importance: 'high',
    humanEffort: 'almost-none',
    autoCanHandle: true,
    reason: 'CIはwatchのみ。人間はblockedになった時だけ確認',
    nextAction: 'CI状態をwatchパネルで確認',
  },
  {
    id: 'goal-screenshot',
    label: 'スクリーンショット撮影',
    category: 'screenshot',
    status: 'needs-human',
    importance: 'high',
    humanEffort: 'quick-check',
    autoCanHandle: false,
    reason: '実際のデバイスまたはPlaywrightが必要',
    nextAction: 'Screenshotsタブでワークフローを確認',
  },
  {
    id: 'goal-ui-check',
    label: 'UI確認',
    category: 'ui-check',
    status: 'needs-human',
    importance: 'medium',
    humanEffort: 'quick-check',
    autoCanHandle: false,
    reason: '人間の目視確認が最低1回必要',
    nextAction: 'UI確認結果を記録する',
  },
  {
    id: 'goal-ai-review',
    label: 'AIレビュー',
    category: 'ai-review',
    status: 'auto-progressable',
    importance: 'medium',
    humanEffort: 'copy-paste',
    autoCanHandle: true,
    reason: 'AIレビュー指示書はローカルで生成できる',
    nextAction: 'AIレビュー指示書をコピーしてAIへ渡す',
  },
  {
    id: 'goal-app-store',
    label: 'App Store提出前確認',
    category: 'app-store',
    status: 'needs-human',
    importance: 'critical',
    humanEffort: 'manual-gate',
    autoCanHandle: false,
    reason: 'App Store提出は必ず人間確認が必要',
    nextAction: 'App Store最終確認を行う',
  },
  {
    id: 'goal-release',
    label: 'リリース',
    category: 'release',
    status: 'not-started',
    importance: 'critical',
    humanEffort: 'manual-gate',
    autoCanHandle: false,
    reason: '本番リリースは人間が必ず確認する',
    nextAction: 'リリース前チェックリストを確認',
  },
];

export function buildCompletionGoalMap(
  partialGoals?: Partial<CompletionGoal>[]
): CompletionGoalMap {
  const goals: CompletionGoal[] = partialGoals
    ? DEFAULT_GOALS.map((g, i) => ({ ...g, ...(partialGoals[i] ?? {}) }))
    : [...DEFAULT_GOALS];

  const doneCount = goals.filter((g) => g.status === 'done').length;
  const autoProgressCount = goals.filter((g) => g.status === 'auto-progressable').length;
  const needsHumanCount = goals.filter((g) => g.status === 'needs-human').length;
  const blockedCount = goals.filter((g) => g.status === 'blocked').length;
  const notStartedCount = goals.filter((g) => g.status === 'not-started').length;

  return {
    title: '完成ゴールマップ',
    generatedAt: new Date().toISOString(),
    goals,
    doneCount,
    autoProgressCount,
    needsHumanCount,
    blockedCount,
    notStartedCount,
    shortestPathSummary: buildShortestPathSummary(goals),
  };
}

function buildShortestPathSummary(goals: CompletionGoal[]): string {
  const humanNeeded = goals.filter(
    (g) => g.status === 'needs-human' && g.importance !== 'low'
  );
  if (humanNeeded.length === 0) return '人間の作業なしで完成できます';
  return `最短: ${humanNeeded.map((g) => g.label).join(' → ')}`;
}

export function rankCompletionGoals(goals: CompletionGoal[]): CompletionGoal[] {
  const importanceOrder: Record<CompletionGoal['importance'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  const statusOrder: Record<CompletionGoalStatus, number> = {
    blocked: 0,
    'needs-human': 1,
    'not-started': 2,
    'auto-progressable': 3,
    batched: 4,
    done: 5,
  };
  return [...goals].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });
}

export function findShortestDarakePath(goals: CompletionGoal[]): CompletionGoal[] {
  return goals.filter(
    (g) =>
      g.status !== 'done' &&
      g.status !== 'batched' &&
      (g.importance === 'critical' || g.importance === 'high')
  );
}

export function summarizeCompletionGoalMap(map: CompletionGoalMap): string {
  return [
    `完成: ${map.doneCount}件`,
    `自動で進められる: ${map.autoProgressCount}件`,
    `人間が必要: ${map.needsHumanCount}件`,
    `ブロック: ${map.blockedCount}件`,
    `未着手: ${map.notStartedCount}件`,
    map.shortestPathSummary,
  ].join(' | ');
}

export function formatCompletionGoalMapMarkdown(map: CompletionGoalMap): string {
  const lines = [
    `# ${map.title}`,
    `生成: ${map.generatedAt}`,
    '',
    `## サマリー`,
    `- 完了: ${map.doneCount}件`,
    `- 自動進行可能: ${map.autoProgressCount}件`,
    `- 人間が必要: ${map.needsHumanCount}件`,
    `- ブロック: ${map.blockedCount}件`,
    `- 未着手: ${map.notStartedCount}件`,
    '',
    `## 最短だらけルート`,
    map.shortestPathSummary,
    '',
    `## ゴール一覧`,
  ];
  for (const g of map.goals) {
    lines.push(`- [${g.status}] **${g.label}** (${g.importance}) → ${g.nextAction}`);
  }
  return lines.join('\n');
}
