export type ScreenshotCaptureManifestRecordStatus = 'unchecked' | 'success' | 'warn' | 'failed';

export type ScreenshotCaptureManifestRecord = {
  title: string;
  status: ScreenshotCaptureManifestRecordStatus;
  checkedAt: string;
  workflowRunUrl: string;
  artifactUrl: string;
  artifactName: string;
  manifestFileName: string;
  schemaVersionResult: ScreenshotCaptureManifestRecordStatus;
  pngResult: ScreenshotCaptureManifestRecordStatus;
  capturedCountResult: ScreenshotCaptureManifestRecordStatus;
  failedCountResult: ScreenshotCaptureManifestRecordStatus;
  privateInfoResult: ScreenshotCaptureManifestRecordStatus;
  visualQuickLookResult: ScreenshotCaptureManifestRecordStatus;
  capturedCount: string;
  failedCount: string;
  notes: string;
};

export type ScreenshotCaptureManifestSummary = {
  status: ScreenshotCaptureManifestRecordStatus;
  message: string;
  successCount: number;
  warnCount: number;
  failedCount: number;
  uncheckedCount: number;
  canProceedToUiCheck: boolean;
};

const KEY = 'darake.screenshotCaptureManifestRecord.v1';

export function buildInitialScreenshotCaptureManifestRecord(): ScreenshotCaptureManifestRecord {
  return {
    title: 'Screenshot Capture Manifest Record',
    status: 'unchecked',
    checkedAt: '',
    workflowRunUrl: '',
    artifactUrl: '',
    artifactName: 'screenshot-capture-limited',
    manifestFileName: 'artifacts/screenshot-capture-manifest.json',
    schemaVersionResult: 'unchecked',
    pngResult: 'unchecked',
    capturedCountResult: 'unchecked',
    failedCountResult: 'unchecked',
    privateInfoResult: 'unchecked',
    visualQuickLookResult: 'unchecked',
    capturedCount: '',
    failedCount: '',
    notes: '',
  };
}

export function loadScreenshotCaptureManifestRecord(): ScreenshotCaptureManifestRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return buildInitialScreenshotCaptureManifestRecord();
    return {
      ...buildInitialScreenshotCaptureManifestRecord(),
      ...(JSON.parse(raw) as Partial<ScreenshotCaptureManifestRecord>),
    };
  } catch {
    return buildInitialScreenshotCaptureManifestRecord();
  }
}

export function saveScreenshotCaptureManifestRecord(record: ScreenshotCaptureManifestRecord): ScreenshotCaptureManifestRecord {
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

export function clearScreenshotCaptureManifestRecord(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}

function countStatus(record: ScreenshotCaptureManifestRecord, status: ScreenshotCaptureManifestRecordStatus): number {
  return [
    record.status,
    record.schemaVersionResult,
    record.pngResult,
    record.capturedCountResult,
    record.failedCountResult,
    record.privateInfoResult,
    record.visualQuickLookResult,
  ].filter((item) => item === status).length;
}

function hasPositiveInteger(value: string): boolean {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0;
}

function hasZeroFailed(value: string): boolean {
  const parsed = Number.parseInt(value || '0', 10);
  return Number.isFinite(parsed) && parsed === 0;
}

export function summarizeScreenshotCaptureManifestRecord(record: ScreenshotCaptureManifestRecord): ScreenshotCaptureManifestSummary {
  const successCount = countStatus(record, 'success');
  const warnCount = countStatus(record, 'warn');
  const failedCount = countStatus(record, 'failed');
  const uncheckedCount = countStatus(record, 'unchecked');
  const capturedCountIsValid = hasPositiveInteger(record.capturedCount);
  const failedCountIsZero = hasZeroFailed(record.failedCount);

  if (failedCount > 0 || record.status === 'failed' || !failedCountIsZero) {
    return {
      status: 'failed',
      message: 'failedがあります。UIチェックへ進まず、manifestとPNGを確認してください。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToUiCheck: false,
    };
  }

  if (uncheckedCount > 0 || record.status === 'unchecked' || !capturedCountIsValid) {
    return {
      status: 'unchecked',
      message: '未確認項目があります。manifestとPNG確認を完了してから次へ進みます。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToUiCheck: false,
    };
  }

  if (warnCount > 0 || record.status === 'warn') {
    return {
      status: 'warn',
      message: 'warnがあります。Batch Gate Modeでは注意点として残しつつ、UIチェック前に内容確認が必要です。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToUiCheck: false,
    };
  }

  return {
    status: 'success',
    message: 'capture manifestとPNG確認は成功です。UIチェックへ進む材料になります。',
    successCount,
    warnCount,
    failedCount,
    uncheckedCount,
    canProceedToUiCheck: true,
  };
}

export function formatScreenshotCaptureManifestRecord(record: ScreenshotCaptureManifestRecord): string {
  const summary = summarizeScreenshotCaptureManifestRecord(record);

  return [
    `# ${record.title}`,
    '',
    summary.message,
    '',
    `- status: ${summary.status}`,
    `- checkedAt: ${record.checkedAt || '未保存'}`,
    `- canProceedToUiCheck: ${String(summary.canProceedToUiCheck)}`,
    `- workflowRunUrl: ${record.workflowRunUrl || '未入力'}`,
    `- artifactUrl: ${record.artifactUrl || '未入力'}`,
    `- artifactName: ${record.artifactName}`,
    `- manifestFileName: ${record.manifestFileName}`,
    `- capturedCount: ${record.capturedCount || '未入力'}`,
    `- failedCount: ${record.failedCount || '未入力'}`,
    '',
    '## Results',
    `- schemaVersionResult: ${record.schemaVersionResult}`,
    `- pngResult: ${record.pngResult}`,
    `- capturedCountResult: ${record.capturedCountResult}`,
    `- failedCountResult: ${record.failedCountResult}`,
    `- privateInfoResult: ${record.privateInfoResult}`,
    `- visualQuickLookResult: ${record.visualQuickLookResult}`,
    '',
    '## Notes',
    record.notes || 'なし',
    '',
    '## Safety Notes',
    '- この記録は人間がmanifestとPNGを見た結果の手動記録です。',
    '- artifactにはスクショ画像が含まれるため、共有前に必ず確認します。',
    '- failedや未確認がある場合はUIチェックへ進みません。',
  ].join('\n');
}
