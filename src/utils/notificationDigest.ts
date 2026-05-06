import type { NotificationEvent, NotificationSeverity } from './notificationEventModel';
import { buildNotificationEvent } from './notificationEventModel';

export type NotificationDigest = {
  title: string;
  status: 'quiet' | 'has-warning' | 'needs-attention' | 'blocked';
  immediateEvents: NotificationEvent[];
  batchedEvents: NotificationEvent[];
  message: string;
  markdown: string;
};

function computeStatus(
  immediateEvents: NotificationEvent[],
  batchedEvents: NotificationEvent[],
): NotificationDigest['status'] {
  if (immediateEvents.some((e) => e.severity === 'blocked' || e.severity === 'manual-gate')) return 'blocked';
  if (immediateEvents.length > 0) return 'needs-attention';
  if (batchedEvents.length > 0) return 'has-warning';
  return 'quiet';
}

export function buildNotificationDigest(events: NotificationEvent[]): NotificationDigest {
  const immediateEvents = events.filter((e) => e.shouldNotifyNow);
  const batchedEvents = events.filter((e) => e.canBatchUntilCompletionReport);

  const status = computeStatus(immediateEvents, batchedEvents);

  const message =
    status === 'quiet'
      ? '確認が必要な通知はありません。'
      : status === 'has-warning'
        ? `${batchedEvents.length}件の通知を完成レポートにまとめます。`
        : status === 'needs-attention'
          ? `今すぐ確認が必要な通知が${immediateEvents.length}件あります。`
          : `${immediateEvents.length}件のblocked / manual-gate があります。今すぐ対応してください。`;

  const markdownLines: string[] = [
    `# 通知ダイジェスト`,
    '',
    `- status: ${status}`,
    `- 即通知: ${immediateEvents.length}件`,
    `- バッチ: ${batchedEvents.length}件`,
    '',
    message,
  ];

  if (immediateEvents.length > 0) {
    markdownLines.push('', '## 今すぐ確認');
    immediateEvents.forEach((e) => markdownLines.push(`- [${e.severity}] ${e.title}: ${e.summary}`));
  }

  if (batchedEvents.length > 0) {
    markdownLines.push('', '## 完成レポート行き');
    batchedEvents.forEach((e) => markdownLines.push(`- [${e.severity}] ${e.title}: ${e.summary}`));
  }

  return {
    title: '通知ダイジェスト',
    status,
    immediateEvents,
    batchedEvents,
    message,
    markdown: markdownLines.join('\n'),
  };
}

export function buildSampleDigest(): NotificationDigest {
  const events: NotificationEvent[] = [
    buildNotificationEvent({
      id: 'sample-manual-gate',
      type: 'manual-gate',
      severity: 'manual-gate',
      appName: 'だらけアプリ',
      phaseLabel: 'Phase 11',
      title: '手動ゲート発生',
      summary: 'App Store提出前に人間の確認が必要です。',
      reason: '提出フローの最終確認は必ず人間が行います。',
      actionRequired: 'App Store Connect を開き内容を確認してください。',
      urls: [],
    }),
    buildNotificationEvent({
      id: 'sample-warning',
      type: 'completion-near',
      severity: 'warning',
      appName: 'だらけアプリ',
      phaseLabel: 'Phase 11',
      title: '完成間近',
      summary: 'スクショ準備に軽微なwarningがあります。',
      reason: '1枚目スクショの印象を改善できる可能性があります。',
      actionRequired: '完成レポートで確認してください。',
      urls: [],
    }),
  ];
  return buildNotificationDigest(events);
}

// Severityラベル用ヘルパー
export function severityLabel(s: NotificationSeverity): string {
  const map: Record<NotificationSeverity, string> = {
    info: 'ℹ️ info',
    success: '✅ success',
    warning: '⚠️ warning',
    'manual-gate': '🔒 manual-gate',
    blocked: '🔴 blocked',
  };
  return map[s] ?? s;
}
