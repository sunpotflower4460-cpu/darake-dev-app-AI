// Phase 38.5: One Screen Completion Report

import type { OneScreenCommandState } from './oneScreenCommandState';
import type { OneScreenSettings } from './oneScreenSettings';

export type OneScreenCompletionReport = {
  title: string;
  generatedAt: string;
  isOneScreenActive: boolean;
  hiddenPanelCount: number;
  visibleHumanRequiredCount: number;
  safetyStatus: 'safe' | 'warning' | 'danger';
  safetyNotes: string[];
  recommendation: string;
};

export function buildOneScreenCompletionReport(
  state: OneScreenCommandState | null,
  settings: OneScreenSettings,
  totalPanelCount: number,
  visiblePanelCount: number,
  humanRequiredCount: number
): OneScreenCompletionReport {
  const isOneScreenActive = settings.defaultToOneScreen && visiblePanelCount <= 5;
  const hiddenPanelCount = totalPanelCount - visiblePanelCount;

  const safetyNotes: string[] = [];
  let safetyStatus: OneScreenCompletionReport['safetyStatus'] = 'safe';

  if (!settings.showBlockedImmediately) {
    safetyNotes.push('⚠️ blockedをすぐ表示しない設定になっています');
    safetyStatus = 'warning';
  }

  if (settings.fixedSafetyMode !== 'strict-manual-gate') {
    safetyNotes.push('🚫 fixedSafetyModeが無効です（これは起きません）');
    safetyStatus = 'danger';
  }

  if (state?.status === 'blocked') {
    safetyNotes.push('🚫 現在ブロック中。解消が必要です。');
    safetyStatus = 'danger';
  }

  if (safetyNotes.length === 0) {
    safetyNotes.push('✅ 安全設定は正常です');
  }

  let recommendation = '1画面モードが正常に動作しています。';
  if (!isOneScreenActive) {
    recommendation = 'パネル数が多いです。One Screen設定をONにして詳細を非表示にしてください。';
  }
  if (safetyStatus === 'danger') {
    recommendation = 'ブロックまたは安全設定の問題があります。確認してください。';
  }

  return {
    title: '1画面化 完成レポート',
    generatedAt: new Date().toISOString(),
    isOneScreenActive,
    hiddenPanelCount,
    visibleHumanRequiredCount: humanRequiredCount,
    safetyStatus,
    safetyNotes,
    recommendation,
  };
}

export function formatOneScreenCompletionReportMarkdown(
  report: OneScreenCompletionReport
): string {
  const lines = [
    `# ${report.title}`,
    `生成: ${report.generatedAt}`,
    '',
    `## 1画面化状態`,
    `- 1画面化有効: ${report.isOneScreenActive ? '✅ はい' : '❌ いいえ'}`,
    `- 非表示パネル数: ${report.hiddenPanelCount}件`,
    `- 人間必須（前面）: ${report.visibleHumanRequiredCount}件`,
    '',
    `## 安全状態`,
    `ステータス: ${report.safetyStatus}`,
    ...report.safetyNotes,
    '',
    `## 次におすすめ`,
    report.recommendation,
  ];
  return lines.join('\n');
}
