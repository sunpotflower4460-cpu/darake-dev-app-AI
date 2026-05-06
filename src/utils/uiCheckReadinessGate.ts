import { loadPlaywrightSetupReportRecord, summarizePlaywrightSetupReportRecord } from './playwrightSetupReportRecord';
import { loadPreviewUrlRecord } from './previewUrlStore';
import { loadScreenshotCaptureManifestRecord, summarizeScreenshotCaptureManifestRecord } from './screenshotCaptureManifestRecord';
import { loadScreenshotResultRecord, summarizeScreenshotResult } from './screenshotResultRecord';
import { buildScreenshotJobDraft } from './screenshotJobDraft';
import { buildScreenshotPlanExport } from './screenshotPlanExport';

export type UiCheckReadinessGateStatus = 'blocked' | 'needs-review' | 'ready';

export type UiCheckReadinessGateCheck = {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail' | 'unchecked';
  detail: string;
};

export type UiCheckReadinessGate = {
  title: string;
  status: UiCheckReadinessGateStatus;
  message: string;
  checks: UiCheckReadinessGateCheck[];
  blockers: string[];
  warnings: string[];
  readyActions: string[];
};

function check(
  id: string,
  label: string,
  status: UiCheckReadinessGateCheck['status'],
  detail: string,
): UiCheckReadinessGateCheck {
  return { id, label, status, detail };
}

