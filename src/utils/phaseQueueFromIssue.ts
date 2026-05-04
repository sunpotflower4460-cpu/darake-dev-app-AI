import type { IssueRecord } from './issueRecordStore';

export type PhaseQueueStatus = 'waiting' | 'ready' | 'linked' | 'needs-followup';

export type PhaseQueueItem = {
  id: string;
  phase: string;
  issueNumber: string;
  issueUrl: string;
  status: PhaseQueueStatus;
  message: string;
};

function mapIssueStatus(record: IssueRecord): PhaseQueueStatus {
  if (record.status === 'linked-to-phase') return 'linked';
  if (record.status === 'needs-followup') return 'needs-followup';
  if (record.status === 'submitted') return 'ready';
  return 'waiting';
}

export function buildPhaseQueueFromIssue(record: IssueRecord): PhaseQueueItem {
  const hasIssue = Boolean(record.number || record.url);
  const hasPhase = Boolean(record.phase);
  const status = mapIssueStatus(record);

  let message = 'Issueを作ったら、番号・URL・関連Phaseを記録します。';
  if (hasIssue && !hasPhase) {
    message = 'Issueは記録済みです。次に関連Phaseを入れるとQueueへ接続できます。';
  }
  if (hasIssue && hasPhase) {
    message = 'IssueとPhaseが接続されています。次はAuto Run Planで順番に並べられます。';
  }
  if (record.status === 'needs-followup') {
    message = '後で確認が必要です。Batch Gate Modeでは完成間近レポートへまとめます。';
  }

  return {
    id: 'current-issue-record',
    phase: record.phase || 'Phase未設定',
    issueNumber: record.number || 'Issue未記録',
    issueUrl: record.url,
    status,
    message,
  };
}
