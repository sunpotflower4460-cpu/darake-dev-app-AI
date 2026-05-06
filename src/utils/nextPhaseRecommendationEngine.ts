export type NextPhaseRecommendationPriority = 'low' | 'medium' | 'high';

export type NextPhaseRecommendationItem = {
  phaseLabel: string;
  title: string;
  reason: string;
  priority: NextPhaseRecommendationPriority;
  suggestedInstruction: string;
};

export type NextPhaseRecommendation = {
  title: string;
  status: 'ready' | 'needs-human-choice' | 'blocked';
  recommendations: NextPhaseRecommendationItem[];
  blockers: string[];
  manualChoices: string[];
};

export function buildNextPhaseRecommendation(params: {
  hasBlockedJobs: boolean;
  hasRunningJobs: boolean;
  hasDraftJobs: boolean;
  currentPhase: string;
  customRecommendations?: NextPhaseRecommendationItem[];
}): NextPhaseRecommendation {
  const { hasBlockedJobs, hasRunningJobs, hasDraftJobs, currentPhase, customRecommendations } = params;

  const blockers: string[] = [];
  if (hasBlockedJobs) blockers.push('失敗したCloud Agentジョブがあります。再指示が必要です。');

  const defaultRecs: NextPhaseRecommendationItem[] = customRecommendations ?? [
    {
      phaseLabel: 'Phase 30',
      title: 'だらけワンボタン候補',
      reason: '次にやるべき1件を決めて指示書を生成する',
      priority: 'high',
      suggestedInstruction:
        '「次にやるべき1件」を選び、Issue/PR/AI/通知の候補をまとめ、実行直前の形にする。実行はしない。',
    },
    {
      phaseLabel: 'Phase 31',
      title: 'Human Check Minimal Mode',
      reason: '人間が見る画面を最小化し、OK/Stop/Laterだけで判断できる画面にする',
      priority: 'medium',
      suggestedInstruction: 'OK / Stop / Later だけで操作できるMinimal Mode UIを追加する。',
    },
  ];

  const status: NextPhaseRecommendation['status'] =
    blockers.length > 0
      ? 'blocked'
      : hasRunningJobs || hasDraftJobs
      ? 'needs-human-choice'
      : 'ready';

  const manualChoices: string[] = [];
  if (hasRunningJobs) manualChoices.push('実行中ジョブの結果を確認してから次Phaseを選ぶ');
  if (hasDraftJobs) manualChoices.push('draftジョブをCloud Agentに渡してから次Phaseを選ぶ');

  return {
    title: `Next Phase Recommendation (current: ${currentPhase})`,
    status,
    recommendations: defaultRecs,
    blockers,
    manualChoices,
  };
}

export function formatNextPhaseRecommendationMarkdown(rec: NextPhaseRecommendation): string {
  const lines: string[] = [
    `# ${rec.title}`,
    `status: ${rec.status}`,
    '',
    `## Recommendations`,
    ...rec.recommendations.map((r) => [
      `### [${r.priority.toUpperCase()}] ${r.phaseLabel}: ${r.title}`,
      `**reason**: ${r.reason}`,
      '',
      `**suggested instruction**:`,
      r.suggestedInstruction,
    ].join('\n')),
    '',
    `## Blockers`,
    ...(rec.blockers.length > 0 ? rec.blockers.map((b) => `- ⛔ ${b}`) : ['(なし)']),
    '',
    `## Manual Choices`,
    ...(rec.manualChoices.length > 0 ? rec.manualChoices.map((c) => `- ${c}`) : ['(なし)']),
  ];
  return lines.join('\n');
}
