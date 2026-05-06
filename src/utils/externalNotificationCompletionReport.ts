import { loadExternalNotificationChannels } from './externalNotificationChannels';

export type ExternalNotificationCompletionReport = {
  totalChannels: number;
  candidateChannels: string[];
  manualOnlyChannels: string[];
  blockedChannels: string[];
  secretRequiredChannels: string[];
  readyToUseChannels: string[];
  nextRecommendations: string[];
};

export function buildExternalNotificationCompletionReport(): ExternalNotificationCompletionReport {
  const channels = loadExternalNotificationChannels();

  const candidateChannels = channels.filter((c) => c.status === 'candidate').map((c) => c.label);
  const manualOnlyChannels = channels.filter((c) => c.status === 'manual-only').map((c) => c.label);
  const blockedChannels = channels.filter((c) => c.status === 'blocked').map((c) => c.label);
  const secretRequiredChannels = channels.filter((c) => c.requiresSecret).map((c) => c.label);
  const readyToUseChannels = channels
    .filter((c) => c.status === 'manual-only' || (c.status === 'candidate' && !c.requiresSecret))
    .map((c) => c.label);

  const nextRecommendations: string[] = [];
  if (candidateChannels.length > 0) {
    nextRecommendations.push('候補チャンネルのsecretを外部ツールで設定する');
  }
  if (manualOnlyChannels.length > 0) {
    nextRecommendations.push('手動コピー送信を試してみる');
  }
  if (blockedChannels.length > 0) {
    nextRecommendations.push('ブロック中のチャンネルの設定を見直す');
  }
  nextRecommendations.push('Phase 25 で実通知接続へ進む（manual gate前提）');

  return {
    totalChannels: channels.length,
    candidateChannels,
    manualOnlyChannels,
    blockedChannels,
    secretRequiredChannels,
    readyToUseChannels,
    nextRecommendations,
  };
}

export function formatExternalNotificationCompletionReportMarkdown(
  report: ExternalNotificationCompletionReport,
): string {
  return [
    '# 外部通知完成レポート',
    '',
    `- 総チャンネル数: ${report.totalChannels}`,
    `- 候補: ${report.candidateChannels.length}件 (${report.candidateChannels.join(', ') || 'なし'})`,
    `- 手動のみ: ${report.manualOnlyChannels.length}件 (${report.manualOnlyChannels.join(', ') || 'なし'})`,
    `- ブロック: ${report.blockedChannels.length}件 (${report.blockedChannels.join(', ') || 'なし'})`,
    `- secret必要: ${report.secretRequiredChannels.length}件 (${report.secretRequiredChannels.join(', ') || 'なし'})`,
    `- すぐ使える: ${report.readyToUseChannels.length}件 (${report.readyToUseChannels.join(', ') || 'なし'})`,
    '',
    '## 次のおすすめ',
    ...report.nextRecommendations.map((r) => `- ${r}`),
    '',
    '## 安全方針',
    '- Webhook 自動送信なし',
    '- secret / token をこのアプリ内に保存しない',
    '- 送信は外部ツールで手動実行',
  ].join('\n');
}
