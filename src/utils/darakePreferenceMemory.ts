// Phase 36.1: Darake Preference Memory

export type DarakePreferenceSignalType =
  | 'later'
  | 'stop'
  | 'ignored'
  | 'reviewed'
  | 'resolved'
  | 'copied'
  | 'opened-details'
  | 'collapsed-details'
  | 'snoozed'
  | 'auto-batched';

export type DarakePreferenceSignal = {
  id: string;
  targetId: string;
  targetType:
    | 'panel'
    | 'phase'
    | 'notification'
    | 'manual-gate'
    | 'warning'
    | 'report'
    | 'cloud-agent-job'
    | 'github-dry-run'
    | 'ai-review'
    | 'app-store'
    | 'portfolio'
    | 'template';
  signalType: DarakePreferenceSignalType;
  weight: number;
  createdAt: string;
  notes: string;
};

export type DarakePreferenceProfile = {
  title: string;
  updatedAt: string;
  oftenIgnoredTypes: string[];
  oftenLaterTypes: string[];
  oftenStoppedTypes: string[];
  safeToHideTypes: string[];
  shouldSurfaceTypes: string[];
  preferredDashboardMode:
    | 'maximum-darake'
    | 'completion-first'
    | 'review-inbox-only'
    | 'one-screen';
  notes: string;
};

const STORAGE_KEY = 'darake.preferenceSignals.v1';

export function loadDarakePreferenceSignals(): DarakePreferenceSignal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DarakePreferenceSignal[];
  } catch {
    return [];
  }
}

export function saveDarakePreferenceSignals(signals: DarakePreferenceSignal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
  } catch {
    // ignore
  }
}

export function addDarakePreferenceSignal(
  signals: DarakePreferenceSignal[],
  signal: Omit<DarakePreferenceSignal, 'id' | 'createdAt'>
): DarakePreferenceSignal[] {
  const newSignal: DarakePreferenceSignal = {
    ...signal,
    id: `pref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  return [...signals, newSignal];
}

type TypeCount = Record<string, number>;

function countByTargetType(
  signals: DarakePreferenceSignal[],
  signalType: DarakePreferenceSignalType
): TypeCount {
  const counts: TypeCount = {};
  for (const s of signals) {
    if (s.signalType === signalType) {
      counts[s.targetType] = (counts[s.targetType] ?? 0) + s.weight;
    }
  }
  return counts;
}

function topTypes(counts: TypeCount, threshold = 1): string[] {
  return Object.entries(counts)
    .filter(([, v]) => v >= threshold)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k);
}

export function buildDarakePreferenceProfile(
  signals: DarakePreferenceSignal[]
): DarakePreferenceProfile {
  const ignoredCounts = countByTargetType(signals, 'ignored');
  const laterCounts = countByTargetType(signals, 'later');
  const stopCounts = countByTargetType(signals, 'stop');
  const snoozedCounts = countByTargetType(signals, 'snoozed');
  const openedCounts = countByTargetType(signals, 'opened-details');

  const oftenIgnoredTypes = topTypes(ignoredCounts, 2);
  const oftenLaterTypes = topTypes(laterCounts, 2);
  const oftenStoppedTypes = topTypes(stopCounts, 2);

  // Safe to hide: often ignored or snoozed, not often opened
  const safeToHideCandidates = new Set([
    ...topTypes(ignoredCounts, 3),
    ...topTypes(snoozedCounts, 2),
  ]);
  const oftenOpenedSet = new Set(topTypes(openedCounts, 2));
  const safeToHideTypes = [...safeToHideCandidates].filter((t) => !oftenOpenedSet.has(t));

  // Should surface: often opened, not often ignored
  const shouldSurfaceTypes = [...oftenOpenedSet].filter(
    (t) => !safeToHideCandidates.has(t)
  );

  // Preferred mode based on signals
  let preferredDashboardMode: DarakePreferenceProfile['preferredDashboardMode'] = 'maximum-darake';
  const totalSignals = signals.length;
  if (totalSignals > 20 && safeToHideTypes.length >= 3) {
    preferredDashboardMode = 'one-screen';
  } else if (totalSignals > 10) {
    preferredDashboardMode = 'completion-first';
  }

  return {
    title: 'だらけ傾向プロファイル',
    updatedAt: new Date().toISOString(),
    oftenIgnoredTypes,
    oftenLaterTypes,
    oftenStoppedTypes,
    safeToHideTypes,
    shouldSurfaceTypes,
    preferredDashboardMode,
    notes: `${totalSignals}件の行動シグナルから学習しました。`,
  };
}

export function summarizeDarakePreferenceProfile(profile: DarakePreferenceProfile): string {
  const lines: string[] = [];
  if (profile.oftenIgnoredTypes.length > 0) {
    lines.push(`よく無視するもの: ${profile.oftenIgnoredTypes.join(', ')}`);
  }
  if (profile.oftenLaterTypes.length > 0) {
    lines.push(`よくLaterにするもの: ${profile.oftenLaterTypes.join(', ')}`);
  }
  if (profile.oftenStoppedTypes.length > 0) {
    lines.push(`よくStopするもの: ${profile.oftenStoppedTypes.join(', ')}`);
  }
  if (profile.safeToHideTypes.length > 0) {
    lines.push(`自動で奥へ送ってよさそう: ${profile.safeToHideTypes.join(', ')}`);
  }
  if (profile.shouldSurfaceTypes.length > 0) {
    lines.push(`前に出すべきもの: ${profile.shouldSurfaceTypes.join(', ')}`);
  }
  lines.push(`おすすめモード: ${profile.preferredDashboardMode}`);
  return lines.join('\n');
}

export function formatDarakePreferenceProfileMarkdown(
  profile: DarakePreferenceProfile
): string {
  const lines = [
    `# ${profile.title}`,
    `更新: ${profile.updatedAt}`,
    '',
    `## だらけ傾向サマリー`,
    `- よく無視するもの: ${profile.oftenIgnoredTypes.length > 0 ? profile.oftenIgnoredTypes.join(', ') : '（なし）'}`,
    `- よくLaterにするもの: ${profile.oftenLaterTypes.length > 0 ? profile.oftenLaterTypes.join(', ') : '（なし）'}`,
    `- よくStopするもの: ${profile.oftenStoppedTypes.length > 0 ? profile.oftenStoppedTypes.join(', ') : '（なし）'}`,
    '',
    `## 自動可視性`,
    `- 自動で奥へ送ってよさそう: ${profile.safeToHideTypes.length > 0 ? profile.safeToHideTypes.join(', ') : '（なし）'}`,
    `- 前に出すべきもの: ${profile.shouldSurfaceTypes.length > 0 ? profile.shouldSurfaceTypes.join(', ') : '（なし）'}`,
    '',
    `## おすすめモード`,
    `${profile.preferredDashboardMode}`,
    '',
    `## メモ`,
    profile.notes,
  ];
  return lines.join('\n');
}
