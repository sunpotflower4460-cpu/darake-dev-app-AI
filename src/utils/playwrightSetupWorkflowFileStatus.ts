export type PlaywrightSetupWorkflowFileStatus = {
  title: string;
  status: 'file-added-setup-dry-run-only';
  workflowPath: string;
  workflowName: string;
  dispatchInputs: Array<{
    name: string;
    required: boolean;
    defaultValue?: string;
    note: string;
  }>;
  guards: string[];
  allowedActions: string[];
  blockedActions: string[];
  artifact: {
    name: string;
    path: string;
    schemaVersion: string;
  };
  nextSteps: string[];
};

export function buildPlaywrightSetupWorkflowFileStatus(): PlaywrightSetupWorkflowFileStatus {
  return {
    title: 'Playwright Setup Workflow File Status',
    status: 'file-added-setup-dry-run-only',
    workflowPath: '.github/workflows/playwright-setup-dry-run.yml',
    workflowName: 'Playwright Setup Dry Run',
    dispatchInputs: [
      {
        name: 'confirm_setup',
        required: true,
        defaultValue: 'PLAYWRIGHT_SETUP_DRY_RUN',
        note: 'この文字列以外はworkflow側で拒否します。',
      },
      {
        name: 'browser',
        required: true,
        defaultValue: 'chromium',
        note: '最初はChromiumだけを許可します。',
      },
    ],
    guards: [
      'confirm_setup must equal PLAYWRIGHT_SETUP_DRY_RUN',
      'browser must equal chromium',
      'workflow_dispatch only',
      'contents/actions permission are read-only',
    ],
    allowedActions: [
      'Checkout repository',
      'Setup Node 20',
      'Run npm ci',
      'Install Playwright Chromium dependencies',
      'Write setup report JSON',
      'Upload setup report artifact',
    ],
    blockedActions: [
      'No Preview URL open',
      'No page navigation browser launch',
      'No screenshot capture',
      'No external worker call',
      'No deploy or publish action',
      'No private credential input required',
    ],
    artifact: {
      name: 'playwright-setup-dry-run',
      path: 'artifacts/playwright-setup-report.json',
      schemaVersion: 'darake-playwright-setup-dry-run-v1',
    },
    nextSteps: [
      'Phase 10.20でPlaywright setup dry-run手動実行手順カードを追加する',
      'Phase 10.21でsetup report確認結果の記録欄を追加する',
      'Phase 10.22以降で少数targetの実撮影workflowをmanual gate付きで追加する',
    ],
  };
}

export function formatPlaywrightSetupWorkflowFileStatus(status: PlaywrightSetupWorkflowFileStatus): string {
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
    '## Guards',
    ...status.guards.map((item) => `- ${item}`),
    '',
    '## Allowed Actions',
    ...status.allowedActions.map((item) => `- ${item}`),
    '',
    '## Blocked Actions',
    ...status.blockedActions.map((item) => `- ${item}`),
    '',
    '## Artifact',
    `- name: ${status.artifact.name}`,
    `- path: ${status.artifact.path}`,
    `- schemaVersion: ${status.artifact.schemaVersion}`,
    '',
    '## Next Steps',
    ...status.nextSteps.map((item) => `- ${item}`),
  ].join('\n');
}
