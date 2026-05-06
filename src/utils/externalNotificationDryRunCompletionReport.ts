import { buildDefaultNotificationDryRunTargets } from './notificationDryRunTarget';
import { loadNotificationSentRecords } from './notificationSentRecord';

export type ExternalNotificationDryRunCompletionReport = {
  title: string;
  status: 'blocked' | 'needs-review' | 'ready-for-manual-notification';
  completed: string[];
  warnings: string[];
  blockers: string[];
  nextRecommendedPhase: string;
  nextActions: string[];
};

export function buildExternalNotificationDryRunCompletionReport(): ExternalNotificationDryRunCompletionReport {
  const targets = buildDefaultNotificationDryRunTargets();
  const sentRecords = loadNotificationSentRecords();

  const manualCopyReady = targets.filter((t) => t.status === 'manual-copy-ready');
  const draftOnly = targets.filter((t) => t.status === 'draft-only');
  const blocked = targets.filter((t) => t.status === 'blocked');

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (blocked.length > 0) {
    blockers.push(`blockedなターゲットが${blocked.length}件あります: ${blocked.map((t) => t.label).join(', ')}`);
  }

  if (manualCopyReady.length === 0) {
    warnings.push('manual-copy-readyなターゲットが0件です。手動コピーで送れるターゲットを確認してください。');
  }

  const failedRecords = sentRecords.filter((r) => r.status === 'failed');
  if (failedRecords.length > 0) {
    warnings.push(`送信失敗記録が${failedRecords.length}件あります。確認してください。`);
  }

  const followUpRecords = sentRecords.filter((r) => r.followUpNeeded);
  if (followUpRecords.length > 0) {
    warnings.push(`フォローアップが必要な通知が${followUpRecords.length}件あります。`);
  }

  const completed = [
    `通知dry-runターゲット: ${targets.length}件を整理した`,
    `manual-copy-ready: ${manualCopyReady.length}件`,
    `draft-only: ${draftOnly.length}件（secretは外部管理）`,
    'Notification Payload Dry-run Builderを用意した',
    'Notification Safety Gateを用意した',
    'Manual Notification Send Packを用意した',
    `通知送信記録: ${sentRecords.length}件を管理している`,
    '外部送信なし・secret保存なし・すべてdry-run / manual-copy',
  ];

  const nextActions = [
    'manual-copy-readyのターゲットで試しに通知文を作成する',
    'Safety Gateで通知文の安全確認を行う',
    '実際に送る場合はManual Send Packの手順どおり手動で送信する',
    '送信後はNotificationSentRecordに記録する',
    'Phase 27: GitHub実行 dry-run へ進む',
  ];

  return {
    title: 'Phase 26 External Notification Dry-run Completion Report',
    status: blockers.length > 0 ? 'blocked' : warnings.length > 0 ? 'needs-review' : 'ready-for-manual-notification',
    completed,
    warnings,
    blockers,
    nextRecommendedPhase: 'Phase 27: GitHub実行 dry-run',
    nextActions,
  };
}

export function formatExternalNotificationDryRunCompletionReportMarkdown(
  report: ExternalNotificationDryRunCompletionReport,
): string {
  const lines = [`# ${report.title}`, `Status: ${report.status}`, '', '## 完了項目'];
  report.completed.forEach((item) => lines.push(`- ✅ ${item}`));

  lines.push('', '## Warnings');
  if (report.warnings.length > 0) {
    report.warnings.forEach((w) => lines.push(`- ⚠️ ${w}`));
  } else {
    lines.push('- なし');
  }

  if (report.blockers.length > 0) {
    lines.push('', '## Blockers');
    report.blockers.forEach((b) => lines.push(`- 🔴 ${b}`));
  }

  lines.push('', '## Next Recommended Phase', report.nextRecommendedPhase, '', '## Next Actions');
  report.nextActions.forEach((a) => lines.push(`- ${a}`));

  lines.push(
    '',
    '## 安全方針',
    '- 外部通知は送信しません',
    '- Webhookは叩きません',
    '- secret / token / webhook URL を保存しません',
    '- すべてmanual copy / dry-runです',
  );

  return lines.join('\n');
}
