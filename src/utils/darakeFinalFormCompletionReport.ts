import type { DarakeFinalFormStatus } from './darakeFinalFormState';

export type DarakeFinalFormCompletionReport = {
  title: string;
  phase: string;
  isFinalFormReady: boolean;
  currentStatus: DarakeFinalFormStatus;
  implementedFeatures: string[];
  visibilityRules: string[];
  recommendations: string[];
  completionMarkdown: string;
};

export function buildDarakeFinalFormCompletionReport(
  currentStatus: DarakeFinalFormStatus,
): DarakeFinalFormCompletionReport {
  const isFinalFormReady = currentStatus === 'sleep' || currentStatus === 'quiet';

  const implementedFeatures = [
    'だらけ管制室タイトルと状態メッセージ',
    '5ステータス対応 (sleep/quiet/review-later/human-needed/blocked)',
    'カウンターグリッド (autoHandled/batched/reviewLater/humanNow/blocked)',
    '優先事項カード (urgency > none のとき表示)',
    '詳細ドロワー (DarakeFinalFormDetailsDrawer)',
    '今日は見ないボタン (24時間スヌーズ)',
    'Visibility Policy (show/hide/always-show)',
    'LocalStorage 永続化: darake.finalFormState.v1',
  ];

  const visibilityRules = [
    'always-show: ブロック・緊急確認・安全ノート',
    'show: カウンター・あとで確認',
    'hide: 生ログ・詳細CI出力',
    'sleep/quiet 時は最小表示',
  ];

  const recommendations: string[] = [];
  if (!isFinalFormReady) {
    recommendations.push('ブロックや確認待ちを解消するとスリープ状態になります');
  } else {
    recommendations.push('Final Form は正常に動作しています');
    recommendations.push('すべてのPhase 39-41機能が統合されています');
  }

  const lines = [
    '# Final Form UI 完成レポート (Phase 41)',
    '',
    `**状態**: ${isFinalFormReady ? '✅ 正常動作' : '⚠️ 要確認'}`,
    `**現在のステータス**: ${currentStatus}`,
    '',
    '## 実装済み機能',
    ...implementedFeatures.map((f) => `- ${f}`),
    '',
    '## 表示ルール',
    ...visibilityRules.map((r) => `- ${r}`),
    '',
    '## 推奨事項',
    ...recommendations.map((r) => `- ${r}`),
  ];

  return {
    title: 'Final Form UI 完成レポート',
    phase: '41',
    isFinalFormReady,
    currentStatus,
    implementedFeatures,
    visibilityRules,
    recommendations,
    completionMarkdown: lines.join('\n'),
  };
}
