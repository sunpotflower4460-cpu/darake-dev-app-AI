export type GitHubDryRunOperationType =
  | 'create-issue'
  | 'create-pr'
  | 'dispatch-workflow'
  | 'merge-pr'
  | 'comment-pr'
  | 'create-branch'
  | 'create-release'
  | 'close-issue';

export type GitHubDryRunRisk =
  | 'safe-draft'
  | 'review-needed'
  | 'manual-gate'
  | 'blocked';

export type GitHubDryRunOperation = {
  id: string;
  type: GitHubDryRunOperationType;
  title: string;
  targetRepo: string;
  targetBranch: string;
  baseBranch: string;
  risk: GitHubDryRunRisk;
  summary: string;
  reason: string;
  payloadPreview: string;
  manualSteps: string[];
  stopIf: string[];
  afterRunRecordTemplate: string;
  requiredHumanAction: string;
  createdAt: string;
};

export function buildGitHubDryRunOperation(
  partial: Partial<GitHubDryRunOperation> & Pick<GitHubDryRunOperation, 'type' | 'title' | 'targetRepo'>
): GitHubDryRunOperation {
  const risk = classifyGitHubDryRunRisk(partial.type);
  return {
    id: `github-op-${crypto.randomUUID()}`,
    targetBranch: '',
    baseBranch: 'main',
    summary: '',
    reason: '',
    payloadPreview: '',
    manualSteps: [],
    stopIf: [],
    afterRunRecordTemplate: '',
    requiredHumanAction: '',
    createdAt: new Date().toISOString(),
    ...partial,
    risk: partial.risk ?? risk,
  };
}

export function classifyGitHubDryRunRisk(type: GitHubDryRunOperationType): GitHubDryRunRisk {
  switch (type) {
    case 'create-issue':
      return 'safe-draft';
    case 'comment-pr':
      return 'safe-draft';
    case 'create-pr':
      return 'review-needed';
    case 'create-branch':
      return 'review-needed';
    case 'dispatch-workflow':
      return 'manual-gate';
    case 'create-release':
      return 'manual-gate';
    case 'merge-pr':
      return 'manual-gate';
    case 'close-issue':
      return 'review-needed';
    default:
      return 'blocked';
  }
}

export function summarizeGitHubDryRunOperation(op: GitHubDryRunOperation): string {
  return [
    `[${op.type}] ${op.title}`,
    `repo: ${op.targetRepo}`,
    `risk: ${op.risk}`,
    op.summary ? `summary: ${op.summary}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatGitHubDryRunOperationMarkdown(op: GitHubDryRunOperation): string {
  const lines: string[] = [
    `## GitHub Dry-run: ${op.title}`,
    '',
    `- **type**: ${op.type}`,
    `- **repo**: ${op.targetRepo}`,
    `- **targetBranch**: ${op.targetBranch || '(none)'}`,
    `- **baseBranch**: ${op.baseBranch}`,
    `- **risk**: ${op.risk}`,
    `- **createdAt**: ${op.createdAt}`,
    '',
    `### Summary`,
    op.summary || '(none)',
    '',
    `### Reason`,
    op.reason || '(none)',
    '',
    `### Payload Preview`,
    '```',
    op.payloadPreview || '(none)',
    '```',
    '',
    `### Manual Steps`,
    ...(op.manualSteps.length > 0 ? op.manualSteps.map((s, i) => `${i + 1}. ${s}`) : ['(none)']),
    '',
    `### Stop If`,
    ...(op.stopIf.length > 0 ? op.stopIf.map((s) => `- ${s}`) : ['(none)']),
    '',
    `### After Run Record Template`,
    op.afterRunRecordTemplate || '(none)',
    '',
    `### Required Human Action`,
    op.requiredHumanAction || '(none)',
    '',
    `> ⛔ これは dry-run です。GitHub API は実行しません。`,
  ];
  return lines.join('\n');
}
