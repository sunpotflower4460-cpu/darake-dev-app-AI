import type { GitHubDryRunRisk } from './githubDryRunOperation';

export type PrCreationDryRun = {
  title: string;
  status: 'blocked' | 'ready-to-copy' | 'needs-review';
  headBranch: string;
  baseBranch: string;
  prTitle: string;
  prBody: string;
  linkedIssues: string[];
  checklist: string[];
  blockers: string[];
  warnings: string[];
  manualSteps: string[];
  risk: GitHubDryRunRisk;
  targetRepo: string;
};

export function buildPrCreationDryRun(
  partial: Partial<PrCreationDryRun> & Pick<PrCreationDryRun, 'headBranch' | 'prTitle' | 'targetRepo'>
): PrCreationDryRun {
  const blockers = partial.blockers ?? [];
  const status: PrCreationDryRun['status'] = blockers.length > 0 ? 'blocked' : 'ready-to-copy';

  return {
    title: partial.prTitle,
    baseBranch: 'main',
    prBody: '',
    linkedIssues: [],
    checklist: [
      'typecheck 通過',
      'build 通過',
      'snapshot 確認',
      '差分がPhase目的内',
      'secret/token なし',
    ],
    warnings: [],
    risk: 'review-needed',
    manualSteps: [
      `1. GitHub の ${partial.targetRepo} を開く`,
      `2. Compare & pull request をクリック（branch: ${partial.headBranch} → ${partial.baseBranch ?? 'main'}）`,
      '3. PRタイトルをコピーして貼り付ける',
      '4. PR本文をコピーして貼り付ける',
      '5. linked issuesを設定する',
      '6. Create pull request をクリックする',
    ],
    ...partial,
    status,
    blockers,
  };
}

export function formatPrCreationDryRunMarkdown(dryRun: PrCreationDryRun): string {
  const lines: string[] = [
    `## PR Creation Dry-run: ${dryRun.prTitle}`,
    '',
    `- **status**: ${dryRun.status}`,
    `- **repo**: ${dryRun.targetRepo}`,
    `- **head**: ${dryRun.headBranch}`,
    `- **base**: ${dryRun.baseBranch}`,
    `- **risk**: ${dryRun.risk}`,
    '',
    `### PR Title`,
    dryRun.prTitle,
    '',
    `### PR Body`,
    dryRun.prBody || '(未入力)',
    '',
    `### Linked Issues`,
    dryRun.linkedIssues.length > 0 ? dryRun.linkedIssues.join(', ') : '(なし)',
    '',
    `### Checklist`,
    ...dryRun.checklist.map((c) => `- [ ] ${c}`),
    '',
    `### Manual Steps`,
    ...dryRun.manualSteps.map((s) => `- ${s}`),
    '',
    `### Blockers`,
    dryRun.blockers.length > 0 ? dryRun.blockers.map((b) => `- ⛔ ${b}`).join('\n') : '(なし)',
    '',
    `### Warnings`,
    dryRun.warnings.length > 0 ? dryRun.warnings.map((w) => `- ⚠️ ${w}`).join('\n') : '(なし)',
    '',
    `> ⛔ これは dry-run です。PR の自動作成はしません。`,
  ];
  return lines.join('\n');
}
