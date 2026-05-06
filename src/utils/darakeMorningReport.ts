export type DarakeMorningReportStatus =
  | 'nothing-needed'
  | 'one-thing'
  | 'later-review'
  | 'blocked';

export type DarakeMorningReport = {
  title: string;
  status: DarakeMorningReportStatus;
  greeting: string;
  oneLineSummary: string;
  whatHappenedQuietly: string[];
  whatCanWait: string[];
  whatNeedsHuman: string[];
  whatIsBlocked: string[];
  todayOneThing: string;
  lazyRecommendation: string;
  shouldShowDetails: boolean;
  detailsMarkdown: string;
};

export const STATUS_LABELS_MORNING: Record<DarakeMorningReportStatus, string> = {
  'nothing-needed': '✅ 今日は何もしなくてOK',
  'one-thing': '☝️ 1つだけ確認して',
  'later-review': '📋 あとで確認リストあり',
  blocked: '🚫 ブロックあり — 要確認',
};

type BuildMorningReportParams = {
  quietItems?: string[];
  waitItems?: string[];
  humanItems?: string[];
  blockedItems?: string[];
  autoHandledCount?: number;
};

export function buildDarakeMorningReport(params: BuildMorningReportParams = {}): DarakeMorningReport {
  const {
    quietItems = [],
    waitItems = [],
    humanItems = [],
    blockedItems = [],
    autoHandledCount = 0,
  } = params;

  let status: DarakeMorningReportStatus;
  let greeting: string;
  let oneLineSummary: string;
  let todayOneThing: string;
  let lazyRecommendation: string;
  let shouldShowDetails: boolean;

  if (blockedItems.length > 0) {
    status = 'blocked';
    greeting = 'おはようございます ☀️ ブロックがあります';
    oneLineSummary = `${blockedItems.length}件のブロックがあります。確認が必要です。`;
    todayOneThing = blockedItems[0] ?? 'ブロックを確認してください';
    lazyRecommendation = '最初にブロックを解消しましょう';
    shouldShowDetails = true;
  } else if (humanItems.length > 0) {
    status = 'one-thing';
    greeting = 'おはようございます ☀️ 1つだけ確認してください';
    oneLineSummary = `${humanItems.length}件の確認があります。`;
    todayOneThing = humanItems[0] ?? '確認してください';
    lazyRecommendation = 'これだけやれば今日は大丈夫です';
    shouldShowDetails = humanItems.length > 1;
  } else if (waitItems.length > 0) {
    status = 'later-review';
    greeting = 'おはようございます ☀️ あとで見る項目があります';
    oneLineSummary = `急ぎじゃないけど ${waitItems.length}件あります。`;
    todayOneThing = waitItems[0] ?? 'あとで確認してください';
    lazyRecommendation = '急がないので好きなタイミングで';
    shouldShowDetails = waitItems.length > 0;
  } else {
    status = 'nothing-needed';
    greeting = 'おはようございます ☀️ 今日は何もしなくてOKです';
    oneLineSummary =
      autoHandledCount > 0
        ? `夜の間に ${autoHandledCount}件を自動処理しました。`
        : 'すべて順調です。だらけていて大丈夫です。';
    todayOneThing = '今日は触らなくてOKです';
    lazyRecommendation = 'のんびりしていてください 😴';
    shouldShowDetails = quietItems.length > 0;
  }

  const lines = [
    `# モーニングレポート`,
    '',
    `**${greeting}**`,
    oneLineSummary,
    '',
    `## 今日の1つのこと`,
    todayOneThing,
    '',
    `## 推奨`,
    lazyRecommendation,
  ];

  if (quietItems.length > 0) {
    lines.push('', '## 夜の間に静かに起きたこと');
    quietItems.forEach((q) => lines.push(`- ${q}`));
  }
  if (waitItems.length > 0) {
    lines.push('', '## あとで見ること');
    waitItems.forEach((w) => lines.push(`- ${w}`));
  }
  if (humanItems.length > 0) {
    lines.push('', '## 今すぐ必要');
    humanItems.forEach((h) => lines.push(`- ${h}`));
  }
  if (blockedItems.length > 0) {
    lines.push('', '## ブロック中');
    blockedItems.forEach((b) => lines.push(`- ${b}`));
  }

  return {
    title: 'だらけモーニングレポート',
    status,
    greeting,
    oneLineSummary,
    whatHappenedQuietly: quietItems,
    whatCanWait: waitItems,
    whatNeedsHuman: humanItems,
    whatIsBlocked: blockedItems,
    todayOneThing,
    lazyRecommendation,
    shouldShowDetails,
    detailsMarkdown: lines.join('\n'),
  };
}

const STORAGE_KEY = 'darake.morningReport.v1';

export function loadDarakeMorningReport(): DarakeMorningReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DarakeMorningReport;
  } catch {
    return null;
  }
}

export function saveDarakeMorningReport(state: DarakeMorningReport): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function formatMorningReportMarkdown(state: DarakeMorningReport): string {
  return state.detailsMarkdown;
}
