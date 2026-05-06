import { AppIdea, sortByPriority } from './appIdeaBatch';

export type AppFactoryRoadmap = {
  title: string;
  strategy: 'quick-wins' | 'dream-core-first' | 'revenue-first' | 'balanced';
  waves: Array<{
    label: string;
    apps: string[];
    reason: string;
    expectedOutcome: string;
  }>;
  risks: string[];
  nextActions: string[];
};

const STORAGE_KEY = 'darake.appFactoryRoadmap.v1';

export function buildAppFactoryRoadmap(
  ideas: AppIdea[],
  strategy: AppFactoryRoadmap['strategy'],
): AppFactoryRoadmap {
  const sorted = sortByPriority(ideas);

  let waveGroups: AppIdea[][] = [];

  switch (strategy) {
    case 'quick-wins':
      // Easiest first
      waveGroups = chunkByCondition(sorted, (i) => i.complexity === 'small' || i.easeScore >= 4);
      break;
    case 'dream-core-first':
      // Highest dream score first
      waveGroups = chunkByCondition(
        [...ideas].sort((a, b) => b.dreamScore - a.dreamScore),
        (i) => i.dreamScore >= 4,
      );
      break;
    case 'revenue-first':
      // Highest revenue potential first
      waveGroups = chunkByCondition(
        [...ideas].sort((a, b) => b.revenuePotentialScore - a.revenuePotentialScore),
        (i) => i.revenuePotentialScore >= 4,
      );
      break;
    case 'balanced':
    default:
      // Priority score order
      waveGroups = [sorted.slice(0, 3), sorted.slice(3, 6), sorted.slice(6)].filter((g) => g.length > 0);
      break;
  }

  const strategyLabels: Record<AppFactoryRoadmap['strategy'], string> = {
    'quick-wins': 'クイックウィン優先',
    'dream-core-first': '夢コア優先',
    'revenue-first': '収益優先',
    balanced: 'バランス',
  };

  const waves = waveGroups.map((group, i) => ({
    label: `Wave ${i + 1}`,
    apps: group.map((a) => a.title || `（未設定 #${a.id}）`),
    reason: i === 0 ? `最初の波 (${strategyLabels[strategy]})` : `Wave ${i + 1} — 前のWaveを踏まえて`,
    expectedOutcome: i === 0 ? 'MVP検証・初期ユーザー獲得' : '機能拡張・収益化検証',
  }));

  const risks = [
    'スコープクリープ（範囲が広がりすぎる）',
    '複数アプリを同時並行で進めすぎる',
    '各アプリのフェーズが混在して管理が複雑になる',
    ideas.some((i) => i.complexity === 'large') ? '複雑度 large のアプリは時間がかかる' : '',
  ].filter(Boolean);

  const nextActions = [
    'Wave 1 のアプリを Blueprint へ変換する',
    '各アプリのリポジトリを作成する',
    'Cloud Agent 初回指示書を生成する',
    '週次でロードマップを見直す',
  ];

  return {
    title: `アプリ工房ロードマップ (${strategyLabels[strategy]})`,
    strategy,
    waves,
    risks,
    nextActions,
  };
}

export function loadSavedAppFactoryRoadmap(): AppFactoryRoadmap | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppFactoryRoadmap;
  } catch {
    return null;
  }
}

export function saveAppFactoryRoadmap(roadmap: AppFactoryRoadmap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap));
  } catch {
    // ignore
  }
}

export function formatAppFactoryRoadmapMarkdown(roadmap: AppFactoryRoadmap): string {
  return [
    `# ${roadmap.title}`,
    `- 戦略: ${roadmap.strategy}`,
    '',
    '## Waves',
    ...roadmap.waves.flatMap((w) => [
      `### ${w.label}`,
      `- アプリ: ${w.apps.join(', ') || '（なし）'}`,
      `- 理由: ${w.reason}`,
      `- 期待成果: ${w.expectedOutcome}`,
      '',
    ]),
    '## リスク',
    ...roadmap.risks.map((r) => `- ⚠️ ${r}`),
    '',
    '## 次のアクション',
    ...roadmap.nextActions.map((a) => `- [ ] ${a}`),
  ].join('\n');
}

function chunkByCondition(ideas: AppIdea[], primaryCondition: (i: AppIdea) => boolean): AppIdea[][] {
  const primary = ideas.filter(primaryCondition);
  const rest = ideas.filter((i) => !primaryCondition(i));
  const result: AppIdea[][] = [];
  if (primary.length > 0) result.push(primary);
  if (rest.length > 0) result.push(rest);
  return result;
}
