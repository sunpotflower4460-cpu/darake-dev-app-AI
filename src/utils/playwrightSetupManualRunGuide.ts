export type PlaywrightSetupManualRunStep = {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
};

export type PlaywrightSetupManualRunGuide = {
  title: string;
  status: 'manual-only';
  workflowPath: string;
  workflowName: string;
  actionsPageHint: string;
  steps: PlaywrightSetupManualRunStep[];
  requiredInputs: Array<{
    name: string;
    value: string;
    source: string;
  }>;
  stopIf: string[];
  afterRunChecks: string[];
  artifactChecks: Array<{
    label: string;
    expected: string;
  }>;
  safetyNotes: string[];
};

export function buildPlaywrightSetupManualRunGuide(): PlaywrightSetupManualRunGuide {
  return {
    title: 'Playwright Setup Manual Run Guide',
    status: 'manual-only',
    workflowPath: '.github/workflows/playwright-setup-dry-run.yml',
    workflowName: 'Playwright Setup Dry Run',
    actionsPageHint: 'GitHub → darake-dev-app-AI → Actions → Playwright Setup Dry Run',
    steps: [
      {
        id: 'open-actions',
        title: 'Actionsを開く',
        detail: 'GitHubのリポジトリ画面でActionsタブを開きます。',
        actionLabel: 'Actionsへ移動',
      },
      {
        id: 'select-workflow',
        title: 'Playwright Setup Dry Runを選ぶ',
        detail: '左側のworkflow一覧からPlaywright Setup Dry Runを選びます。',
        actionLabel: 'workflowを選択',
      },
      {
        id: 'run-workflow',
        title: 'Run workflowを開く',
        detail: 'Run workflowボタンを押して入力欄を開きます。',
        actionLabel: '入力欄を開く',
      },
      {
        id: 'input-confirm-setup',
        title: 'confirm_setupを入力する',
        detail: 'confirm_setupにPLAYWRIGHT_SETUP_DRY_RUNを入力します。1文字でも違うとworkflow側で停止します。',
        actionLabel: 'confirm_setupを入力',
      },
      {
        id: 'keep-browser',
        title: 'browser=chromiumを維持する',
        detail: 'browserはchromiumのままにします。最初はChromiumだけを確認します。',
        actionLabel: 'browserを確認',
      },
      {
        id: 'submit-setup',
        title: 'setup dry-runとして実行する',
        detail: '内容を確認してRun workflowを押します。このworkflowは環境確認とreport保存だけです。',
        actionLabel: 'setup dry-run実行',
      },
      {
        id: 'check-result',
        title: '結果を確認する',
        detail: 'workflow runがsuccessになり、playwright-setup-dry-run artifactが作られているか確認します。',
        actionLabel: '結果確認',
      },
      {
        id: 'check-report',
        title: 'reportを確認する',
        detail: 'artifacts/playwright-setup-report.jsonのschemaVersionと各falseフラグを確認します。',
        actionLabel: 'report確認',
      },
    ],
    requiredInputs: [
      {
        name: 'confirm_setup',
        value: 'PLAYWRIGHT_SETUP_DRY_RUN',
        source: '固定。違う値は禁止。',
      },
      {
        name: 'browser',
        value: 'chromium',
        source: '固定。最初はChromiumのみ。',
      },
    ],
    stopIf: [
      'Playwright Setup Dry Run workflowが見つからない',
      'confirm_setupを正確に入力できない',
      'browserがchromium以外になっている',
      'Preview URLの入力欄が出てきた',
      '画面撮影やURLアクセスを求める入力が出てきた',
      'deployやpublishに関係する入力が出てきた',
      'private credential inputを求められた',
    ],
    afterRunChecks: [
      'workflow runがsuccessになったか',
      'playwright-setup-dry-run artifactが生成されたか',
      'artifacts/playwright-setup-report.jsonが含まれるか',
      'schemaVersionがdarake-playwright-setup-dry-run-v1か',
      'openedUrl=falseか',
      'capturedScreenshot=falseか',
      'launchedBrowser=falseか',
    ],
    artifactChecks: [
      {
        label: 'artifact name',
        expected: 'playwright-setup-dry-run',
      },
      {
        label: 'report file',
        expected: 'artifacts/playwright-setup-report.json',
      },
      {
        label: 'schemaVersion',
        expected: 'darake-playwright-setup-dry-run-v1',
      },
      {
        label: 'openedUrl',
        expected: 'false',
      },
      {
        label: 'capturedScreenshot',
        expected: 'false',
      },
      {
        label: 'launchedBrowser',
        expected: 'false',
      },
    ],
    safetyNotes: [
      'This guide is manual-only.',
      'The app does not dispatch GitHub Actions.',
      'The setup workflow does not open Preview URL.',
      'The setup workflow does not capture screenshots.',
      'The setup workflow only verifies dependency and Chromium setup.',
    ],
  };
}

export function formatPlaywrightSetupManualRunGuide(guide: PlaywrightSetupManualRunGuide): string {
  return [
    `# ${guide.title}`,
    '',
    `- status: ${guide.status}`,
    `- workflowPath: ${guide.workflowPath}`,
    `- workflowName: ${guide.workflowName}`,
    `- actionsPageHint: ${guide.actionsPageHint}`,
    '',
    '## Steps',
    ...guide.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.detail}`),
    '',
    '## Required Inputs',
    ...guide.requiredInputs.map((input) => `- ${input.name}: ${input.value} / ${input.source}`),
    '',
    '## Stop If',
    ...guide.stopIf.map((item) => `- ${item}`),
    '',
    '## After Run Checks',
    ...guide.afterRunChecks.map((item) => `- ${item}`),
    '',
    '## Artifact Checks',
    ...guide.artifactChecks.map((item) => `- ${item.label}: ${item.expected}`),
    '',
    '## Safety Notes',
    ...guide.safetyNotes.map((item) => `- ${item}`),
  ].join('\n');
}
