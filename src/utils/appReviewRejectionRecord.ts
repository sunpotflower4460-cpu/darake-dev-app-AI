export type AppReviewRejectionRecord = {
  rejectionDate: string;
  appVersion: string;
  guidelineNumber: string;
  appleMessage: string;
  attachmentNotes: string;
  affectedFeature: string;
  severity: 'low' | 'medium' | 'high' | 'unknown';
  responseStatus: 'pending' | 'in-progress' | 'resolved' | 'appealed';
  nextAction: string;
};

const STORAGE_KEY = 'darake.appReviewRejectionRecord.v1';

export function buildInitialAppReviewRejectionRecord(): AppReviewRejectionRecord {
  return {
    rejectionDate: '',
    appVersion: '',
    guidelineNumber: '',
    appleMessage: '',
    attachmentNotes: '',
    affectedFeature: '',
    severity: 'unknown',
    responseStatus: 'pending',
    nextAction: '',
  };
}

export function loadAppReviewRejectionRecord(): AppReviewRejectionRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialAppReviewRejectionRecord();
    return { ...buildInitialAppReviewRejectionRecord(), ...JSON.parse(raw) };
  } catch {
    return buildInitialAppReviewRejectionRecord();
  }
}

export function saveAppReviewRejectionRecord(record: AppReviewRejectionRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore
  }
}

export function clearAppReviewRejectionRecord(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function formatAppReviewRejectionRecord(record: AppReviewRejectionRecord): string {
  return [
    '# App Review リジェクト記録',
    '',
    `- リジェクト日: ${record.rejectionDate || '（未入力）'}`,
    `- アプリバージョン: ${record.appVersion || '（未入力）'}`,
    `- ガイドライン番号: ${record.guidelineNumber || '（未入力）'}`,
    `- 対象機能: ${record.affectedFeature || '（未入力）'}`,
    `- Severity: ${record.severity}`,
    `- 対応状況: ${record.responseStatus}`,
    '',
    '## Appleのメッセージ',
    record.appleMessage || '（未入力）',
    '',
    '## 添付・スクショメモ',
    record.attachmentNotes || '（未入力）',
    '',
    '## 次のアクション',
    record.nextAction || '（未入力）',
    '',
    '## Safety Note',
    '- Appleへの自動返信はしません',
    '- 最終返信は人間が行います',
  ].join('\n');
}
