import type { NotificationDryRunTargetType } from './notificationDryRunTarget';

export type NotificationSentRecordStatus =
  | 'draft'
  | 'sent-manually'
  | 'skipped'
  | 'failed'
  | 'needs-follow-up';

export type NotificationSentRecord = {
  id: string;
  targetType: NotificationDryRunTargetType;
  title: string;
  messageSummary: string;
  status: NotificationSentRecordStatus;
  sentAt: string;
  sentBy: 'human';
  destinationLabel: string;
  followUpNeeded: boolean;
  followUpNotes: string;
  notes: string;
};

const STORAGE_KEY = 'darake.notificationSentRecords.v1';

export function loadNotificationSentRecords(): NotificationSentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NotificationSentRecord[];
  } catch {
    return [];
  }
}

export function saveNotificationSentRecords(records: NotificationSentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function addNotificationSentRecord(
  records: NotificationSentRecord[],
  record: NotificationSentRecord,
): NotificationSentRecord[] {
  return [record, ...records];
}

export function updateNotificationSentRecord(
  records: NotificationSentRecord[],
  id: string,
  patch: Partial<NotificationSentRecord>,
): NotificationSentRecord[] {
  return records.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

export function clearNotificationSentRecords(): NotificationSentRecord[] {
  saveNotificationSentRecords([]);
  return [];
}

export function buildInitialNotificationSentRecord(): NotificationSentRecord {
  return {
    id: `sent-${Date.now()}`,
    targetType: 'manual-copy',
    title: '',
    messageSummary: '',
    status: 'draft',
    sentAt: new Date().toISOString(),
    sentBy: 'human',
    destinationLabel: '',
    followUpNeeded: false,
    followUpNotes: '',
    notes: '',
  };
}

export function formatNotificationSentRecordMarkdown(record: NotificationSentRecord): string {
  return [
    `## ${record.title}`,
    `- id: ${record.id}`,
    `- targetType: ${record.targetType}`,
    `- status: ${record.status}`,
    `- sentAt: ${record.sentAt}`,
    `- sentBy: ${record.sentBy}`,
    `- destination: ${record.destinationLabel || '(未設定)'}`,
    `- followUpNeeded: ${record.followUpNeeded ? 'はい' : 'いいえ'}`,
    record.followUpNotes ? `- followUpNotes: ${record.followUpNotes}` : '',
    `- messageSummary: ${record.messageSummary}`,
    record.notes ? `- notes: ${record.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function summarizeNotificationSentRecords(records: NotificationSentRecord[]): string {
  const byStatus = {
    'sent-manually': records.filter((r) => r.status === 'sent-manually').length,
    skipped: records.filter((r) => r.status === 'skipped').length,
    failed: records.filter((r) => r.status === 'failed').length,
    draft: records.filter((r) => r.status === 'draft').length,
    'needs-follow-up': records.filter((r) => r.status === 'needs-follow-up').length,
  };
  const followUp = records.filter((r) => r.followUpNeeded).length;
  return [
    `## 通知送信記録 (${records.length}件)`,
    `- sent-manually: ${byStatus['sent-manually']}件`,
    `- skipped: ${byStatus.skipped}件`,
    `- failed: ${byStatus.failed}件`,
    `- draft: ${byStatus.draft}件`,
    `- needs-follow-up: ${byStatus['needs-follow-up']}件`,
    `- フォローアップ必要: ${followUp}件`,
  ].join('\n');
}
