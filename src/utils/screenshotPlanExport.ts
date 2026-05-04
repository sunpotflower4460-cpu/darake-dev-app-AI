import type { ScreenshotJobDraft, ScreenshotTarget } from './screenshotJobDraft';

export type ScreenshotPlanExportTarget = {
  id: string;
  label: string;
  url: string;
  pagePath: string;
  viewport: {
    label: string;
    width: number;
    height: number;
  };
  outputName: string;
};

export type ScreenshotPlanExport = {
  schemaVersion: 'darake-screenshot-plan-v1';
  generatedAt: string;
  status: 'not-ready' | 'ready' | 'needs-review';
  source: {
    title: string;
    baseUrl: string;
    targetCount: number;
    readyCount: number;
    blockedCount: number;
  };
  runner: {
    mode: 'draft-only';
    recommendedTool: 'playwright';
    shouldRunAutomatically: false;
  };
  targets: ScreenshotPlanExportTarget[];
  blockedTargets: Array<{
    id: string;
    label: string;
    status: ScreenshotTarget['status'];
    note: string;
  }>;
  safetyNotes: string[];
};

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9\-\s_]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

  return slug || 'screenshot-target';
}

function buildOutputName(target: ScreenshotTarget): string {
  return `${slugify(target.page.id)}-${slugify(target.viewport.id)}.png`;
}

export function buildScreenshotPlanExport(draft: ScreenshotJobDraft): ScreenshotPlanExport {
  const readyTargets = draft.targets.filter((target) => target.status === 'ready');
  const blockedTargets = draft.targets.filter((target) => target.status !== 'ready');
  const status = draft.readyCount === draft.targetCount && draft.targetCount > 0
    ? 'ready'
    : draft.readyCount > 0
      ? 'needs-review'
      : 'not-ready';

  return {
    schemaVersion: 'darake-screenshot-plan-v1',
    generatedAt: new Date().toISOString(),
    status,
    source: {
      title: draft.title,
      baseUrl: draft.baseUrl,
      targetCount: draft.targetCount,
      readyCount: draft.readyCount,
      blockedCount: draft.blockedCount,
    },
    runner: {
      mode: 'draft-only',
      recommendedTool: 'playwright',
      shouldRunAutomatically: false,
    },
    targets: readyTargets.map((target) => ({
      id: target.id,
      label: target.label,
      url: target.url,
      pagePath: target.page.path,
      viewport: {
        label: target.viewport.label,
        width: target.viewport.width,
        height: target.viewport.height,
      },
      outputName: buildOutputName(target),
    })),
    blockedTargets: blockedTargets.map((target) => ({
      id: target.id,
      label: target.label,
      status: target.status,
      note: target.note,
    })),
    safetyNotes: [
      'This JSON is a draft handoff only.',
      'Do not include secrets, tokens, cookies, or private keys.',
      'Do not run production deploys from this payload.',
      'External execution must remain behind a manual gate.',
      'Screenshots should be written to artifacts/screenshots or another safe artifact directory.',
    ],
  };
}

export function formatScreenshotPlanExport(plan: ScreenshotPlanExport): string {
  return JSON.stringify(plan, null, 2);
}

export function summarizeScreenshotPlanExport(plan: ScreenshotPlanExport): string[] {
  return [
    `status: ${plan.status}`,
    `targets: ${plan.targets.length}`,
    `blockedTargets: ${plan.blockedTargets.length}`,
    `baseUrl: ${plan.source.baseUrl || '未入力'}`,
    `runner: ${plan.runner.recommendedTool}`,
    'mode: draft-only',
  ];
}
