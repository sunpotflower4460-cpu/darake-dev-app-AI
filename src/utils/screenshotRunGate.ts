import type { ScreenshotPlanExport } from './screenshotPlanExport';

export type ScreenshotRunGateStatus = 'ready' | 'needs-review' | 'blocked';

export type ScreenshotRunGateCheck = {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'block';
  detail: string;
};

export type ScreenshotRunGate = {
  title: string;
  status: ScreenshotRunGateStatus;
  message: string;
  checks: ScreenshotRunGateCheck[];
  allowedConditions: string[];
  blockedConditions: string[];
  manualGateNotes: string[];
};

function check(id: string, label: string, status: ScreenshotRunGateCheck['status'], detail: string): ScreenshotRunGateCheck {
  return { id, label, status, detail };
}

export function buildScreenshotRunGate(plan: ScreenshotPlanExport): ScreenshotRunGate {
  const checks: ScreenshotRunGateCheck[] = [
    check(
      'plan-status',
      'Plan status',
      plan.status === 'ready' ? 'pass' : plan.status === 'needs-review' ? 'warn' : 'block',
      `plan.status is ${plan.status}`,
    ),
    check(
      'runner-mode',
      'Runner mode',
      plan.runner.mode === 'draft-only' && plan.runner.shouldRunAutomatically === false ? 'pass' : 'block',
      `mode=${plan.runner.mode}, shouldRunAutomatically=${String(plan.runner.shouldRunAutomatically)}`,
    ),
    check(
      'target-count',
      'Ready targets',
      plan.targets.length > 0 ? 'pass' : 'block',
      `${plan.targets.length} ready target(s)`,
    ),
    check(
      'blocked-targets',
      'Blocked targets',
      plan.blockedTargets.length === 0 ? 'pass' : 'warn',
      `${plan.blockedTargets.length} blocked target(s)`,
    ),
    check(
      'base-url',
      'Base URL',
      plan.source.baseUrl.trim() ? 'pass' : 'block',
      plan.source.baseUrl.trim() ? plan.source.baseUrl : 'baseUrl is empty',
    ),
    check(
      'secret-policy',
      'Secret policy',
      'pass',
      'This gate does not accept secrets, cookies, tokens, or keys.',
    ),
    check(
      'manual-gate',
      'Manual gate',
      'warn',
      'External execution must be started manually in a later phase.',
    ),
  ];

  const hasBlock = checks.some((item) => item.status === 'block');
  const hasWarn = checks.some((item) => item.status === 'warn');
  const status: ScreenshotRunGateStatus = hasBlock ? 'blocked' : hasWarn ? 'needs-review' : 'ready';

  return {
    title: 'Screenshot Run Gate',
    status,
    message: status === 'ready'
      ? '実行前条件は整っています。ただしこのPhaseではまだ実行しません。'
      : status === 'needs-review'
        ? '実行前に確認したい項目があります。Batch Gate Modeでは人間確認候補です。'
        : '実行前に止めるべき項目があります。URLやtargetを確認してください。',
    checks,
    allowedConditions: [
      'JSON plan status is ready',
      'ready target is 1 or more',
      'baseUrl is present',
      'runner mode remains draft-only',
      'shouldRunAutomatically remains false',
      'no secrets / cookies / tokens / keys are included',
    ],
    blockedConditions: [
      'baseUrl is empty',
      'ready target is 0',
      'runner tries to auto-run',
      'payload includes secrets / cookies / tokens / keys',
      'payload attempts production deploy or publish',
      'blocked target must be resolved before capture',
    ],
    manualGateNotes: [
      'Phase 10.10 only displays the gate.',
      'No screenshot capture is performed.',
      'No GitHub Actions workflow is triggered.',
      'No external worker is called.',
      'A later phase may add a manually confirmed workflow dispatch.',
    ],
  };
}

export function formatScreenshotRunGate(gate: ScreenshotRunGate): string {
  return [
    `# ${gate.title}`,
    '',
    gate.message,
    '',
    `- status: ${gate.status}`,
    '',
    '## Checks',
    ...gate.checks.map((item) => `- [${item.status}] ${item.label}: ${item.detail}`),
    '',
    '## Allowed Conditions',
    ...gate.allowedConditions.map((item) => `- ${item}`),
    '',
    '## Blocked Conditions',
    ...gate.blockedConditions.map((item) => `- ${item}`),
    '',
    '## Manual Gate Notes',
    ...gate.manualGateNotes.map((item) => `- ${item}`),
  ].join('\n');
}
