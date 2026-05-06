import type { DarakeSleepModeStatus } from './darakeSleepMode';

export type DarakeSleepModeCompletionReport = {
  title: string;
  phase: string;
  isSleepModeWorking: boolean;
  currentStatus: DarakeSleepModeStatus;
  wakeConditions: string[];
  noWakeConditions: string[];
  hiddenInfoSummary: string[];
  alwaysVisibleSafetyItems: string[];
  recommendations: string[];
  completionMarkdown: string;
};

export function buildDarakeSleepModeCompletionReport(
  currentStatus: DarakeSleepModeStatus,
  wakeConditions: string[] = [],
  noWakeConditions: string[] = [],
  hiddenInfoSummary: string[] = [],
): DarakeSleepModeCompletionReport {
  const isSleepModeWorking = currentStatus === 'sleep-ok' || currentStatus === 'quiet-monitoring';

  const alwaysVisibleSafetyItems = [
    '🔴 ブロック状態は常に表示',
    '🟠 緊急の人間確認は常に表示',
    '📋 フェーズ状態は常に表示',
  ];

  const recommendations: string[] = [];
  if (!isSleepModeWorking) {
    recommendations.push('ブロックや緊急確認を解消するとスリープ可能になります');
  } else {
    recommendations.push('このまま放置しておいても大丈夫です');
    recommendations.push('朝のモーニングレポートで確認できます');
  }

  const defaultWake = wakeConditions.length > 0 ? wakeConditions : [
    'blockedCount > 0',
    'urgentHumanCount > 0',
    '本番デプロイの承認が必要',
  ];

  const defaultNoWake = noWakeConditions.length > 0 ? noWakeConditions : [
    'autoHandledCount の増加',
    '低リスクの警告',
    'あとで見る項目の追加',
  ];

  const lines = [
    '# スリープモード 完成レポート (Phase 39)',
    '',
    `**状態**: ${isSleepModeWorking ? '✅ 正常動作' : '⚠️ 要確認'}`,
    `**現在のステータス**: ${currentStatus}`,
    '',
    '## 起こす条件',
    ...defaultWake.map((c) => `- ${c}`),
    '',
    '## 起こさない条件',
    ...defaultNoWake.map((c) => `- ${c}`),
    '',
    '## 非表示にした情報',
    ...(hiddenInfoSummary.length > 0 ? hiddenInfoSummary.map((h) => `- ${h}`) : ['- なし']),
    '',
    '## 常に表示する安全項目',
    ...alwaysVisibleSafetyItems.map((s) => `- ${s}`),
    '',
    '## 推奨事項',
    ...recommendations.map((r) => `- ${r}`),
  ];

  return {
    title: 'スリープモード完成レポート',
    phase: '39',
    isSleepModeWorking,
    currentStatus,
    wakeConditions: defaultWake,
    noWakeConditions: defaultNoWake,
    hiddenInfoSummary,
    alwaysVisibleSafetyItems,
    recommendations,
    completionMarkdown: lines.join('\n'),
  };
}
