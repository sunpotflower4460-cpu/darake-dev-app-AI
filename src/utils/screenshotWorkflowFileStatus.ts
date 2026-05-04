export type ScreenshotWorkflowFileStatus = {
  title: string;
  status: 'file-added-dry-run-only';
  workflowPath: string;
  workflowName: string;
  dispatchInputs: Array<{
    name: string;
    required: boolean;
    defaultValue?: string;
    note: string;
  }>;
  dryRunGuards: string[];
  blockedActions: string[];
  nextSteps: string[];
};

export function buildScreenshotWorkflowFileStatus(): ScreenshotWorkflowFileStatus {
  return {
    title: 'Dry-run Workflow File Status',
    status: 'file-added-dry-run-only',
    workflowPath: '.github/workflows/screenshot-capture-draft.yml',
    workflowName: 'Screenshot Capture Draft',
    dispatchInputs: [
      {
        name: 'plan_json',
        required: true,
        note: 'Phase 10.9で生成したJSON下書きを貼ります。',
      },
      {
        name: 'dry_run',
        required: true,
        defaultValue: 'true',
        note: 'falseはworkflow内で拒否します。',
      },
      {
        name: 'require_manual_gate',
        required: true,
        defaultValue: 'true',
        note: 'falseはworkflow内で拒否します。',
      },
    ],
    dryRunGuards: [
      'require_manual_gate must be true',
      'dry_run must be true',
      'plan_json must be valid JSON',
      'schemaVersion must be darake-screenshot-plan-v1',
      'runner.mode must be draft-only',
      'runner.shouldRunAutomatically must be false',
    ],
    blockedActions: [
      'No Playwright install',
      'No browser launch',
      'No screenshot capture',
      'No external worker call',
      'No deploy or publish action',
    ],
    nextSteps: [
      'Phase 10.13でworkflow dispatchの手動実行手順カードを追加する',
      'Phase 10.14でdry-run artifactをScreenshot Result Recordへ読み込む導線を検討する',
      'Phase 10.15以降でPlaywright実撮影をmanual-gate付きで追加する',
    ],
  };
}

export function formatScreenshotWorkflowFileStatus(status: ScreenshotWorkflowFileStatus): string {
  return [
    `# ${status.title}`,
    '',
    `- status: ${status.status}`,
    `- workflowPath: ${status.workflowPath}`,
    `- workflowName: ${status.workflowName}`,
    '',
    '## Inputs',
    ...status.dispatchInputs.map((input) => `- ${input.name}: required=${input.required}${input.defaultValue ? `, default=${input.defaultValue}` : ''} / ${input.note}`),
    '',
    '## Dry-run Guards',
    ...status.dryRunGuards.map((item) => `- ${item}`),
    '',
    '## Blocked Actions',
    ...status.blockedActions.map((item) => `- ${item}`),
    '',
    '## Next Steps',
    ...status.nextSteps.map((item) => `- ${item}`),
  ].join('\n');
}
