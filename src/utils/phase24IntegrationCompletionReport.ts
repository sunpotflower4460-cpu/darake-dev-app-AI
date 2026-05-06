export type Phase24IntegrationCompletionReport = {
  title: string;
  status: 'healthy' | 'needs-review' | 'blocked';
  completed: string[];
  warnings: string[];
  blockers: string[];
  nextRecommendedPhase: string;
  nextActions: string[];
};

export function buildPhase24IntegrationCompletionReport(): Phase24IntegrationCompletionReport {
  const completed: string[] = [
    'Phase 24.1: Current Integration Audit — Phase 1〜23のパネルを一覧化した',
    'Phase 24.2: Panel Registry — 全パネルをPhaseごとに分割registry化した',
    'Phase 24.3: Navigation / Focused Mode — activeGroup / focusedMode を実際に効かせた',
    'Phase 24.4: Darake Top Command Panel — 管制室の入口を最上部に固定した',
    'Phase 24.5: Safety Invariant Audit — 外部API / secret保存なしを確認した',
    'Phase 24.6: LocalStorage Key Registry — 全localStorageキーを一覧化した',
    'Phase 24.7: Phase 24 Completion Report — 統合完成レポートを追加した',
    'main.tsx のリファクタリング — DarakeControlRoomコンポーネントで整理した',
    'パネル表示フィルタ — activeGroup + focusedModeで絞り込みを実装した',
    'DarakeNavigationBar — 実際に機能するナビゲーションにした',
    'FocusedModePanel — 実際に表示を切り替えるモードにした',
  ];

  const warnings: string[] = [
    'panelRegistry の component は ReactNode として静的に生成されている（問題なし）',
    'FocusedModePanel は controlled / uncontrolled 両対応に拡張した',
    'Phase 25以降でAI API連携を設計する際は必ずSafety Invariant Auditを更新すること',
  ];

  const blockers: string[] = [];

  const nextActions: string[] = [
    '画面が真っ白にならないことを確認する（npm run build）',
    'NavigationBarでgroupを切り替えて表示が変わることを確認する',
    'Focused Modeで「今日のフォーカス」を選んで絞り込みが効くことを確認する',
    'スマホ幅で大崩れしないことを確認する',
    '既存の保存/コピー機能が壊れていないことを確認する',
    'secret / token / API key の入力欄がないことを確認する',
    'Phase 25以降：AI API連携準備（まだ実行しない）',
  ];

  return {
    title: 'Phase 24 統合点検・表示整理・巨大化対策 完成レポート',
    status: warnings.length > 0 ? 'needs-review' : 'healthy',
    completed,
    warnings,
    blockers,
    nextRecommendedPhase: 'Phase 25: 実AI連携準備（AI API呼び出しはまだしない）',
    nextActions,
  };
}

export function formatPhase24CompletionMarkdown(
  report: Phase24IntegrationCompletionReport,
): string {
  const lines: string[] = [
    `# ${report.title}`,
    `Status: ${report.status}`,
    '',
    '## 完了項目',
    ...report.completed.map((c) => `- ✅ ${c}`),
  ];

  if (report.warnings.length > 0) {
    lines.push('\n## 注意事項');
    report.warnings.forEach((w) => lines.push(`- ⚠️ ${w}`));
  }
  if (report.blockers.length > 0) {
    lines.push('\n## Blockers');
    report.blockers.forEach((b) => lines.push(`- 🔴 ${b}`));
  }

  lines.push('\n## 次のおすすめPhase');
  lines.push(report.nextRecommendedPhase);
  lines.push('\n## 確認アクション');
  report.nextActions.forEach((a) => lines.push(`- ${a}`));

  return lines.join('\n');
}
