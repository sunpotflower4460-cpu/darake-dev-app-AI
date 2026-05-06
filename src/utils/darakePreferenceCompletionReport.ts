// Phase 36.4: Darake Preference Completion Report

import type { DarakePreferenceProfile } from './darakePreferenceMemory';

export type DarakePreferenceCompletionReport = {
  title: string;
  generatedAt: string;
  learningActive: boolean;
  signalCount: number;
  hidingTypes: string[];
  surfacingTypes: string[];
  alwaysVisibleTypes: string[];
  preferredMode: string;
  recommendation: string;
  notes: string;
};

export function buildDarakePreferenceCompletionReport(
  profile: DarakePreferenceProfile | null,
  signalCount: number
): DarakePreferenceCompletionReport {
  const alwaysVisible = ['blocked', 'urgent', 'secret', 'production', 'billing', 'auth', 'db'];

  if (!profile) {
    return {
      title: 'だらけ傾向 学習レポート',
      generatedAt: new Date().toISOString(),
      learningActive: false,
      signalCount: 0,
      hidingTypes: [],
      surfacingTypes: [],
      alwaysVisibleTypes: alwaysVisible,
      preferredMode: 'maximum-darake',
      recommendation: 'まだ学習データがありません。操作を続けると傾向を学習します。',
      notes: 'シグナルが0件です。',
    };
  }

  const learningActive = signalCount >= 3;
  let recommendation = '学習が進んでいます。引き続きアプリを使って傾向を積み上げてください。';
  if (signalCount >= 20 && profile.safeToHideTypes.length >= 3) {
    recommendation = '傾向学習が十分です。One Screenモードへの切り替えをお勧めします。';
  } else if (signalCount >= 10) {
    recommendation = 'Completion-firstモードへの切り替えをお勧めします。';
  }

  return {
    title: 'だらけ傾向 学習レポート',
    generatedAt: new Date().toISOString(),
    learningActive,
    signalCount,
    hidingTypes: profile.safeToHideTypes,
    surfacingTypes: profile.shouldSurfaceTypes,
    alwaysVisibleTypes: alwaysVisible,
    preferredMode: profile.preferredDashboardMode,
    recommendation,
    notes: profile.notes,
  };
}

export function formatDarakePreferenceCompletionReportMarkdown(
  report: DarakePreferenceCompletionReport
): string {
  const lines = [
    `# ${report.title}`,
    `生成: ${report.generatedAt}`,
    '',
    `## 学習状態`,
    `- 学習有効: ${report.learningActive ? '✅ はい' : '❌ まだ'}`,
    `- シグナル数: ${report.signalCount}件`,
    '',
    `## 自動可視性`,
    `- 非表示にするもの: ${report.hidingTypes.length > 0 ? report.hidingTypes.join(', ') : '（なし）'}`,
    `- 前に出すもの: ${report.surfacingTypes.length > 0 ? report.surfacingTypes.join(', ') : '（なし）'}`,
    `- 常に表示（安全）: ${report.alwaysVisibleTypes.join(', ')}`,
    '',
    `## おすすめモード`,
    report.preferredMode,
    '',
    `## 次におすすめ`,
    report.recommendation,
    '',
    `## メモ`,
    report.notes,
  ];
  return lines.join('\n');
}
