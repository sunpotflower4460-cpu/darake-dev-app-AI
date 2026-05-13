import type { DarakeTask } from './darakeTaskQueue';
import type { DarakeSleepSession } from './darakeSleepSession';

export type DarakeCockpitMorningReport = {
  id: string;
  sessionId?: string;
  title: string;
  completedTaskIds: string[];
  askLaterTaskIds: string[];
  blockedHardTaskIds: string[];
  createdIssueUrls: string[];
  createdPrUrls: string[];
  summary: string;
  nextRecommendedAction?: string;
  createdAt: string;
};

const MORNING_REPORT_KEY = 'darake.cockpitMorningReports.v1';

export function loadCockpitMorningReports(): DarakeCockpitMorningReport[] {
  try {
    const raw = localStorage.getItem(MORNING_REPORT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DarakeCockpitMorningReport[];
  } catch {
    return [];
  }
}

export function saveCockpitMorningReports(
  reports: DarakeCockpitMorningReport[]
): void {
  localStorage.setItem(MORNING_REPORT_KEY, JSON.stringify(reports));
}

export function buildCockpitMorningReport(
  tasks: DarakeTask[],
  session?: DarakeSleepSession
): DarakeCockpitMorningReport {
  const completed = tasks.filter((t) => t.status === 'done');
  const askLater = tasks.filter((t) => t.status === 'ask-later');
  const blockedHard = tasks.filter((t) => t.status === 'blocked-hard');

  const n = completed.length;
  const m = askLater.length;
  const k = blockedHard.length;

  const summary = `完了: ${n}件, 後で聞く: ${m}件, Hard Stop: ${k}件`;

  let nextRecommendedAction: string;
  if (k > 0) {
    nextRecommendedAction = 'Hard Stopを確認してください';
  } else if (m > 0) {
    nextRecommendedAction = '後で聞くことを確認してください';
  } else {
    nextRecommendedAction = '次のタスクを始めましょう';
  }

  const issueUrls = tasks
    .filter((t) => t.issueUrl)
    .map((t) => t.issueUrl as string);
  const prUrls = tasks
    .filter((t) => t.prUrl)
    .map((t) => t.prUrl as string);

  return {
    id: `report-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    sessionId: session?.id,
    title: session
      ? `朝レポート: ${session.title}`
      : `朝レポート ${new Date().toLocaleDateString('ja-JP')}`,
    completedTaskIds: completed.map((t) => t.id),
    askLaterTaskIds: askLater.map((t) => t.id),
    blockedHardTaskIds: blockedHard.map((t) => t.id),
    createdIssueUrls: issueUrls,
    createdPrUrls: prUrls,
    summary,
    nextRecommendedAction,
    createdAt: new Date().toISOString(),
  };
}

export function saveMorningReport(
  report: DarakeCockpitMorningReport
): void {
  const reports = loadCockpitMorningReports();
  saveCockpitMorningReports([report, ...reports]);
}
