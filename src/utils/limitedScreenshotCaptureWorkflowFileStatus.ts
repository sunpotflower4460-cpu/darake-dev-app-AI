export type LimitedScreenshotCaptureWorkflowFileStatus = {
  title: string;
  status: 'file-added-manual-limited-capture';
  workflowPath: string;
  workflowName: string;
  scriptPath: string;
  dispatchInputs: Array<{
    name: string;
    required: boolean;
    defaultValue?: string;
    note: string;
  }>;
  guards: string[];
  allowedActions: string[];
  blockedActions: string[];
  artifacts: Array<{
    name: string;
    path: string;
    schemaVersion?: string;
    note: string;
  }>;
  nextSteps: string[];
  safetyNotes: string[];
};

export function buildLimitedScreenshotCaptureWorkflowFileStatus(): LimitedScreenshotCaptureWorkflowFileStatus {
  return {
    title: 'Limited Screenshot Capture Workflow File Status',
    status: 'file-added-manual-limited-capture',
    workflowPath: '.github/workflows/screenshot-capture-limited-manual.yml',
    workflowName: 'Screenshot Capture Limited Manual',
    scriptPath: 'scripts/captureLimitedScreenshots.mjs',
    dispatchInputs: [
      {
        name: 'plan_json',
        required: true,
        note: 'アプリで作ったScreenshot Plan Export JSONを貼ります。private情報がないか確認します。',
      },
      {
        name: 'confirm_capture',
        required: true,
        defaultValue: 'CAPTURE_LIMITED_APPROVED',
        note: 'この文字列以外はworkflow側で拒否します。',
      },
      {
        name: 'max_targets',
        required: true,
        defaultValue: '1',
        note: '初回は1推奨。選択肢は1または2だけです。',
      },
    ],
    guards: [
      'confirm_capture must equal CAPTURE_LIMITED_APPROVED',
      'max_targets must be 1 or 2',
      'plan_json schemaVersion must be darake-screenshot-plan-v1',
      'runner.mode must remain draft-only',
      'runner.shouldRunAutomatically must be false',
      'ready targets must exist',
      'viewport must be within safe bounds',
    ],
    allowedActions: [
      'Checkout repository',
      'Setup Node 20',
      'Run npm ci',
      'Install Playwright Chromium',
      'Open only approved ready target URLs from the plan',
      'Capture PNG screenshots for max_targets only',
      'Write screenshot capture manifest',
      'Upload screenshot artifact',
    ],
    blockedActions: [
      'No app-triggered workflow dispatch',
      'No automatic capture from the app',
      'No max_targets greater than 2',
      'No deploy or publish action',
      'No database write action',
      'No App Store action',
      'No private credential-like text in plan_json',
    ],
    artifacts: [
      {
        name: 'screenshot-capture-limited',
        path: 'artifacts/screenshots/**',
        note: 'PNG screenshots are stored here.',
      },
      {
        name: 'screenshot-capture-manifest',
        path: 'artifacts/screenshot-capture-manifest.json',
        schemaVersion: 'darake-screenshot-capture-manifest-v1',
        note: 'Capture result manifest for later result recording.',
      },
    ],
    nextSteps: [
      'Phase 10.24で少数target実撮影workflow手動実行手順カードを追加する',
      'Phase 10.25でcapture manifest確認結果の記録欄を追加する',
      'Phase 10.26以降でScreenshot Result Recordへmanifestを転記しやすくする',
    ],
    safetyNotes: [
      'This workflow is manual dispatch only.',
      'The app still does not trigger GitHub Actions.',
      'The first run should use max_targets=1.',
      'Use only safe preview URLs that do not expose private information.',
      'Artifacts may contain screenshots, so inspect before sharing.',
    ],
  };
}

export function formatLimitedScreenshotCaptureWorkflowFileStatus(status: LimitedScreenshotCaptureWorkflowFileStatus): string {
  return [
    `# ${status.title}`,
    '',
    `- status: ${status.status}`,
    `- workflowPath: ${status.workflowPath}`,
    `- workflowName: ${status.workflowName}`,
    `- scriptPath: ${status.scriptPath}`,
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
    '## Artifacts',
    ...status.artifacts.map((artifact) => `- ${artifact.name}: ${artifact.path}${artifact.schemaVersion ? ` / ${artifact.schemaVersion}` : ''} / ${artifact.note}`),
    '',
    '## Next Steps',
    ...status.nextSteps.map((item) => `- ${item}`),
    '',
    '## Safety Notes',
    ...status.safetyNotes.map((item) => `- ${item}`),
  ].join('\n');
}
