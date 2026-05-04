import type { ScreenshotPlanExport } from './screenshotPlanExport';
import type { ScreenshotRunGate } from './screenshotRunGate';

export type ScreenshotWorkflowDispatchDraft = {
  title: string;
  status: 'not-ready' | 'ready-to-copy' | 'needs-review';
  message: string;
  workflowFileName: string;
  workflowName: string;
  inputs: {
    planJson: string;
    dryRun: 'true';
    requireManualGate: 'true';
  };
  yamlDraft: string;
  cliDraft: string;
  safetyNotes: string[];
};

function indent(value: string, spaces: number): string {
  const prefix = ' '.repeat(spaces);
  return value.split('\n').map((line) => `${prefix}${line}`).join('\n');
}

function buildYamlDraft(planJson: string): string {
  return [
    'name: Screenshot Capture Draft',
    '',
    'on:',
    '  workflow_dispatch:',
    '    inputs:',
    '      plan_json:',
    '        description: Draft-only screenshot plan JSON',
    '        required: true',
    '        type: string',
    '      dry_run:',
    '        description: Keep true until manual capture is approved',
    '        required: true',
    '        default: "true"',
    '        type: choice',
    '        options:',
    '          - "true"',
    '          - "false"',
    '      require_manual_gate:',
    '        description: Refuse execution unless human gate is acknowledged',
    '        required: true',
    '        default: "true"',
    '        type: choice',
    '        options:',
    '          - "true"',
    '          - "false"',
    '',
    'permissions:',
    '  contents: read',
    '  actions: read',
    '',
    'jobs:',
    '  print-plan-only:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - name: Confirm manual gate',
    '        run: |',
    '          if [ "${{ inputs.require_manual_gate }}" != "true" ]; then',
    '            echo "Manual gate is required."',
    '            exit 1',
    '          fi',
    '      - name: Keep dry-run enabled',
    '        run: |',
    '          if [ "${{ inputs.dry_run }}" != "true" ]; then',
    '            echo "This draft workflow refuses non-dry-run execution."',
    '            exit 1',
    '          fi',
    '      - name: Print screenshot plan',
    '        run: |',
    '          cat <<\'JSON\' > screenshot-plan.json',
    indent(planJson, 10),
    '          JSON',
    '          cat screenshot-plan.json',
    '      - name: Safety reminder',
    '        run: |',
    '          echo "Draft only: no browser, no screenshot capture, no external worker."',
  ].join('\n');
}

function buildCliDraft(planJson: string): string {
  const escapedPlan = planJson.replace(/'/g, "'\\''");

  return [
    'gh workflow run screenshot-capture-draft.yml \\',
    "  -f dry_run=true \\",
    "  -f require_manual_gate=true \\",
    `  -f plan_json='${escapedPlan}'`,
  ].join('\n');
}

export function buildScreenshotWorkflowDispatchDraft(
  plan: ScreenshotPlanExport,
  gate: ScreenshotRunGate,
): ScreenshotWorkflowDispatchDraft {
  const planJson = JSON.stringify(plan, null, 2);
  const status = gate.status === 'blocked'
    ? 'not-ready'
    : gate.status === 'needs-review'
      ? 'needs-review'
      : 'ready-to-copy';

  return {
    title: 'Workflow Dispatch Draft',
    status,
    message: status === 'ready-to-copy'
      ? 'workflow_dispatch下書きをコピーできます。ただしこのPhaseではまだ実行しません。'
      : status === 'needs-review'
        ? 'Run Gateに確認項目があります。コピー前に内容を確認してください。'
        : 'Run Gateがblockedです。workflow_dispatch下書きは実行しないでください。',
    workflowFileName: 'screenshot-capture-draft.yml',
    workflowName: 'Screenshot Capture Draft',
    inputs: {
      planJson,
      dryRun: 'true',
      requireManualGate: 'true',
    },
    yamlDraft: buildYamlDraft(planJson),
    cliDraft: buildCliDraft(planJson),
    safetyNotes: [
      'This workflow draft is dry-run only.',
      'The job only prints the JSON plan and exits.',
      'No Playwright install, no browser launch, and no screenshot capture are included yet.',
      'Never paste secrets, cookies, tokens, or keys into plan_json.',
      'Non-dry-run execution is explicitly refused in this draft.',
    ],
  };
}

export function formatScreenshotWorkflowDispatchDraft(draft: ScreenshotWorkflowDispatchDraft): string {
  return [
    `# ${draft.title}`,
    '',
    draft.message,
    '',
    `- status: ${draft.status}`,
    `- workflowFileName: ${draft.workflowFileName}`,
    `- workflowName: ${draft.workflowName}`,
    `- dryRun: ${draft.inputs.dryRun}`,
    `- requireManualGate: ${draft.inputs.requireManualGate}`,
    '',
    '## YAML Draft',
    '```yaml',
    draft.yamlDraft,
    '```',
    '',
    '## GH CLI Draft',
    '```bash',
    draft.cliDraft,
    '```',
    '',
    '## Safety Notes',
    ...draft.safetyNotes.map((note) => `- ${note}`),
  ].join('\n');
}
