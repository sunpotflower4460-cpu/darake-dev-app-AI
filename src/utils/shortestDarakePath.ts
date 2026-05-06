// Phase 37.3: Shortest Darake Path

export type ShortestDarakePathStep = {
  id: string;
  label: string;
  type:
    | 'auto-local'
    | 'batch'
    | 'manual-copy'
    | 'manual-gate'
    | 'blocked';
  humanEffort:
    | 'none'
    | 'almost-none'
    | 'copy-paste'
    | 'quick-check'
    | 'manual-gate';
  description: string;
  whyNeeded: string;
  canSkipForNow: boolean;
};

export type ShortestDarakePath = {
  title: string;
  status: 'clear' | 'needs-human-once' | 'blocked';
  steps: ShortestDarakePathStep[];
  humanMustDoCount: number;
  autoCanDoCount: number;
  canBeLazySummary: string;
};

const DEFAULT_STEPS: ShortestDarakePathStep[] = [
  {
    id: 'step-agent-instruction',
    label: 'Cloud Agent指示書を生成',
    type: 'auto-local',
    humanEffort: 'none',
    description: 'Cloud Agent指示書をローカルで自動生成します',
    whyNeeded: 'AIへの指示書がないと実装が始まらない',
    canSkipForNow: false,
  },
  {
    id: 'step-ui-check',
    label: 'UI確認結果を記録',
    type: 'manual-copy',
    humanEffort: 'quick-check',
    description: 'UIを軽く確認して結果をコピーペーストするだけ',
    whyNeeded: 'リリース前に最低1回の目視確認が必要',
    canSkipForNow: false,
  },
  {
    id: 'step-app-store-check',
    label: 'App Store情報を最終確認',
    type: 'manual-gate',
    humanEffort: 'manual-gate',
    description: 'App Store提出前の安全ゲート確認',
    whyNeeded: '提出ミスはリジェクトにつながる',
    canSkipForNow: false,
  },
];

export function buildShortestDarakePath(
  customSteps?: ShortestDarakePathStep[]
): ShortestDarakePath {
  const steps = customSteps ?? DEFAULT_STEPS;
  const humanMustDoCount = steps.filter(
    (s) => s.type === 'manual-gate' || s.type === 'blocked'
  ).length;
  const autoCanDoCount = steps.filter(
    (s) => s.type === 'auto-local' || s.type === 'batch'
  ).length;

  const hasBlocked = steps.some((s) => s.type === 'blocked');
  const status: ShortestDarakePath['status'] = hasBlocked
    ? 'blocked'
    : humanMustDoCount > 0
    ? 'needs-human-once'
    : 'clear';

  const nonSkippableHuman = steps.filter(
    (s) => !s.canSkipForNow && (s.type === 'manual-gate' || s.humanEffort === 'manual-gate')
  );

  let canBeLazySummary = '全部自動で進められます 😴';
  if (nonSkippableHuman.length > 0) {
    canBeLazySummary = `人間が必要なのは「${nonSkippableHuman.map((s) => s.label).join('」「')}」だけです`;
  }
  if (hasBlocked) {
    canBeLazySummary = 'ブロック中のステップがあります。解消してください。';
  }

  return {
    title: '最短だらけルート',
    status,
    steps,
    humanMustDoCount,
    autoCanDoCount,
    canBeLazySummary,
  };
}

export function formatShortestDarakePathMarkdown(path: ShortestDarakePath): string {
  const statusEmoji = path.status === 'clear' ? '😴' : path.status === 'blocked' ? '🚫' : '👤';
  const lines = [
    `# ${path.title}`,
    `ステータス: ${statusEmoji} ${path.status}`,
    '',
    `## サマリー`,
    `- 自動でよい: ${path.autoCanDoCount}件`,
    `- 人間が必要: ${path.humanMustDoCount}件`,
    '',
    `## だらけ結論`,
    path.canBeLazySummary,
    '',
    `## ステップ`,
  ];
  path.steps.forEach((s, i) => {
    lines.push(`${i + 1}. **${s.label}** [${s.type}]`);
    lines.push(`   - 人間の手間: ${s.humanEffort}`);
    lines.push(`   - 今スキップ可: ${s.canSkipForNow ? 'はい' : 'いいえ'}`);
    lines.push(`   - 理由: ${s.whyNeeded}`);
  });
  return lines.join('\n');
}
