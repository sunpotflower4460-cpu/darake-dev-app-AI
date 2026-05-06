import type { GitHubDryRunRisk } from './githubDryRunOperation';

export type IssueCreationDryRun = {
  title: string;
  status: 'blocked' | 'ready-to-copy' | 'needs-review';
  repo: string;
  issueTitle: string;
  issueBody: string;
  labels: string[];
  milestone: string;
  assignees: string[];
  risk: GitHubDryRunRisk;
  blockers: string[];
  warnings: string[];
  manualSteps: string[];
};

export function buildIssueCreationDryRun(
  partial: Partial<IssueCreationDryRun> & Pick<IssueCreationDryRun, 'repo' | 'issueTitle'>
): IssueCreationDryRun {
  const blockers = partial.blockers ?? [];
  const status: IssueCreationDryRun['status'] = blockers.length > 0 ? 'blocked' : 'ready-to-copy';

  return {
    title: partial.issueTitle,
    issueBody: '',
    labels: [],
    milestone: '',
    assignees: [],
    risk: 'safe-draft',
    warnings: [],
    manualSteps: [
      `1. GitHub の ${partial.repo} を開く`,
      '2. Issues → New Issue をクリック',
      '3. タイトルをコピーして貼り付ける',
      '4. 本文をコピーして貼り付ける',
      '5. ラベル・milestone・assigneesを設定する',
      '6. Submit new issue をクリックする',
    ],
    ...partial,
    status,
    blockers,
  };
}

export function formatIssueCreationDryRunMarkdown(dryRun: IssueCreationDryRun): string {
  const lines: string[] = [
    `## Issue Creation Dry-run: ${dryRun.issueTitle}`,
    '',
    `- **status**: ${dryRun.status}`,
    `- **repo**: ${dryRun.repo}`,
    `- **risk**: ${dryRun.risk}`,
    '',
    `### Issue Title`,
    dryRun.issueTitle,
    '',
    `### Issue Body`,
    dryRun.issueBody || '(未入力)',
    '',
    `### Labels`,
    dryRun.labels.length > 0 ? dryRun.labels.join(', ') : '(なし)',
    '',
    `### Milestone`,
    dryRun.milestone || '(なし)',
    '',
    `### Assignees`,
    dryRun.assignees.length > 0 ? dryRun.assignees.join(', ') : '(なし)',
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
    `> ⛔ これは dry-run です。Issue の自動作成はしません。`,
  ];
  return lines.join('\n');
}
