import type { ScreenshotJobDraft, ScreenshotTarget } from './screenshotJobDraft';

export type UiMachineCheckStatus = 'pass' | 'warn' | 'block';

export type UiMachineCheckItem = {
  id: string;
  label: string;
  status: UiMachineCheckStatus;
  detail: string;
};

export type UiMachineCheckTarget = {
  targetId: string;
  label: string;
  url: string;
  checks: UiMachineCheckItem[];
};

export type UiMachineCheckDraft = {
  title: string;
  status: 'not-ready' | 'check-ready' | 'needs-fix';
  message: string;
  totalChecks: number;
  passCount: number;
  warnCount: number;
  blockCount: number;
  targets: UiMachineCheckTarget[];
  globalChecks: UiMachineCheckItem[];
  nextNotes: string[];
};

function item(id: string, label: string, status: UiMachineCheckStatus, detail: string): UiMachineCheckItem {
  return { id, label, status, detail };
}

function targetChecks(target: ScreenshotTarget): UiMachineCheckItem[] {
  return [
    item(
      `${target.id}-url`,
      'URL入力',
      target.url.trim() ? 'pass' : 'block',
      target.url.trim() ? '対象URLがあります。' : '対象URLが未入力です。',
    ),
    item(
      `${target.id}-viewport`,
      'viewportサイズ',
      target.viewport.width > 0 && target.viewport.height > 0 ? 'pass' : 'block',
      target.viewport.width > 0 && target.viewport.height > 0
        ? `${target.viewport.width}x${target.viewport.height} で確認できます。`
        : 'viewportのwidth/heightが不正です。',
    ),
    item(
      `${target.id}-target-status`,
      'target状態',
      target.status === 'ready' ? 'pass' : 'warn',
      target.status === 'ready' ? '対象キューはreadyです。' : `対象キューは ${target.status} です。`,
    ),
    item(
      `${target.id}-path`,
      'ページpath',
      target.page.path.trim() ? 'pass' : 'warn',
      target.page.path.trim() ? `path: ${target.page.path}` : 'ページpathが空です。',
    ),
  ];
}

function globalChecks(draft: ScreenshotJobDraft): UiMachineCheckItem[] {
  return [
    item(
      'base-url',
      'Base URL',
      draft.baseUrl.trim() ? 'pass' : 'block',
      draft.baseUrl.trim() ? 'Base URLがあります。' : 'Preview URLまたはLocal URLが必要です。',
    ),
    item(
      'target-count',
      '対象件数',
      draft.targetCount > 0 ? 'pass' : 'block',
      draft.targetCount > 0 ? `${draft.targetCount}件の対象があります。` : '対象ページまたはviewportがありません。',
    ),
    item(
      'blocked-count',
      'キューの不足',
      draft.blockedCount === 0 ? 'pass' : 'warn',
      draft.blockedCount === 0 ? '不足している対象はありません。' : `${draft.blockedCount}件の不足があります。`,
    ),
    item(
      'draft-only',
      '実行なし',
      'pass',
      'Phase 10.3ではチェック下書きだけを作ります。',
    ),
  ];
}

export function buildUiMachineCheckDraft(draft: ScreenshotJobDraft): UiMachineCheckDraft {
  const targets = draft.targets.map((target) => ({
    targetId: target.id,
    label: target.label,
    url: target.url,
    checks: targetChecks(target),
  }));

  const globals = globalChecks(draft);
  const allChecks = [...globals, ...targets.flatMap((target) => target.checks)];
  const passCount = allChecks.filter((check) => check.status === 'pass').length;
  const warnCount = allChecks.filter((check) => check.status === 'warn').length;
  const blockCount = allChecks.filter((check) => check.status === 'block').length;

  const status = blockCount > 0 ? 'not-ready' : warnCount > 0 ? 'needs-fix' : 'check-ready';

  return {
    title: 'UI Machine Check Draft',
    status,
    message: status === 'check-ready'
      ? '機械チェック下書きは整っています。次のPhaseで実チェック結果の記録へ進めます。'
      : status === 'needs-fix'
        ? '軽い注意点があります。Batch Gate Modeでは最後にまとめる候補です。'
        : '不足があります。URLやviewportを確認してください。',
    totalChecks: allChecks.length,
    passCount,
    warnCount,
    blockCount,
    targets,
    globalChecks: globals,
    nextNotes: [
      '真っ白画面チェックはPhase 10.4以降で結果記録として扱います。',
      '横スクロールやローディング停止の検出は、まだ実行しません。',
      'この段階では下書きと分類だけです。',
      'blockは途中停止候補、warnは完成間近レポート候補です。',
    ],
  };
}

export function formatUiMachineCheckDraft(draft: UiMachineCheckDraft): string {
  return [
    `# ${draft.title}`,
    '',
    draft.message,
    '',
    `- status: ${draft.status}`,
    `- totalChecks: ${draft.totalChecks}`,
    `- pass: ${draft.passCount}`,
    `- warn: ${draft.warnCount}`,
    `- block: ${draft.blockCount}`,
    '',
    '## Global Checks',
    ...draft.globalChecks.map((check) => `- [${check.status}] ${check.label}: ${check.detail}`),
    '',
    '## Target Checks',
    ...draft.targets.flatMap((target) => [
      `### ${target.label}`,
      `URL: ${target.url || '未入力'}`,
      ...target.checks.map((check) => `- [${check.status}] ${check.label}: ${check.detail}`),
      '',
    ]),
    '## Next Notes',
    ...draft.nextNotes.map((note) => `- ${note}`),
  ].join('\n');
}
