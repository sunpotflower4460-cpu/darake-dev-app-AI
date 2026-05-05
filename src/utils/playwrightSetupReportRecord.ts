export type PlaywrightSetupReportStatus = 'unchecked' | 'success' | 'warn' | 'failed';

export type PlaywrightSetupReportRecord = {
  title: string;
  status: PlaywrightSetupReportStatus;
  checkedAt: string;
  workflowRunUrl: string;
  artifactUrl: string;
  artifactName: string;
  artifactFileName: string;
  schemaVersionResult: PlaywrightSetupReportStatus;
  installResult: PlaywrightSetupReportStatus;
  openedUrlResult: PlaywrightSetupReportStatus;
  screenshotResult: PlaywrightSetupReportStatus;
  browserLaunchResult: PlaywrightSetupReportStatus;
  notes: string;
};

export type PlaywrightSetupReportSummary = {
  status: PlaywrightSetupReportStatus;
  message: string;
  successCount: number;
  warnCount: number;
  failedCount: number;
  uncheckedCount: number;
  canProceedToCaptureWorkflow: boolean;
};

const KEY = 'darake.playwrightSetupReportRecord.v1';

export function buildInitialPlaywrightSetupReportRecord(): PlaywrightSetupReportRecord {
  return {
    title: 'Playwright Setup Report Record',
    status: 'unchecked',
    checkedAt: '',
    workflowRunUrl: '',
    artifactUrl: '',
    artifactName: 'playwright-setup-dry-run',
    artifactFileName: 'artifacts/playwright-setup-report.json',
    schemaVersionResult: 'unchecked',
    installResult: 'unchecked',
    openedUrlResult: 'unchecked',
    screenshotResult: 'unchecked',
    browserLaunchResult: 'unchecked',
    notes: '',
  };
}

export function loadPlaywrightSetupReportRecord(): PlaywrightSetupReportRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return buildInitialPlaywrightSetupReportRecord();
    return {
      ...buildInitialPlaywrightSetupReportRecord(),
      ...(JSON.parse(raw) as Partial<PlaywrightSetupReportRecord>),
    };
  } catch {
    return buildInitialPlaywrightSetupReportRecord();
  }
}

export function savePlaywrightSetupReportRecord(record: PlaywrightSetupReportRecord): PlaywrightSetupReportRecord {
  const next = {
    ...record,
    checkedAt: record.checkedAt || new Date().toISOString(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return next;
  }

  return next;
}

export function clearPlaywrightSetupReportRecord(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}

function countStatus(record: PlaywrightSetupReportRecord, status: PlaywrightSetupReportStatus): number {
  return [
    record.status,
    record.schemaVersionResult,
    record.installResult,
    record.openedUrlResult,
    record.screenshotResult,
    record.browserLaunchResult,
  ].filter((item) => item === status).length;
}

export function summarizePlaywrightSetupReportRecord(record: PlaywrightSetupReportRecord): PlaywrightSetupReportSummary {
  const successCount = countStatus(record, 'success');
  const warnCount = countStatus(record, 'warn');
  const failedCount = countStatus(record, 'failed');
  const uncheckedCount = countStatus(record, 'unchecked');

  if (failedCount > 0 || record.status === 'failed') {
    return {
      status: 'failed',
      message: 'failedがあります。実スクショ撮影workflowへ進まず、Playwright setup reportを確認してください。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToCaptureWorkflow: false,
    };
  }

  if (uncheckedCount > 0 || record.status === 'unchecked') {
    return {
      status: 'unchecked',
      message: '未確認項目があります。setup report確認を完了してから次へ進みます。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToCaptureWorkflow: false,
    };
  }

  if (warnCount > 0 || record.status === 'warn') {
    return {
      status: 'warn',
      message: 'warnがあります。Batch Gate Modeでは注意点として残しつつ、実撮影前に内容確認が必要です。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToCaptureWorkflow: false,
    };
  }

  return {
    status: 'success',
    message: 'Playwright setup report確認は成功です。実スクショ撮影workflow設計へ進む材料になります。',
    successCount,
    warnCount,
    failedCount,
    uncheckedCount,
    canProceedToCaptureWorkflow: true,
  };
}

export function formatPlaywrightSetupReportRecord(record: PlaywrightSetupReportRecord): string {
  const summary = summarizePlaywrightSetupReportRecord(record);

  return [
    `# ${record.title}`,
    '',
    summary.message,
    '',
    `- status: ${summary.status}`,
    `- checkedAt: ${record.checkedAt || '未保存'}`,
    `- canProceedToCaptureWorkflow: ${String(summary.canProceedToCaptureWorkflow)}`,
    `- workflowRunUrl: ${record.workflowRunUrl || '未入力'}`,
    `- artifactUrl: ${record.artifactUrl || '未入力'}`,
    `- artifactName: ${record.artifactName}`,
    `- artifactFileName: ${record.artifactFileName}`,
    '',
    '## Results',
    `- schemaVersionResult: ${record.schemaVersionResult}`,
    `- installResult: ${record.installResult}`,
    `- openedUrlResult: ${record.openedUrlResult}`,
    `- screenshotResult: ${record.screenshotResult}`,
    `- browserLaunchResult: ${record.browserLaunchResult}`,
    '',
    '## Notes',
    record.notes || 'なし',
    '',
    '## Safety Notes',
    '- この記録は人間がsetup reportを見た結果の手動記録です。',
    '- reportの自動取得・解析・URLアクセス・スクショ撮影は行いません。',
    '- failedがある場合は実撮影workflowへ進みません。',
  ].join('\n');
}
