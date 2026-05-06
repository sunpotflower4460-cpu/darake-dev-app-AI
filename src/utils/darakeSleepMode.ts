export type DarakeSleepModeStatus =
  | 'sleep-ok'
  | 'quiet-monitoring'
  | 'later-review'
  | 'needs-human-once'
  | 'blocked';

export type DarakeSleepMode = {
  title: string;
  status: DarakeSleepModeStatus;
  headline: string;
  subline: string;
  canSleep: boolean;
  shouldWakeHuman: boolean;
  autoHandledCount: number;
  batchedWarningCount: number;
  laterReviewCount: number;
  urgentHumanCount: number;
  blockedCount: number;
  wakeReasons: string[];
  hiddenBecauseSafe: string[];
  nextHumanAction: string;
  detailsMarkdown: string;
};

export const STATUS_LABELS: Record<DarakeSleepModeStatus, string> = {
  'sleep-ok': '🟢 寝てて大丈夫',
  'quiet-monitoring': '🔵 静かに監視中',
  'later-review': '🟡 あとで見ればOK',
  'needs-human-once': '🟠 1回確認して',
  blocked: '🔴 ブロック中',
};

export const STATUS_EMOJI: Record<DarakeSleepModeStatus, string> = {
  'sleep-ok': '😴',
  'quiet-monitoring': '👁️',
  'later-review': '📋',
  'needs-human-once': '👋',
  blocked: '🚫',
};

type BuildSleepModeParams = {
  autoHandledCount?: number;
  batchedWarningCount?: number;
  laterReviewCount?: number;
  urgentHumanCount?: number;
  blockedCount?: number;
  wakeReasons?: string[];
  hiddenBecauseSafe?: string[];
  nextHumanAction?: string;
};

export function buildDarakeSleepMode(params: BuildSleepModeParams = {}): DarakeSleepMode {
  const {
    autoHandledCount = 0,
    batchedWarningCount = 0,
    laterReviewCount = 0,
    urgentHumanCount = 0,
    blockedCount = 0,
    wakeReasons = [],
    hiddenBecauseSafe = [],
    nextHumanAction = '',
  } = params;

  let status: DarakeSleepModeStatus;
  let headline: string;
  let subline: string;
  let canSleep: boolean;
  let shouldWakeHuman: boolean;

  if (blockedCount > 0) {
    status = 'blocked';
    headline = 'ブロックされています';
    subline = `${blockedCount}件、人間の判断が必要です`;
    canSleep = false;
    shouldWakeHuman = true;
  } else if (urgentHumanCount > 0) {
    status = 'needs-human-once';
    headline = '1回だけ確認してください';
    subline = `${urgentHumanCount}件の確認が必要です`;
    canSleep = false;
    shouldWakeHuman = true;
  } else if (laterReviewCount > 0) {
    status = 'later-review';
    headline = 'あとで見ればOKです';
    subline = `${laterReviewCount}件、急ぎじゃないけどいつか見て`;
    canSleep = true;
    shouldWakeHuman = false;
  } else if (batchedWarningCount > 0) {
    status = 'quiet-monitoring';
    headline = '静かに動いています';
    subline = '警告はまとめて後で確認できます';
    canSleep = true;
    shouldWakeHuman = false;
  } else {
    status = 'sleep-ok';
    headline = '今は寝ててOKです';
    subline = 'AIが自動で処理しています';
    canSleep = true;
    shouldWakeHuman = false;
  }

  const lines: string[] = [
    `# スリープモード: ${STATUS_LABELS[status]}`,
    '',
    `**${headline}**`,
    subline,
    '',
    `- 自動処理済み: ${autoHandledCount}件`,
    `- まとめた警告: ${batchedWarningCount}件`,
    `- あとで確認: ${laterReviewCount}件`,
    `- 急ぎの確認: ${urgentHumanCount}件`,
    `- ブロック中: ${blockedCount}件`,
  ];

  if (wakeReasons.length > 0) {
    lines.push('', '## 起こす理由');
    wakeReasons.forEach((r) => lines.push(`- ${r}`));
  }
  if (hiddenBecauseSafe.length > 0) {
    lines.push('', '## 安全なので非表示にしたもの');
    hiddenBecauseSafe.forEach((h) => lines.push(`- ${h}`));
  }
  if (nextHumanAction) {
    lines.push('', `## 次のアクション`, nextHumanAction);
  }

  return {
    title: 'だらけスリープモード',
    status,
    headline,
    subline,
    canSleep,
    shouldWakeHuman,
    autoHandledCount,
    batchedWarningCount,
    laterReviewCount,
    urgentHumanCount,
    blockedCount,
    wakeReasons,
    hiddenBecauseSafe,
    nextHumanAction: nextHumanAction || (canSleep ? 'のんびりしていてください' : '上の確認事項を見てください'),
    detailsMarkdown: lines.join('\n'),
  };
}

const STORAGE_KEY = 'darake.sleepMode.v1';

export function loadDarakeSleepMode(): DarakeSleepMode | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DarakeSleepMode;
  } catch {
    return null;
  }
}

export function saveDarakeSleepMode(state: DarakeSleepMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function formatDarakeSleepModeMarkdown(state: DarakeSleepMode): string {
  return state.detailsMarkdown;
}
