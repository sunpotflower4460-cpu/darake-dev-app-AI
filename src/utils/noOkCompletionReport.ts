// Phase 35.3: No-OK Completion Report

export type NoOkCompletionReport = {
  title: string;
  status: 'ready' | 'needs-review' | 'blocked';
  completed: string[];
  autoProceedEnabled: string[];
  stillRequiresHuman: string[];
  warnings: string[];
  blockers: string[];
  nextRecommendedPhase: string;
  nextActions: string[];
};

export function buildNoOkCompletionReport(
  partial: Partial<NoOkCompletionReport> & Pick<NoOkCompletionReport, 'title'>
): NoOkCompletionReport {
  return {
    status: 'ready',
    completed: [],
    autoProceedEnabled: [],
    stillRequiresHuman: [],
    warnings: [],
    blockers: [],
    nextRecommendedPhase: '',
    nextActions: [],
    ...partial,
  };
}

export function formatNoOkCompletionReportMarkdown(report: NoOkCompletionReport): string {
  const statusIcon =
    report.status === 'ready' ? '✅' : report.status === 'needs-review' ? '⚠️' : '🚫';
  const lines = [
    `# ${report.title}`,
    '',
    `**状態:** ${statusIcon} ${report.status}`,
    '',
  ];

  if (report.completed.length > 0) {
    lines.push('## ✅ 完了済み');
    report.completed.forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }

  if (report.autoProceedEnabled.length > 0) {
    lines.push('## ⚡ 自動で進めてよいもの（OK不要）');
    report.autoProceedEnabled.forEach((a) => lines.push(`- ${a}`));
    lines.push('');
  }

  if (report.stillRequiresHuman.length > 0) {
    lines.push('## 👤 人間確認が必要なもの（固定）');
    report.stillRequiresHuman.forEach((h) => lines.push(`- ${h}`));
    lines.push('');
  }

  if (report.warnings.length > 0) {
    lines.push('## ⚠️ Warning');
    report.warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push('');
  }

  if (report.blockers.length > 0) {
    lines.push('## 🚫 Blocker');
    report.blockers.forEach((b) => lines.push(`- ${b}`));
    lines.push('');
  }

  if (report.nextRecommendedPhase) {
    lines.push(`## 次フェーズ候補`, report.nextRecommendedPhase, '');
  }

  if (report.nextActions.length > 0) {
    lines.push('## 次のアクション');
    report.nextActions.forEach((a) => lines.push(`- ${a}`));
  }

  return lines.join('\n');
}

export function buildDefaultPhase33to35CompletionReport(): NoOkCompletionReport {
  return buildNoOkCompletionReport({
    title: 'No-OK Mode Completion Report（Phase 33〜35）',
    status: 'ready',
    completed: [
      'Phase 33: Darake Autopilot Policy（5プリセット）',
      'Phase 33.1: Autopilot Policy Panel',
      'Phase 34: No-OK Auto Advance Queue',
      'Phase 34.1: No-OK Auto Advance Queue Panel',
      'Phase 34.2: Silent Batch Log',
      'Phase 35: Darake Review Inbox',
      'Phase 35.1: Review Inbox Panel',
      'Phase 35.2: Maximum Darake Dashboard',
      'Phase 35.3: No-OK Completion Report',
    ],
    autoProceedEnabled: [
      'localStorageドラフト生成',
      'copy用Markdown生成',
      'readiness判定',
      'completion report生成',
      'notification draft生成',
      'dry-run payload生成',
      'Cloud Agent指示書下書き生成',
      'GitHub操作候補dry-run生成',
      'AI prompt pack生成',
      'safety audit更新',
      'panel summary更新',
      'next action候補更新',
      'warningの蓄積',
    ],
    stillRequiresHuman: [
      'GitHub API実行',
      'Issue / PR作成',
      'workflow dispatch / merge',
      'AI API呼び出し',
      'Webhook送信',
      'App Store Connect API実行',
      'Submit for Review',
      'secret / token / API key 保存',
      '本番deploy / publish / 課金 / 認証 / DB変更',
    ],
    nextRecommendedPhase: 'Phase 36: Darake Memory / Preference Learning',
    nextActions: [
      'Maximum Darake Dashboardで今日見るべき1件を確認',
      'Review Inboxのurgentをチェック',
      'AutoPilot Levelを safe-auto 以上に設定',
      'Silent Batch Logで裏で進んだことを確認',
    ],
  });
}
