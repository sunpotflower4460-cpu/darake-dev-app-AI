import type { RegisteredApp } from './appRegistry';

export type TodaysFocusEntry = {
  appId: string;
  appName: string;
  reason: string;
  recommendedAction: string;
};

export type TodaysFocus = {
  title: string;
  selectedApps: TodaysFocusEntry[];
  notToday: string[];
};

const MAX_FOCUS = 3;

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function buildTodaysFocus(apps: RegisteredApp[]): TodaysFocus {
  const scored: Array<{ app: RegisteredApp; score: number; reason: string; action: string }> = [];

  for (const app of apps) {
    let score = 0;
    let reason = '';
    let action = '';

    if (app.riskLevel === 'blocked') {
      score += 100;
      reason = '🔴 ブロック中';
      action = 'ブロック原因を確認・解消してください';
    } else if (app.riskLevel === 'manual-gate') {
      score += 80;
      reason = '🟠 手動承認待ち';
      action = '手動確認を実行してください';
    } else if (app.priority === 'dream-core') {
      score += 60;
      reason = '⭐ dream-core';
      action = app.nextAction || '進捗を確認してください';
    } else if (app.lifecycleStage === 'submission-prep') {
      score += 50;
      reason = '📦 提出準備中';
      action = '提出チェックリストを確認してください';
    } else if (app.priority === 'high') {
      score += 40;
      reason = '🔺 優先度 high';
      action = app.nextAction || '進捗を確認してください';
    } else if (app.lifecycleStage === 'post-release') {
      score += 35;
      reason = '📊 公開後フォロー';
      action = 'フィードバックを確認してください';
    } else if (daysSince(app.lastUpdatedAt) >= 7) {
      score += 25;
      reason = '💤 更新が滞っています';
      action = '現状を確認・再開してください';
    }

    if (score > 0) {
      scored.push({ app, score, reason, action });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, MAX_FOCUS);
  const notToday = scored.slice(MAX_FOCUS).map((s) => s.app.name);

  return {
    title: `今日のフォーカス (${selected.length}件)`,
    selectedApps: selected.map((s) => ({
      appId: s.app.id,
      appName: s.app.name,
      reason: s.reason,
      recommendedAction: s.action,
    })),
    notToday,
  };
}
