export type DryRunArtifactCheckStatus = 'unchecked' | 'success' | 'warn' | 'failed';

export type DryRunArtifactCheckRecord = {
  title: string;
  status: DryRunArtifactCheckStatus;
  checkedAt: string;
  workflowRunUrl: string;
  artifactUrl: string;
  artifactName: string;
  artifactFileName: string;
  schemaVersionResult: DryRunArtifactCheckStatus;
  runnerModeResult: DryRunArtifactCheckStatus;
  baseUrlResult: DryRunArtifactCheckStatus;
  targetsResult: DryRunArtifactCheckStatus;
  notes: string;
};

export type DryRunArtifactCheckSummary = {
  status: DryRunArtifactCheckStatus;
  message: string;
  successCount: number;
  warnCount: number;
  failedCount: number;
  uncheckedCount: number;
  canProceedToCapturePlanning: boolean;
};

const KEY = 'darake.dryRunArtifactCheckRecord.v1';

export function buildInitialDryRunArtifactCheckRecord(): DryRunArtifactCheckRecord {
  return {
    title: 'Dry-run Artifact Check Record',
    status: 'unchecked',
    checkedAt: '',
    workflowRunUrl: '',
    artifactUrl: '',
    artifactName: 'screenshot-plan-dry-run',
    artifactFileName: 'screenshot-plan.pretty.json',
    schemaVersionResult: 'unchecked',
    runnerModeResult: 'unchecked',
    baseUrlResult: 'unchecked',
    targetsResult: 'unchecked',
    notes: '',
  };
}

export function loadDryRunArtifactCheckRecord(): DryRunArtifactCheckRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return buildInitialDryRunArtifactCheckRecord();
    return {
      ...buildInitialDryRunArtifactCheckRecord(),
      ...(JSON.parse(raw) as Partial<DryRunArtifactCheckRecord>),
    };
  } catch {
    return buildInitialDryRunArtifactCheckRecord();
  }
}

export function saveDryRunArtifactCheckRecord(record: DryRunArtifactCheckRecord): DryRunArtifactCheckRecord {
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

export function clearDryRunArtifactCheckRecord(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}

function countStatus(record: DryRunArtifactCheckRecord, status: DryRunArtifactCheckStatus): number {
  return [
    record.status,
    record.schemaVersionResult,
    record.runnerModeResult,
    record.baseUrlResult,
    record.targetsResult,
  ].filter((item) => item === status).length;
}

export function summarizeDryRunArtifactCheckRecord(record: DryRunArtifactCheckRecord): DryRunArtifactCheckSummary {
  const successCount = countStatus(record, 'success');
  const warnCount = countStatus(record, 'warn');
  const failedCount = countStatus(record, 'failed');
  const uncheckedCount = countStatus(record, 'unchecked');

  if (failedCount > 0 || record.status === 'failed') {
    return {
      status: 'failed',
      message: 'failedがあります。実スクショ撮影へ進まず、dry-run結果を確認してください。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToCapturePlanning: false,
    };
  }

  if (uncheckedCount > 0 || record.status === 'unchecked') {
    return {
      status: 'unchecked',
      message: '未確認項目があります。artifact確認を完了してから次へ進みます。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToCapturePlanning: false,
    };
  }

  if (warnCount > 0 || record.status === 'warn') {
    return {
      status: 'warn',
      message: 'warnがあります。Batch Gate Modeでは注意点として残しつつ、内容確認が必要です。',
      successCount,
      warnCount,
      failedCount,
      uncheckedCount,
      canProceedToCapturePlanning: false,
    };
  }

  return {
    status: 'success',
    message: 'dry-run artifact確認は成功です。次の実スクショ撮影計画へ進む材料になります。',
    successCount,
    warnCount,
    failedCount,
    uncheckedCount,
    canProceedToCapturePlanning: true,
  };
}

export function formatDryRunArtifactCheckRecord(record: DryRunArtifactCheckRecord): string {
  const summary = summarizeDryRunArtifactCheckRecord(record);

  return [
    `# ${record.title}`,
    '',
    summary.message,
    '',
    `- status: ${summary.status}`,
    `- checkedAt: ${record.checkedAt || '未保存'}`,
    `- canProceedToCapturePlanning: ${String(summary.canProceedToCapturePlanning)}`,
    `- workflowRunUrl: ${record.workflowRunUrl || '未入力'}`,
    `- artifactUrl: ${record.artifactUrl || '未入力'}`,
    `- artifactName: ${record.artifactName}`,
    `- artifactFileName: ${record.artifactFileName}`,
    '',
    '## Results',
    `- schemaVersionResult: ${record.schemaVersionResult}`,
    `- runnerModeResult: ${record.runnerModeResult}`,
    `- baseUrlResult: ${record.baseUrlResult}`,
    `- targetsResult: ${record.targetsResult}`,
    '',
    '## Notes',
    record.notes || 'なし',
    '',
    '## Safety Notes',
    '- この記録は人間がartifactを見た結果の手動記録です。',
    '- artifactの自動取得・解析・スクショ撮影は行いません。',
    '- failedがある場合は実撮影へ進みません。',
  ].join('\n');
}
