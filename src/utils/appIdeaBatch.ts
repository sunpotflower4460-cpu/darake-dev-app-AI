export type AppIdea = {
  id: string;
  title: string;
  seed: string;
  targetUser: string;
  platform: string[];
  monetizationHint: string;
  complexity: 'small' | 'medium' | 'large';
  dreamScore: number;
  easeScore: number;
  revenuePotentialScore: number;
  uniquenessScore: number;
  priorityScore: number;
  notes: string;
};

const STORAGE_KEY = 'darake.appIdeaBatch.v1';

export function buildInitialAppIdea(): AppIdea {
  return {
    id: `idea-${Date.now()}`,
    title: '',
    seed: '',
    targetUser: '',
    platform: ['ios'],
    monetizationHint: '',
    complexity: 'small',
    dreamScore: 3,
    easeScore: 3,
    revenuePotentialScore: 3,
    uniquenessScore: 3,
    priorityScore: 0,
    notes: '',
  };
}

export function calculatePriorityScore(idea: Omit<AppIdea, 'priorityScore'>): number {
  // Weighted: ease first, then revenue, dream, uniqueness
  const weighted =
    idea.easeScore * 0.35 +
    idea.revenuePotentialScore * 0.3 +
    idea.dreamScore * 0.2 +
    idea.uniquenessScore * 0.15;
  // Penalize for complexity
  const complexityPenalty = idea.complexity === 'large' ? 0.8 : idea.complexity === 'medium' ? 0.9 : 1.0;
  return Math.round(weighted * complexityPenalty * 20) / 10;
}

export function loadAppIdeaBatch(): AppIdea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppIdea[];
  } catch {
    return [];
  }
}

export function saveAppIdeaBatch(ideas: AppIdea[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  } catch {
    // ignore
  }
}

export function addAppIdea(ideas: AppIdea[], idea: AppIdea): AppIdea[] {
  return [...ideas, idea];
}

export function updateAppIdea(ideas: AppIdea[], updated: AppIdea): AppIdea[] {
  return ideas.map((i) => (i.id === updated.id ? updated : i));
}

export function deleteAppIdea(ideas: AppIdea[], id: string): AppIdea[] {
  return ideas.filter((i) => i.id !== id);
}

export function sortByPriority(ideas: AppIdea[]): AppIdea[] {
  return [...ideas].sort((a, b) => b.priorityScore - a.priorityScore);
}

export function formatAppIdeaMarkdown(idea: AppIdea): string {
  return [
    `# アプリ案: ${idea.title || '（未設定）'}`,
    `- 種: ${idea.seed || '未設定'}`,
    `- ターゲットユーザー: ${idea.targetUser || '未設定'}`,
    `- プラットフォーム: ${idea.platform.join(', ')}`,
    `- 収益ヒント: ${idea.monetizationHint || '未設定'}`,
    `- 複雑度: ${idea.complexity}`,
    `- スコア: 夢=${idea.dreamScore} 容易さ=${idea.easeScore} 収益=${idea.revenuePotentialScore} 独自性=${idea.uniquenessScore}`,
    `- 優先度スコア: ${idea.priorityScore}`,
    `- ノート: ${idea.notes || '未設定'}`,
  ].join('\n');
}

export function formatAppIdeaBatchMarkdown(ideas: AppIdea[]): string {
  const sorted = sortByPriority(ideas);
  return [
    `# アプリ案バッチ (${ideas.length}件)`,
    '',
    ...sorted.map((idea, i) => `## ${i + 1}位 (優先度${idea.priorityScore})\n${formatAppIdeaMarkdown(idea)}`),
  ].join('\n\n');
}
