import type { DarakeMorningReportStatus } from './darakeMorningReport';

export type DarakeMorningReportCompletionReport = {
  title: string;
  phase: string;
  isMorningReportWorking: boolean;
  currentStatus: DarakeMorningReportStatus;
  keyFeatures: string[];
  recommendations: string[];
  completionMarkdown: string;
};

export function buildDarakeMorningReportCompletionReport(
  currentStatus: DarakeMorningReportStatus,
): DarakeMorningReportCompletionReport {
  const isMorningReportWorking =
    currentStatus === 'nothing-needed' || currentStatus === 'one-thing';

  const keyFeatures = [
    '朝の挨拶と1行サマリー',
    '今日の1つのことを提示',
    '裏で整ったこと・あとで見ること・急ぎの分類',
    '詳細を展開して全体確認',
    '今日は見ないボタン（24時間スヌーズ）',
  ];

  const recommendations: string[] = [];
  if (currentStatus === 'blocked') {
    recommendations.push('ブロック項目を解消することで "nothing-needed" 状態になります');
  } else if (currentStatus === 'one-thing') {
    recommendations.push('1件の確認を済ませればOKです');
  } else {
    recommendations.push('現在のモーニングレポートは正常に動作しています');
  }
  recommendations.push('localStorageキー: darake.morningReport.v1');

  const lines = [
    '# モーニングレポート 完成レポート (Phase 40)',
    '',
    `**状態**: ${isMorningReportWorking ? '✅ 正常動作' : '⚠️ 要確認'}`,
    `**現在のステータス**: ${currentStatus}`,
    '',
    '## 主な機能',
    ...keyFeatures.map((f) => `- ${f}`),
    '',
    '## 推奨事項',
    ...recommendations.map((r) => `- ${r}`),
  ];

  return {
    title: 'モーニングレポート完成レポート',
    phase: '40',
    isMorningReportWorking,
    currentStatus,
    keyFeatures,
    recommendations,
    completionMarkdown: lines.join('\n'),
  };
}
