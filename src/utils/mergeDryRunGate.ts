export type MergeCheckStatus = 'pass' | 'warn' | 'fail' | 'unchecked';

export type MergeCheck = {
  label: string;
  status: MergeCheckStatus;
  detail: string;
};

export type MergeDryRunGate = {
  title: string;
  status: 'blocked' | 'ready-for-manual-merge' | 'needs-review';
  prNumber: string;
  checks: MergeCheck[];
  blockers: string[];
  warnings: string[];
  manualMergeSteps: string[];
  targetRepo: string;
};

const DEFAULT_CHECKS: MergeCheck[] = [
  { label: 'CI 成功', status: 'unchecked', detail: 'GitHub Actions の CI が全て通過しているか' },
  { label: 'Typecheck 成功', status: 'unchecked', detail: 'npm run typecheck が通過しているか' },
  { label: 'Build 成功', status: 'unchecked', detail: 'npm run build が通過しているか' },
  { label: 'Snapshot 確認', status: 'unchecked', detail: 'スナップショットが最新か' },
  { label: 'CodeRabbit blockなし', status: 'unchecked', detail: 'CodeRabbit で block コメントがないか' },
  { label: '差分がPhase目的内', status: 'unchecked', detail: '変更がPhaseのスコープを超えていないか' },
  { label: 'secretなし', status: 'unchecked', detail: 'secret / token / API key が含まれていないか' },
  { label: 'DB/auth/billing変更なし', status: 'unchecked', detail: 'DB・認証・課金に関わる変更がないか' },
  { label: 'App Store/production変更なし', status: 'unchecked', detail: 'App Store や本番への影響がないか' },
  { label: 'human確認済み', status: 'unchecked', detail: '人間が内容を確認したか' },
];

export function buildMergeDryRunGate(
  partial: Partial<MergeDryRunGate> & Pick<MergeDryRunGate, 'prNumber' | 'targetRepo'>
): MergeDryRunGate {
  const checks = partial.checks ?? DEFAULT_CHECKS.map((c) => ({ ...c }));
  const failedChecks = checks.filter((c) => c.status === 'fail');
  const blockers = partial.blockers ?? [];
  const allBlockers = [
    ...blockers,
    ...failedChecks.map((c) => `チェック失敗: ${c.label}`),
  ];
  const warnings = partial.warnings ?? checks.filter((c) => c.status === 'warn').map((c) => `要確認: ${c.label}`);
  const status: MergeDryRunGate['status'] =
    allBlockers.length > 0
      ? 'blocked'
      : checks.some((c) => c.status === 'unchecked' || c.status === 'warn')
      ? 'needs-review'
      : 'ready-for-manual-merge';

  return {
    title: `PR #${partial.prNumber} Merge Dry-run Gate`,
    manualMergeSteps: [
      `1. GitHub の ${partial.targetRepo} → PR #${partial.prNumber} を開く`,
      '2. 全チェックが pass になっているか確認する',
      '3. Merge pull request をクリックする',
      '4. Confirm merge をクリックする',
      '5. GitHub Execution Record に記録する',
    ],
    ...partial,
    checks,
    blockers: allBlockers,
    warnings,
    status,
  };
}

export function formatMergeDryRunGateMarkdown(gate: MergeDryRunGate): string {
  const lines: string[] = [
    `## Merge Dry-run Gate: PR #${gate.prNumber}`,
    '',
    `- **status**: ${gate.status}`,
    `- **repo**: ${gate.targetRepo}`,
    '',
    `### Checks`,
    ...gate.checks.map((c) => {
      const icon = c.status === 'pass' ? '✅' : c.status === 'fail' ? '❌' : c.status === 'warn' ? '⚠️' : '⬜';
      return `- ${icon} **${c.label}**: ${c.detail}`;
    }),
    '',
    `### Blockers`,
    gate.blockers.length > 0 ? gate.blockers.map((b) => `- ⛔ ${b}`).join('\n') : '(なし)',
    '',
    `### Warnings`,
    gate.warnings.length > 0 ? gate.warnings.map((w) => `- ⚠️ ${w}`).join('\n') : '(なし)',
    '',
    `### Manual Merge Steps`,
    ...gate.manualMergeSteps.map((s) => `- ${s}`),
    '',
    `> ⛔ これは dry-run です。PR の自動 merge はしません。`,
  ];
  return lines.join('\n');
}

export { DEFAULT_CHECKS as DEFAULT_MERGE_CHECKS };
