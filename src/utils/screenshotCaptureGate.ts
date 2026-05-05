import type { DryRunArtifactCheckRecord } from './dryRunArtifactCheckRecord';
import { summarizeDryRunArtifactCheckRecord } from './dryRunArtifactCheckRecord';
import type { ScreenshotPlanExport } from './screenshotPlanExport';
import type { ScreenshotRunGate } from './screenshotRunGate';

export type ScreenshotCaptureGateStatus = 'ready' | 'needs-review' | 'blocked';

export type ScreenshotCaptureGateCheck = {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'block';
  detail: string;
};

export type ScreenshotCaptureGate = {
  title: string;
  status: ScreenshotCaptureGateStatus;
  message: string;
  checks: ScreenshotCaptureGateCheck[];
  allowedConditions: string[];
  blockedConditions: string[];
  nextActions: string[];
  safetyNotes: string[];
};

function check(id: string, label: string, status: ScreenshotCaptureGateCheck['status'], detail: string): ScreenshotCaptureGateCheck {
  return { id, label, status, detail };
}

export function buildScreenshotCaptureGate(
  artifactRecord: DryRunArtifactCheckRecord,
  plan: ScreenshotPlanExport,
  runGate: ScreenshotRunGate,
): ScreenshotCaptureGate {
  const artifactSummary = summarizeDryRunArtifactCheckRecord(artifactRecord);
  const hasBaseUrl = Boolean(plan.source.baseUrl.trim());
  const hasTargets = plan.targets.length > 0;
  const hasBlockedTargets = plan.blockedTargets.length > 0;

  const checks: ScreenshotCaptureGateCheck[] = [
    check(
      'artifact-record',
      'Artifact check record',
      artifactSummary.canProceedToCapturePlanning ? 'pass' : artifactSummary.status === 'failed' ? 'block' : 'warn',
      artifactSummary.message,
    ),
    check(
      'workflow-run-url',
      'Workflow run URL',
      artifactRecord.workflowRunUrl.trim() ? 'pass' : 'warn',
      artifactRecord.workflowRunUrl.trim() || 'workflowRunUrl is empty',
    ),
    check(
      'artifact-url',
      'Artifact URL',
      artifactRecord.artifactUrl.trim() ? 'pass' : 'warn',
      artifactRecord.artifactUrl.trim() || 'artifactUrl is empty',
    ),
    check(
      'run-gate',
      'Run Gate',
      runGate.status === 'ready' ? 'pass' : runGate.status === 'blocked' ? 'block' : 'warn',
      `runGate.status is ${runGate.status}`,
    ),
    check(
      'plan-status',
      'Plan status',
      plan.status === 'ready' ? 'pass' : plan.status === 'not-ready' ? 'block' : 'warn',
      `plan.status is ${plan.status}`,
    ),
    check(
      'base-url',
      'Preview URL',
      hasBaseUrl ? 'pass' : 'block',
      hasBaseUrl ? plan.source.baseUrl : 'source.baseUrl is empty',
    ),
    check(
      'targets',
      'Capture targets',
      hasTargets ? 'pass' : 'block',
      `${plan.targets.length} ready target(s)`,
    ),
    check(
      'blocked-targets',
      'Blocked targets',
      hasBlockedTargets ? 'warn' : 'pass',
      `${plan.blockedTargets.length} blocked target(s)`,
    ),
    check(
      'manual-gate',
      'Manual gate',
      'warn',
      'Real capture must still require explicit human confirmation in a later phase.',
    ),
  ];

  const hasBlock = checks.some((item) => item.status === 'block');
  const hasWarn = checks.some((item) => item.status === 'warn');
  const status: ScreenshotCaptureGateStatus = hasBlock ? 'blocked' : hasWarn ? 'needs-review' : 'ready';

  return {
    title: 'Screenshot Capture Gate',
    status,
    message: status === 'ready'
      ? '実スクショ撮影計画へ進む条件が揃っています。ただし、このPhaseではまだ撮影しません。'
      : status === 'needs-review'
        ? '撮影計画へ進む前に確認したい項目があります。Batch Gate Modeでは注意点として残します。'
        : '撮影計画へ進む前に止めるべき項目があります。artifact確認・Preview URL・targetsを確認してください。',
    checks,
    allowedConditions: [
      'Artifact check record is success',
      'Run Gate is ready or reviewed',
      'Preview URL is present',
      'ready target is 1 or more',
      'runner mode remains draft-only until next manual capture phase',
      'no secrets / cookies / tokens / keys are involved',
    ],
    blockedConditions: [
      'Artifact check record is failed or unchecked',
      'Plan status is not-ready',
      'Preview URL is empty',
      'ready target is 0',
      'Run Gate is blocked',
      'payload includes secrets / cookies / tokens / keys',
      'capture would touch production deploy or publish flow',
    ],
    nextActions: [
      'Phase 10.17で実撮影workflow設計下書きを追加する',
      'Phase 10.18でPlaywright setupをmanual gate付きdry-runに分ける',
      'Phase 10.19以降で初回の少数targetだけ実撮影する',
    ],
    safetyNotes: [
      'Phase 10.16 only evaluates readiness.',
      'No screenshot capture is performed.',
      'No browser is launched.',
      'No workflow dispatch is triggered.',
      'Real capture remains behind a later explicit manual gate.',
    ],
  };
}

export function formatScreenshotCaptureGate(gate: ScreenshotCaptureGate): string {
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
    '## Next Actions',
    ...gate.nextActions.map((item) => `- ${item}`),
    '',
    '## Safety Notes',
    ...gate.safetyNotes.map((item) => `- ${item}`),
  ].join('\n');
}
