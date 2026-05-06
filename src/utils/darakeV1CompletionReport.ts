import { buildDarakeV1ReadinessGate } from './darakeV1ReadinessGate';

export type DarakeV1CompletionReport = {
  title: string;
  phase: string;
  overallStatus: 'complete' | 'nearly-complete' | 'needs-work';
  whatCanDo: string[];
  whatWontDo: string[];
  remainingItems: string[];
  completionMarkdown: string;
};

export function buildDarakeV1CompletionReport(): DarakeV1CompletionReport {
  const gate = buildDarakeV1ReadinessGate();

  const overallStatus: DarakeV1CompletionReport['overallStatus'] =
    gate.status === 'ready-for-v1'
      ? 'complete'
      : gate.blockers.length === 0
        ? 'nearly-complete'
        : 'needs-work';

  const whatCanDo = [
    '見なくていいものを隠す',
    '危険だけ起こす',
    '完成までの最短ルートを出す',
    'Cloud Agent指示書を作る',
    'GitHub dry-runを作る',
    'App Store準備を整える',
  ];

  const whatWontDo = [
    '外部API実行',
    'GitHub自動実行',
    'App Store自動提出',
    'secret保存',
    'AI API呼び出し',
  ];

  const remainingItems = [...gate.warnings, ...gate.blockers];

  const lines = [
    '# だらけ管制室 v1 完成レポート (Phase 44)',
    '',
    `**状態**: ${overallStatus === 'complete' ? '✅ ほぼ完成' : overallStatus === 'nearly-complete' ? '🟡 もう少し' : '⚠️ 要作業'}`,
    '',
    '## できること',
    ...whatCanDo.map((w) => `- ${w}`),
    '',
    '## まだやらないこと',
    ...whatWontDo.map((w) => `- ${w}`),
    '',
  ];

  if (remainingItems.length > 0) {
    lines.push('## 残りの項目');
    remainingItems.forEach((r) => lines.push(`- ${r}`));
    lines.push('');
  }

  lines.push('## 次のPhase');
  lines.push('Phase 45: Darake v1 Polish（見た目・スマホ・ボタン削減）');

  return {
    title: 'だらけ管制室 v1 完成レポート',
    phase: '44',
    overallStatus,
    whatCanDo,
    whatWontDo,
    remainingItems,
    completionMarkdown: lines.join('\n'),
  };
}
