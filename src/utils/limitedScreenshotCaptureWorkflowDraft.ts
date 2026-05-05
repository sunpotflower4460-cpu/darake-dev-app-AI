import type { PlaywrightSetupReportRecord } from './playwrightSetupReportRecord';
import { summarizePlaywrightSetupReportRecord } from './playwrightSetupReportRecord';
import type { ScreenshotCaptureGate } from './screenshotCaptureGate';
import type { ScreenshotPlanExport } from './screenshotPlanExport';

export type LimitedScreenshotCaptureWorkflowStatus = 'not-ready' | 'ready-to-plan' | 'needs-review';

export type LimitedScreenshotCaptureStep = {
  id: string;
  title: string;
  detail: string;
  risk: 'low' | 'medium' | 'high';
};

export type LimitedScreenshotCaptureWorkflowDraft = {
  title: string;
  status: LimitedScreenshotCaptureWorkflowStatus;
  message: string;
  proposedWorkflowFileName: string;
  proposedWorkflowName: string;
  inputs: Array<{
    name: string;
    required: boolean;
    defaultValue?: string;
    note: string;
  }>;
  jobs: LimitedScreenshotCaptureStep[];
  artifacts: Array<{
    name: string;
    path: string;
    note: string;
  }>;
  preflightChecks: string[];
  hardStops: string[];
  manifestFields: string[];
  yamlSketch: string;
  safetyNotes: string[];
};

function buildYamlSketch(): string {
  return [
    'name: Screenshot Capture Limited Manual',
    '',
    'on:',
    '  workflow_dispatch:',
    '    inputs:',
    '      plan_json:',
    '        description: Screenshot plan JSON from the app',
    '        required: true',
    '        type: string',
    '      confirm_capture:',
    '        description: Type CAPTURE_LIMITED_APPROVED to allow limited capture',
    '        required: true',
    '        type: string',
    '      max_targets:',
    '        description: First capture batch size, 1 or 2 only',
    '        required: true',
    '        default: "1"',
    '        type: choice',
    '        options:',
    '          - "1"',
    '          - "2"',
    '',
    'permissions:',
    '  contents: read',
    '  actions: read',
    '',
    'jobs:',
    '  capture-limited:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - name: Validate manual capture gate',
    '        run: echo "Future phase: confirm_capture must be CAPTURE_LIMITED_APPROVED"',
    '      - name: Validate plan JSON and target limit',
    '        run: echo "Future phase: schema, max_targets, ready targets, and safe URL checks"',
    '      - name: Checkout',
    '        uses: actions/checkout@v4',
    '      - name: Setup Node',
    '        uses: actions/setup-node@v4',
    '        with:',
    '          node-version: 20',
    '      - name: Install dependencies and Chromium',
    '        run: echo "Future phase: npm ci && npx playwright install --with-deps chromium"',
    '      - name: Capture approved targets only',
    '        run: echo "Future phase: open only safe preview URLs from plan, max_targets only"',
    '      - name: Write capture manifest',
    '        run: echo "Future phase: write artifacts/screenshot-capture-manifest.json"',
    '      - name: Upload screenshot artifacts',
    '        run: echo "Future phase: upload PNGs and manifest"',
  ].join('\n');
}

