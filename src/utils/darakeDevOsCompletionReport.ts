export type DarakeDevOsCompletionReport = {
  features: {
    create: boolean;
    run: boolean;
    watch: boolean;
    screenshot: boolean;
    submit: boolean;
    postRelease: boolean;
    portfolio: boolean;
    templates: boolean;
    safety: boolean;
  };
  remainingTasks: string[];
  nextBigPhase: string;
  completionPercent: number;
};

export function buildDarakeDevOsCompletionReport(): DarakeDevOsCompletionReport {
  const features = {
    create: true,   // Phase 1-8: Issue Draft, Phase Queue, AutoRun
    run: true,      // Phase 5-9: CI, PR Watch
    watch: true,    // Phase 7: Safety, Review Watch
    screenshot: true, // Phase 8-10: Screenshot suite
    submit: true,   // Phase 11-14: Notification, App Store prep, Submission, Rejection
    postRelease: true,  // Phase 15: Post-Release
    portfolio: true,    // Phase 16: App Registry
    templates: true,    // Phase 17: Blueprint Factory
    safety: true,       // Phase 18.6: Safety Settings
  };

  const completedCount = Object.values(features).filter(Boolean).length;
  const completionPercent = Math.round((completedCount / Object.keys(features).length) * 100);

  const remainingTasks = [
    'Phase 19: 外部通知の実接続候補（Telegram / Discord / LINE）',
    'Phase 20: GitHub連携の半自動化強化',
    'Phase 21: AIレビュー統合',
    'Phase 22: 収益・運用メモ',
    'Phase 23: アプリ工房モード',
  ];

  const nextBigPhase = 'Phase 19: 外部通知の実接続候補';

  return { features, remainingTasks, nextBigPhase, completionPercent };
}

export function formatDarakeDevOsCompletionReportMarkdown(report: DarakeDevOsCompletionReport): string {
  const featureLines = Object.entries(report.features).map(
    ([key, ok]) => `- ${ok ? '✅' : '❌'} ${key}`,
  );

  return [
    '# だらけ Dev OS 完成レポート',
    '',
    `## 完成度: ${report.completionPercent}%`,
    '',
    '## 機能状況',
    ...featureLines,
    '',
    '## 残り課題',
    ...report.remainingTasks.map((t) => `- ${t}`),
    '',
    `## 次の大Phase`,
    report.nextBigPhase,
    '',
    '## Safety Note',
    '- App Store等への操作は自動実行しません',
    '- secret / token は保存しません',
  ].join('\n');
}
