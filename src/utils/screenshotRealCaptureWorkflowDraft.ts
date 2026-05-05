import type { ScreenshotCaptureGate } from './screenshotCaptureGate';
import type { ScreenshotPlanExport } from './screenshotPlanExport';

export type RealCaptureWorkflowDraftStatus = 'not-ready' | 'ready-to-plan' | 'needs-review';

export type RealCaptureWorkflowStep = {
  id: string;
  title: string;
  detail: string;
  risk: 'low' | 'medium' | 'high';
};

export type RealCaptureWorkflowDraft = {
  title: string;
  status: RealCaptureWorkflowDraftStatus;
  message: string;
  proposedWorkflowFileName: string;
  proposedWorkflowName: string;
  inputs: Array<{
    name: string;
    required: boolean;
    defaultValue?: string;
    note: string;
  }>;
  jobs: RealCaptureWorkflowStep[];
  artifacts: Array<{
    name: string;
    path: string;
    note: string;
  }>;
  hardStops: string[];
  manualGateRequirements: string[];
  yamlSketch: string;
  safetyNotes: string[];
};

function buildYamlSketch(): string {
  return [
    'name: Screenshot Capture Manual',
    '',
    'on:',
    '  workflow_dispatch:',
    '    inputs:',
    '      plan_json:',
    '        description: Screenshot plan JSON',
    '        required: true',
    '        type: string',
    '      confirm_capture:',
    '        description: Type CAPTURE_DRY_APPROVED to allow real capture',
    '        required: true',
    '        type: string',
    '      max_targets:',
    '        description: Limit first capture batch size',
    '        required: true',
    '        default: "2"',
    '        type: string',
    '',
    'permissions:',
    '  contents: read',
    '  actions: read',
    '',
    'jobs:',
    '  capture:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - name: Validate manual capture gate',
    '        run: echo "Future phase: require confirm_capture before any browser launch"',
    '      - name: Checkout',
    '        uses: actions/checkout@v4',
    '      - name: Setup Node',
    '        uses: actions/setup-node@v4',
    '        with:',
    '          node-version: 20',
    '      - name: Future Playwright install',
    '        run: echo "Future phase: npm install && npx playwright install --with-deps chromium"',
    '      - name: Future capture',
    '        run: echo "Future phase: capture only max_targets approved URLs"',
    '      - name: Future upload screenshots',
    '        run: echo "Future phase: upload artifacts/screenshots"',
  ].join('\n');
}

export function buildRealCaptureWorkflowDraft(
  captureGate: ScreenshotCaptureGate,
  plan: ScreenshotPlanExport,
): RealCaptureWorkflowDraft {
  const status: RealCaptureWorkflowDraftStatus = captureGate.status === 'blocked'
    ? 'not-ready'
    : captureGate.status === 'needs-review'
      ? 'needs-review'
      : 'ready-to-plan';

  return {
    title: 'Real Screenshot Capture Workflow Draft',
    status,
    message: status === 'ready-to-plan'
      ? '実撮影workflowの設計下書きを作れます。ただし、このPhaseではまだworkflow実ファイル化も撮影も行いません。'
      : status === 'needs-review'
        ? 'Capture Gateに確認項目があります。実撮影workflow設計に進む前に注意点を確認します。'
        : 'Capture Gateがblockedです。実撮影workflow設計は保留してください。',
    proposedWorkflowFileName: 'screenshot-capture-manual.yml',
    proposedWorkflowName: 'Screenshot Capture Manual',
    inputs: [
      {
        name: 'plan_json',
        required: true,
        note: 'Phase 10.9で生成したScreenshot Plan Export JSONを使います。',
      },
      {
        name: 'confirm_capture',
        required: true,
        defaultValue: 'CAPTURE_DRY_APPROVED',
        note: '実撮影を許可する手入力ゲート。将来のworkflowではこの文字列以外を拒否します。',
      },
      {
        name: 'max_targets',
        required: true,
        defaultValue: '2',
        note: '初回は少数targetだけ撮るための安全弁です。',
      },
    ],
    jobs: [
      {
        id: 'validate-gate',
        title: 'Manual capture gate validation',
        detail: 'confirm_capture / schemaVersion / runner flags / target countを最初に検証します。',
        risk: 'low',
      },
      {
        id: 'setup-runtime',
        title: 'Setup Node and checkout',
        detail: 'リポジトリをcheckoutし、Node環境を準備します。',
        risk: 'low',
      },
      {
        id: 'install-playwright',
        title: 'Install Playwright Chromium',
        detail: '将来のPhaseでChromiumだけを明示的に入れます。',
        risk: 'medium',
      },
      {
        id: 'capture-limited-targets',
        title: 'Capture limited targets',
        detail: 'max_targets以内のready targetだけを撮影します。初回は2件以下を推奨します。',
        risk: 'medium',
      },
      {
        id: 'upload-artifact',
        title: 'Upload screenshot artifact',
        detail: 'artifacts/screenshots配下のPNGとcapture manifestをartifactへ保存します。',
        risk: 'low',
      },
      {
        id: 'write-manifest',
        title: 'Write capture manifest',
        detail: 'imagePath / capturedAt / viewport / target idをJSONで保存し、Phase 10.7の受け皿へ戻せる形にします。',
        risk: 'low',
      },
    ],
    artifacts: [
      {
        name: 'screenshot-capture-results',
        path: 'artifacts/screenshots/**',
        note: 'PNG画像とmanifestをまとめる想定です。',
      },
      {
        name: 'screenshot-capture-manifest',
        path: 'artifacts/screenshot-capture-manifest.json',
        note: 'Phase 10.7のScreenshot Result Recordへ転記する元データです。',
      },
    ],
    hardStops: [
      'Capture Gate is blocked',
      'confirm_capture is missing or incorrect',
      'plan_json schemaVersion is not darake-screenshot-plan-v1',
      'ready targets are empty',
      'max_targets is greater than the approved limit',
      'plan includes secrets / tokens / cookies / passwords',
      'workflow tries to deploy, publish, or mutate production data',
    ],
    manualGateRequirements: [
      'User must inspect Capture Gate first',
      'User must keep max_targets small for first run',
      'User must confirm Preview URL is safe to open from GitHub Actions',
      'User must confirm screenshots contain no private data',
      'User must approve adding the real workflow file in a later phase',
    ],
    yamlSketch: buildYamlSketch(),
    safetyNotes: [
      'Phase 10.17 is design-draft only.',
      'No workflow file is added in this phase.',
      'No browser is launched.',
      'No screenshot is captured.',
      'No GitHub Actions dispatch is triggered.',
      `Current ready targets in plan: ${plan.targets.length}`,
      `Current blocked targets in plan: ${plan.blockedTargets.length}`,
    ],
  };
}

export function formatRealCaptureWorkflowDraft(draft: RealCaptureWorkflowDraft): string {
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
    '## Hard Stops',
    ...draft.hardStops.map((item) => `- ${item}`),
    '',
    '## Manual Gate Requirements',
    ...draft.manualGateRequirements.map((item) => `- ${item}`),
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
