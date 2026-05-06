import type { RegisteredApp } from './appRegistry';

export type CrossAppDigestEntry = {
  appId: string;
  appName: string;
  message: string;
  urgency: 'now' | 'today' | 'report' | 'ignore';
};

export type CrossAppNotificationDigest = {
  now: CrossAppDigestEntry[];
  today: CrossAppDigestEntry[];
  report: CrossAppDigestEntry[];
  ignore: CrossAppDigestEntry[];
  summary: string;
};

export function buildCrossAppNotificationDigest(apps: RegisteredApp[]): CrossAppNotificationDigest {
  const now: CrossAppDigestEntry[] = [];
  const today: CrossAppDigestEntry[] = [];
  const report: CrossAppDigestEntry[] = [];
  const ignore: CrossAppDigestEntry[] = [];

  for (const app of apps) {
    if (app.riskLevel === 'blocked') {
      now.push({ appId: app.id, appName: app.name, message: '🔴 ブロック中 - 即対応が必要です', urgency: 'now' });
    } else if (app.riskLevel === 'manual-gate') {
      now.push({ appId: app.id, appName: app.name, message: '🟠 手動承認待ち - 確認してください', urgency: 'now' });
    } else if (app.lifecycleStage === 'submission-prep') {
      today.push({ appId: app.id, appName: app.name, message: '📦 提出準備中 - 今日中に確認を', urgency: 'today' });
    } else if (app.lifecycleStage === 'post-release') {
      today.push({ appId: app.id, appName: app.name, message: '📊 公開後フォロー中', urgency: 'today' });
    } else if (app.lifecycleStage === 'in-review') {
      today.push({ appId: app.id, appName: app.name, message: '🔍 審査中 - 結果を待っています', urgency: 'today' });
    } else if (app.lifecycleStage === 'released') {
      report.push({ appId: app.id, appName: app.name, message: '✅ 公開済み - 定期確認でOK', urgency: 'report' });
    } else if (app.lifecycleStage === 'archived' || app.lifecycleStage === 'paused') {
      ignore.push({ appId: app.id, appName: app.name, message: '🗃 停止中 / アーカイブ', urgency: 'ignore' });
    } else {
      report.push({ appId: app.id, appName: app.name, message: `${app.lifecycleStage} - 通常進行中`, urgency: 'report' });
    }
  }

  const summary =
    now.length > 0
      ? `🔴 今すぐ確認が必要なアプリが${now.length}件あります`
      : today.length > 0
        ? `🟡 今日確認すべきアプリが${today.length}件あります`
        : '✅ 緊急対応は不要です';

  return { now, today, report, ignore, summary };
}