export function buildUiCheckReadinessGate(): UiCheckReadinessGate {
  const previewRecord = loadPreviewUrlRecord();
  const screenshotDraft = buildScreenshotJobDraft(previewRecord);
  const plan = buildScreenshotPlanExport(screenshotDraft);
  const playwrightRecord = loadPlaywrightSetupReportRecord();
  const playwrightSummary = summarizePlaywrightSetupReportRecord(playwrightRecord);
  const manifestRecord = loadScreenshotCaptureManifestRecord();
  const manifestSummary = summarizeScreenshotCaptureManifestRecord(manifestRecord);
  const resultFallback = { title: 'Screenshot Result Record', sourceStatus: screenshotDraft.status as 'not-ready', entries: [] };
  const resultRecord = loadScreenshotResultRecord(resultFallback);
  const resultSummary = summarizeScreenshotResult(resultRecord);

  const hasPreviewUrl = Boolean(previewRecord.previewUrl.trim());
  const hasPlan = plan.targets.length > 0;
  const playwrightOk = playwrightSummary.status === 'success';
  const manifestOk = manifestSummary.status === 'success';
  const failedCountIsZero = !manifestRecord.failedCount || Number.parseInt(manifestRecord.failedCount, 10) === 0;
  const capturedCountIsPositive = Boolean(manifestRecord.capturedCount) && Number.parseInt(manifestRecord.capturedCount, 10) > 0;
  const privateInfoOk = manifestRecord.privateInfoResult === 'success';
  const visualQuickLookOk = manifestRecord.visualQuickLookResult === 'success' || manifestRecord.visualQuickLookResult === 'warn';
  const resultHasInfo = resultRecord.entries.length > 0 || Boolean(manifestRecord.workflowRunUrl);

  const checks: UiCheckReadinessGateCheck[] = [
    check(
      'preview-url',
      'Preview URLがある',
      hasPreviewUrl ? 'pass' : 'fail',
      hasPreviewUrl ? previewRecord.previewUrl : 'Preview URLが未入力です。Phase 10.1で入力してください。',
    ),
    check(
      'screenshot-plan',
      'Screenshot Planがある',
      hasPlan ? 'pass' : 'fail',
      hasPlan ? `${plan.targets.length}件のターゲットがあります。` : 'Screenshot Planのターゲットがありません。',
    ),
    check(
      'playwright-setup',
      'Playwright setup reportがsuccess',
      playwrightOk ? 'pass' : playwrightSummary.status === 'failed' ? 'fail' : 'warn',
      playwrightSummary.message,
    ),
    check(
      'manifest-record',
      'capture manifest recordがsuccess',
      manifestOk ? 'pass' : manifestSummary.status === 'failed' ? 'fail' : 'warn',
      manifestSummary.message,
    ),
    check(
      'failed-count',
      'failedCountが0',
      failedCountIsZero ? 'pass' : 'fail',
      failedCountIsZero ? 'failedCount = 0' : `failedCount = ${manifestRecord.failedCount}`,
    ),
    check(
      'captured-count',
      'capturedCountが1以上',
      capturedCountIsPositive ? 'pass' : 'fail',
      capturedCountIsPositive
        ? `capturedCount = ${manifestRecord.capturedCount}`
        : `capturedCount = ${manifestRecord.capturedCount || '未入力'}`,
    ),
    check(
      'private-info',
      'privateInfoResultがsuccess',
      privateInfoOk ? 'pass' : manifestRecord.privateInfoResult === 'unchecked' ? 'unchecked' : 'warn',
      privateInfoOk
        ? 'private情報なし（確認済み）'
        : `privateInfoResult = ${manifestRecord.privateInfoResult}`,
    ),
    check(
      'visual-quick-look',
      '目視ざっくり確認がsuccessまたはwarn',
      visualQuickLookOk ? 'pass' : manifestRecord.visualQuickLookResult === 'unchecked' ? 'unchecked' : 'fail',
      visualQuickLookOk
        ? `visualQuickLookResult = ${manifestRecord.visualQuickLookResult}`
        : `visualQuickLookResult = ${manifestRecord.visualQuickLookResult}`,
    ),
    check(
      'result-record',
      'Screenshot Result Recordに最低限の情報がある',
      resultHasInfo ? 'pass' : 'warn',
      resultHasInfo
        ? `${resultSummary.total}件のエントリ、workflowRunUrl: ${manifestRecord.workflowRunUrl ? 'あり' : 'なし'}`
        : 'Screenshot Result RecordまたはworkflowRunUrlがありません。',
    ),
  ];

  const blockers: string[] = [];
  const warnings: string[] = [];

  for (const c of checks) {
    if (c.status === 'fail' || c.status === 'unchecked') {
      if (c.id !== 'private-info' && c.id !== 'visual-quick-look' && c.id !== 'result-record') {
        blockers.push(`[${c.label}] ${c.detail}`);
      } else if (c.status === 'unchecked') {
        blockers.push(`[${c.label}] まだ未確認です。確認してください。`);
      } else {
        warnings.push(`[${c.label}] ${c.detail}`);
      }
    } else if (c.status === 'warn') {
      warnings.push(`[${c.label}] ${c.detail}`);
    }
  }

  const hasFail = checks.some((c) => c.status === 'fail' || c.status === 'unchecked');
  const hasWarn = checks.some((c) => c.status === 'warn');
  const status: UiCheckReadinessGateStatus = hasFail ? 'blocked' : hasWarn ? 'needs-review' : 'ready';

  const message =
    status === 'ready'
      ? 'UIチェックへ進める条件が揃っています。UI Check Input Packを作成してください。'
      : status === 'needs-review'
        ? '一部に確認が必要な項目があります。warningの内容を確認してからUIチェックへ進んでください。'
        : 'blockerがあります。必須項目を確認してからUIチェックへ進みます。';

  return {
    title: 'UI Check Readiness Gate',
    status,
    message,
    checks,
    blockers,
    warnings,
    readyActions: status === 'ready'
      ? [
          'Phase 10.28のUI Machine Check Input Packパネルで入力パックを作成してください。',
          'UIチェック項目を確認し、必要ならnotesを追記してください。',
        ]
      : status === 'needs-review'
        ? [
            'warnの内容を確認してからUI Check Input Packへ進んでください。',
            'privateInfoResult / visualQuickLookResult の詳細を確認してください。',
          ]
        : [
            '上記blockerの項目を解消してください。',
            'Phase 10.25のmanifest確認記録を完成させてください。',
            'capturedCount / failedCount が正しいか確認してください。',
          ],
  };
}

export function formatUiCheckReadinessGate(gate: UiCheckReadinessGate): string {
  const lines: string[] = [
    `# ${gate.title}`,
    '',
    gate.message,
    '',
    `- status: ${gate.status}`,
    '',
    '## Checks',
    ...gate.checks.map((c) => `- [${c.status}] ${c.label}: ${c.detail}`),
  ];

  if (gate.blockers.length > 0) {
    lines.push('', '## Blockers');
    gate.blockers.forEach((b) => lines.push(`- ${b}`));
  }

  if (gate.warnings.length > 0) {
    lines.push('', '## Warnings');
    gate.warnings.forEach((w) => lines.push(`- ${w}`));
  }

  lines.push('', '## 次にやること');
  gate.readyActions.forEach((a) => lines.push(`- ${a}`));

  lines.push(
    '',
    '## Safety Notes',
    '- UIチェックを自動実行しません。',
    '- 画像解析・artifact取得はしません。',
    '- このGateは既存記録の読み取りのみです。',
  );

  return lines.join('\n');
}