export function buildLimitedScreenshotCaptureWorkflowDraft(
  captureGate: ScreenshotCaptureGate,
  setupRecord: PlaywrightSetupReportRecord,
  plan: ScreenshotPlanExport,
): LimitedScreenshotCaptureWorkflowDraft {
  const setupSummary = summarizePlaywrightSetupReportRecord(setupRecord);
  const hasReadyTargets = plan.targets.length > 0;
  const hasBaseUrl = Boolean(plan.source.baseUrl.trim());
  const isBlocked = captureGate.status === 'blocked' || !setupSummary.canProceedToCaptureWorkflow || !hasReadyTargets || !hasBaseUrl;
  const hasReview = captureGate.status === 'needs-review' || plan.blockedTargets.length > 0;

  const status: LimitedScreenshotCaptureWorkflowStatus = isBlocked
    ? 'not-ready'
    : hasReview
      ? 'needs-review'
      : 'ready-to-plan';

  return {
    title: 'Limited Screenshot Capture Workflow Draft',
    status,
    message: status === 'ready-to-plan'
      ? '少数targetの実撮影workflow設計へ進めます。ただし、このPhaseではまだworkflow実ファイル化も撮影も行いません。'
      : status === 'needs-review'
        ? '撮影設計へ進める可能性はありますが、blockedTargetsやreview項目を確認してください。'
        : '実撮影workflow設計は保留です。Capture Gate、Playwright setup report、Preview URL、ready targetsを確認してください。',
    proposedWorkflowFileName: 'screenshot-capture-limited-manual.yml',
    proposedWorkflowName: 'Screenshot Capture Limited Manual',
    inputs: [
      {
        name: 'plan_json',
        required: true,
        note: 'Screenshot Plan Export JSONを貼ります。実行前にprivate情報が入っていないか確認します。',
      },
      {
        name: 'confirm_capture',
        required: true,
        defaultValue: 'CAPTURE_LIMITED_APPROVED',
        note: '実撮影を許可する手入力ゲートです。',
      },
      {
        name: 'max_targets',
        required: true,
        defaultValue: '1',
        note: '初回は1、最大でも2だけを許可します。',
      },
    ],
    jobs: [
      {
        id: 'validate-capture-gate',
        title: 'Validate manual capture gate',
        detail: 'confirm_capture、max_targets、schemaVersion、runner flagsを検証します。',
        risk: 'low',
      },
      {
        id: 'preflight-plan',
        title: 'Preflight plan safety check',
        detail: 'ready targets、baseUrl、private情報らしき文字列、URL形式、target数を確認します。',
        risk: 'medium',
      },
      {
        id: 'setup-runtime',
        title: 'Setup runtime',
        detail: 'Node 20、npm ci、Chromium setupを行います。',
        risk: 'medium',
      },
      {
        id: 'capture-approved-targets',
        title: 'Capture approved targets',
        detail: 'max_targets以内のready targetだけを開き、PNGを保存します。',
        risk: 'high',
      },
      {
        id: 'write-manifest',
        title: 'Write capture manifest',
        detail: 'capturedAt、targetId、viewport、imagePath、statusをmanifestへ記録します。',
        risk: 'low',
      },
      {
        id: 'upload-artifacts',
        title: 'Upload artifacts',
        detail: 'PNGとmanifestをscreenshot-capture-limited artifactとして保存します。',
        risk: 'low',
      },
    ],
    artifacts: [
      {
        name: 'screenshot-capture-limited',
        path: 'artifacts/screenshots/**',
        note: '少数targetのPNGとmanifestをまとめます。',
      },
      {
        name: 'screenshot-capture-manifest',
        path: 'artifacts/screenshot-capture-manifest.json',
        note: 'Screenshot Result Recordへ転記するための結果一覧です。',
      },
    ],
    preflightChecks: [
      'Capture Gate is not blocked',
      'Playwright setup report is success',
      'Preview URL is present',
      'ready target count is 1 or more',
      'max_targets is 1 or 2 only',
      'plan_json schemaVersion is darake-screenshot-plan-v1',
      'runner.mode remains draft-only in the source plan',
      'plan includes no private credential-like text',
    ],
    hardStops: [
      'Capture Gate is blocked',
      'Playwright setup report is failed, warn, or unchecked',
      'Preview URL is empty',
      'ready targets are empty',
      'max_targets is greater than 2',
      'confirm_capture is missing or incorrect',
      'plan_json includes private credential-like text',
      'workflow attempts deploy, publish, database write, or App Store action',
    ],
    manifestFields: [
      'schemaVersion',
      'capturedAt',
      'source.baseUrl',
      'targetId',
      'targetPath',
      'viewportName',
      'viewportWidth',
      'viewportHeight',
      'imagePath',
      'status',
      'notes',
    ],
    yamlSketch: buildYamlSketch(),
    safetyNotes: [
      'Phase 10.22 is design-draft only.',
      'No workflow file is added in this phase.',
      'No URL is opened by the app.',
      'No screenshot is captured in this phase.',
      'The first real run should capture only 1 target.',
      `Current ready targets in plan: ${plan.targets.length}`,
      `Current blocked targets in plan: ${plan.blockedTargets.length}`,
      `Playwright setup report summary: ${setupSummary.status}`,
    ],
  };
}

export function formatLimitedScreenshotCaptureWorkflowDraft(draft: LimitedScreenshotCaptureWorkflowDraft): string {
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
    '## Preflight Checks',
    ...draft.preflightChecks.map((item) => `- ${item}`),
    '',
    '## Hard Stops',
    ...draft.hardStops.map((item) => `- ${item}`),
    '',
    '## Manifest Fields',
    ...draft.manifestFields.map((item) => `- ${item}`),
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
