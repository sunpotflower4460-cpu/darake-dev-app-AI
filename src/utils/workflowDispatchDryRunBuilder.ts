export type WorkflowDispatchDryRunInput = {
  name: string;
  value: string;
  safeToCopy: boolean;
  note: string;
};

export type WorkflowDispatchDryRun = {
  title: string;
  status: 'blocked' | 'ready-to-copy' | 'needs-review';
  workflowName: string;
  workflowPath: string;
  ref: string;
  inputs: WorkflowDispatchDryRunInput[];
  manualSteps: string[];
  stopIf: string[];
  afterRunChecks: string[];
  blockers: string[];
  targetRepo: string;
};

function detectSecretInputs(inputs: WorkflowDispatchDryRunInput[]): string[] {
  const sensitivePatterns = /token|secret|key|password|credential|api[-_]?key/i;
  return inputs
    .filter((i) => sensitivePatterns.test(i.name) || !i.safeToCopy)
    .map((i) => i.name);
}

export function buildWorkflowDispatchDryRun(
  partial: Partial<WorkflowDispatchDryRun> &
    Pick<WorkflowDispatchDryRun, 'workflowName' | 'targetRepo'>
): WorkflowDispatchDryRun {
  const inputs = partial.inputs ?? [];
  const secretInputs = detectSecretInputs(inputs);
  const existingBlockers = partial.blockers ?? [];
  const blockers = secretInputs.length > 0
    ? [...existingBlockers, `secret系の入力が含まれています: ${secretInputs.join(', ')}`]
    : existingBlockers;
  const status: WorkflowDispatchDryRun['status'] = blockers.length > 0 ? 'blocked' : 'ready-to-copy';

  return {
    title: partial.workflowName,
    workflowPath: `.github/workflows/${partial.workflowName}.yml`,
    ref: 'main',
    manualSteps: [
      `1. GitHub の ${partial.targetRepo} → Actions を開く`,
      `2. ワークフロー「${partial.workflowName}」を選択する`,
      '3. Run workflow をクリックする',
      '4. 入力値を設定する（コピーして貼り付ける）',
      '5. Run workflow を実行する',
    ],
    stopIf: [
      'CI が失敗中の場合',
      'secret入力欄がある場合はblocked扱い',
      '本番deploy/publishが含まれる場合',
    ],
    afterRunChecks: [
      'workflow run の結果を確認する',
      'エラーがあれば記録する',
      '成功したら GitHub Execution Record に記録する',
    ],
    ...partial,
    inputs,
    blockers,
    status,
  };
}

export function formatWorkflowDispatchDryRunMarkdown(dryRun: WorkflowDispatchDryRun): string {
  const lines: string[] = [
    `## Workflow Dispatch Dry-run: ${dryRun.workflowName}`,
    '',
    `- **status**: ${dryRun.status}`,
    `- **repo**: ${dryRun.targetRepo}`,
    `- **workflowPath**: ${dryRun.workflowPath}`,
    `- **ref**: ${dryRun.ref}`,
    '',
    `### Inputs`,
    ...(dryRun.inputs.length > 0
      ? dryRun.inputs.map((i) => `- ${i.name}: \`${i.safeToCopy ? i.value : '(blocked)'}\` — ${i.note}`)
      : ['(なし)']),
    '',
    `### Manual Steps`,
    ...dryRun.manualSteps.map((s) => `- ${s}`),
    '',
    `### Stop If`,
    ...dryRun.stopIf.map((s) => `- ⛔ ${s}`),
    '',
    `### After Run Checks`,
    ...dryRun.afterRunChecks.map((c) => `- [ ] ${c}`),
    '',
    `### Blockers`,
    dryRun.blockers.length > 0 ? dryRun.blockers.map((b) => `- ⛔ ${b}`).join('\n') : '(なし)',
    '',
    `> ⛔ これは dry-run です。workflow dispatch は実行しません。`,
  ];
  return lines.join('\n');
}
