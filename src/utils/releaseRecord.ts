export type ReleaseStatus =
  | 'draft'
  | 'submitted'
  | 'in-review'
  | 'approved'
  | 'released'
  | 'rejected'
  | 'paused'
  | 'needs-update';

export type ReleaseRecord = {
  appId: string;
  appName: string;
  version: string;
  buildNumber: string;
  platform: 'ios' | 'android' | 'web' | 'other';
  status: ReleaseStatus;
  submittedAt: string;
  releasedAt: string;
  storeUrl: string;
  testFlightUrl: string;
  notes: string;
  knownIssues: string[];
  nextUpdateIdeas: string[];
};

const STORAGE_KEY = 'darake.releaseRecords.v1';

export function buildInitialReleaseRecord(): ReleaseRecord {
  return {
    appId: '',
    appName: '',
    version: '1.0.0',
    buildNumber: '1',
    platform: 'ios',
    status: 'draft',
    submittedAt: '',
    releasedAt: '',
    storeUrl: '',
    testFlightUrl: '',
    notes: '',
    knownIssues: [],
    nextUpdateIdeas: [],
  };
}

export function loadReleaseRecords(): ReleaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReleaseRecord[];
  } catch {
    return [];
  }
}

export function saveReleaseRecords(records: ReleaseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function addReleaseRecord(records: ReleaseRecord[], record: ReleaseRecord): ReleaseRecord[] {
  return [...records, record];
}

export function updateReleaseRecord(records: ReleaseRecord[], updated: ReleaseRecord): ReleaseRecord[] {
  return records.map((r) => (r.appId === updated.appId && r.version === updated.version ? updated : r));
}

export function formatReleaseRecordMarkdown(record: ReleaseRecord): string {
  const lines: string[] = [
    `# リリース記録: ${record.appName || '（未入力）'} v${record.version}`,
    '',
    `- **appId**: ${record.appId || '（未入力）'}`,
    `- **platform**: ${record.platform}`,
    `- **buildNumber**: ${record.buildNumber || '（未入力）'}`,
    `- **status**: ${record.status}`,
    `- **submittedAt**: ${record.submittedAt || '（未記録）'}`,
    `- **releasedAt**: ${record.releasedAt || '（未記録）'}`,
    `- **storeUrl**: ${record.storeUrl || '（未入力）'}`,
    `- **testFlightUrl**: ${record.testFlightUrl || '（未入力）'}`,
    '',
    '## メモ',
    record.notes || '（なし）',
    '',
    '## 既知の問題',
    ...record.knownIssues.map((i) => `- ${i}`),
    record.knownIssues.length === 0 ? '（なし）' : '',
    '',
    '## 次アップデートアイデア',
    ...record.nextUpdateIdeas.map((i) => `- ${i}`),
    record.nextUpdateIdeas.length === 0 ? '（なし）' : '',
    '',
    '## Safety Note',
    '- App Store / Google Play への操作は自動実行しません',
    '- secret / token は保存しません',
  ];
  return lines.join('\n');
}
