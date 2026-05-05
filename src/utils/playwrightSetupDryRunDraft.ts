import type { ScreenshotCaptureGate } from './screenshotCaptureGate';

export type PlaywrightSetupDryRunStatus = 'not-ready' | 'ready-to-plan' | 'needs-review';

export type PlaywrightSetupDryRunStep = {
  id: string;
  title: string;
  detail: string;
  risk: 'low' | 'medium';
};

export type PlaywrightSetupDryRunDraft = {
  title: string;
  status: PlaywrightSetupDryRunStatus;
  message: string;
  proposedWorkflowFileName: string;
  proposedWorkflowName: string;
  inputs: Array<{
    name: string;
    required: boolean;
    defaultValue?: string;
    note: string;
  }>;
  jobs: PlaywrightSetupDryRunStep[];
  artifacts: Array<{
    name: string;
    path: string;
    note: string;
  }>;
  successConditions: string[];
  hardStops: string[];
  yamlSketch: string;
  safetyNotes: string[];
};

function buildYamlSketch(): string {
  return [
    'name: Playwright Setup Dry Run',
    '',
    'on:',
    '  workflow_dispatch:',
    '    inputs:',
    '      confirm_setup:',
    '        description: Type PLAYWRIGHT_SETUP_DRY_RUN to allow setup check',
    '        required: true',
    '        type: string',
    '      browser:',
    '        description: Browser to install for setup check',
    '        required: true',
    '        default: chromium',
    '        type: choice',
    '        options:',
    '          - chromium',
    '',
    'permissions:',
    '  contents: read',
    '  actions: read',
    '',
    'jobs:',
    '  setup-dry-run:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - name: Validate manual setup gate',
    '        run: echo "Future phase: require confirm_setup before installing browser"',
    '      - name: Checkout',
    '        uses: actions/checkout@v4',
    '      - name: Setup Node',
    '        uses: actions/setup-node@v4',
    '        with:',
    '          node-version: 20',
    '      - name: Install dependencies',
    '        run: echo "Future phase: npm ci"',
    '      - name: Install Playwright browser only',
    '        run: echo "Future phase: npx playwright install --with-deps chromium"',
    '      - name: Write environment report',
    '        run: echo "Future phase: write artifacts/playwright-setup-report.json"',
    '      - name: Upload setup report',
    '        run: echo "Future phase: upload setup dry-run artifact"',
  ].join('\n');
}

export function buildPlaywrightSetupDryRunDraft(captureGate: ScreenshotCaptureGate): PlaywrightSetupDryRunDraft {
  const status: PlaywrightSetupDryRunStatus = captureGate.status === 'blocked'
    ? 'not-ready'
    : captureGate.status === 'needs-review'
      ? 'needs-review'
      : 'ready-to-plan';

  return {
    title: 'Playwright Setup Dry-run Draft',
    status,
    message: status === 'ready-to-plan'
      ? 'Playwright/Chromium環境確認の設計下書きを作れます。ただし、このPhaseではまだworkflow実ファイル化もインストールも行いません。'
      : status === 'needs-review'
        ? 'Capture Gateに確認項目があります。setup dry-run設計に進む前に注意点を確認します。'
        : 'Capture Gateがblockedです。Playwright setup dry-run設計は保留してください。',
    proposedWorkflowFileName: 'playwright-setup-dry-run.yml',
    proposedWorkflowName: 'Playwright Setup Dry Run',
    inputs: [
      {
        name: 'confirm_setup',
        required: true,
        defaultValue: 'PLAYWRIGHT_SETUP_DRY_RUN',
        note: 'ブラウザ環境確認だけを許可する手入力ゲートです。',
      },
      {
        name: 'browser',
        required: true,
        defaultValue: 'chromium',
        note: '最初はChromiumのみ。Firefox/WebKitは後続Phaseへ回します。',
      },
    ],
    jobs: [
      {
        id: 'validate-setup-gate',
        title: 'Validate setup gate',
        detail: 'confirm_setupが正しい文字列か確認します。',
        risk: 'low',
      },
      {
        id: 'checkout-and-node',
        title: 'Checkout and setup Node',
        detail: 'リポジトリをcheckoutし、Node 20を準備します。',
        risk: 'low',
      },
      {
        id: 'install-dependencies',
        title: 'Install dependencies',
        detail: 'npm ciで依存関係を入れます。',
        risk: 'medium',
      },
      {
        id: 'install-chromium',
        title: 'Install Chromium only',
        detail: 'npx playwright install --with-deps chromium でブラウザ環境だけ確認します。URLアクセスはしません。',
        risk: 'medium',
      },
      {
        id: 'write-report',
        title: 'Write setup report',
        detail: 'Node / npm / Playwright / browser情報をJSON reportとして保存します。',
        risk: 'low',
      },
      {
        id: 'upload-report',
        title: 'Upload setup artifact',
        detail: 'playwright-setup-dry-run artifactとしてreportを保存します。',
        risk: 'low',
      },
    ],
    artifacts: [
      {
        name: 'playwright-setup-dry-run',
        path: 'artifacts/playwright-setup-report.json',
        note: 'ブラウザ環境確認結果だけを保存するartifactです。スクショ画像は含めません。',
      },
    ],
    successConditions: [
      'confirm_setup is PLAYWRIGHT_SETUP_DRY_RUN',
      'Node setup succeeds',
      'npm dependencies install succeeds',
      'Playwright Chromium install succeeds',
      'setup report artifact is uploaded',
      'no URL is opened',
      'no screenshot is captured',
    ],
    hardStops: [
      'Capture Gate is blocked',
      'confirm_setup is missing or incorrect',
      'workflow tries to open Preview URL',
      'workflow tries to capture screenshots',
      'workflow tries to deploy, publish, or mutate production data',
      'workflow asks for secrets / cookies / tokens / keys',
    ],
    yamlSketch: buildYamlSketch(),
    safetyNotes: [
      'Phase 10.18 is setup-draft only.',
      'No workflow file is added in this phase.',
      'No Playwright install is executed by the app.',
      'No browser is launched.',
      'No URL is opened.',
      'No screenshot is captured.',
      `Current Capture Gate status: ${captureGate.status}`,
    ],
  };
}

export function formatPlaywrightSetupDryRunDraft(draft: PlaywrightSetupDryRunDraft): string {
  return [
    `# ${draft.title}`,
    '',
    draft.message,
    '',
    `- status: ${draft.status}`,
    `- proposedWorkflowFileName: ${draft.proposedWorkflowFileName}`,
    `- proposedWorkflowName: ${draft.proposedWorkflowName}`,
    '',
    '## Inputs',
    ...draft.inputs.map((input) => `- ${input.name}: required=${input.required}${input.defaultValue ? `, default=${input.defaultValue}` : ''} / ${input.note}`),
    '',
    '## Jobs',
    ...draft.jobs.map((job) => `- [${job.risk}] ${job.title}: ${job.detail}`),
    '',
    '## Artifacts',
    ...draft.artifacts.map((artifact) => `- ${artifact.name}: ${artifact.path} / ${artifact.note}`),
    '',
    '## Success Conditions',
    ...draft.successConditions.map((item) => `- ${item}`),
    '',
    '## Hard Stops',
    ...draft.hardStops.map((item) => `- ${item}`),
    '',
    '## YAML Sketch',
    '```yaml',
    draft.yamlSketch,
    '```',
    '',
    '## Safety Notes',
    ...draft.safetyNotes.map((item) => `- ${item}`),
  ].join('\n');
}
