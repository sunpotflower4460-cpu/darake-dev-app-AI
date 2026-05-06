export type SessionResumeSummary = {
  title: string;
  sinceLabel: string;
  changedCount: number;
  importantChanges: string[];
  hiddenChanges: string[];
  needsHumanNow: string[];
  summaryLine: string;
};

type BuildSessionResumeSummaryParams = {
  sinceLabel?: string;
  changedCount?: number;
  importantChanges?: string[];
  hiddenChanges?: string[];
  needsHumanNow?: string[];
};

export function buildSessionResumeSummary(params: BuildSessionResumeSummaryParams = {}): SessionResumeSummary {
  const {
    sinceLabel = '最後のセッションから',
    changedCount = 0,
    importantChanges = [],
    hiddenChanges = [],
    needsHumanNow = [],
  } = params;

  let summaryLine: string;
  if (needsHumanNow.length > 0) {
    summaryLine = `${needsHumanNow.length}件の確認が必要です`;
  } else if (importantChanges.length > 0) {
    summaryLine = `${importantChanges.length}件の重要な変更がありました`;
  } else if (changedCount > 0) {
    summaryLine = `${changedCount}件の変更（人間の対応は不要）`;
  } else {
    summaryLine = '特に変化なし。続きから始められます';
  }

  return {
    title: 'セッション再開サマリー',
    sinceLabel,
    changedCount,
    importantChanges,
    hiddenChanges,
    needsHumanNow,
    summaryLine,
  };
}

const STORAGE_KEY = 'darake.sessionResume.v1';

export function loadSessionResumeSummary(): SessionResumeSummary | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionResumeSummary;
  } catch {
    return null;
  }
}

export function saveSessionResumeSummary(state: SessionResumeSummary): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
