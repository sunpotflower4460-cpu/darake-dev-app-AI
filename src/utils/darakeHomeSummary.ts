import type { RegisteredApp } from './appRegistry';
import type { ReleaseRecord } from './releaseRecord';
import type { PostReleaseFeedback } from './postReleaseFeedbackRecord';

export type DarakeHomeSummary = {
  todayItems: string[];
  blockedItems: string[];
  nearComplete: string[];
  preSubmission: string[];
  nextToBuild: string[];
  darakeComment: string;
};

export function buildDarakeHomeSummary(
  apps: RegisteredApp[],
  releases: ReleaseRecord[],
  feedbacks: PostReleaseFeedback[],
): DarakeHomeSummary {
  const blockedApps = apps.filter((a) => a.riskLevel === 'blocked' || a.riskLevel === 'manual-gate');
  const nearCompleteApps = apps.filter((a) => a.lifecycleStage === 'testing' || a.lifecycleStage === 'submission-prep');
  const preSubmissionApps = apps.filter((a) => a.lifecycleStage === 'submission-prep');
  const criticalFeedbacks = feedbacks.filter((f) => f.priority === 'critical' && f.status === 'new');
  const ideaApps = apps.filter((a) => a.lifecycleStage === 'idea');

  const todayItems: string[] = [];
  blockedApps.forEach((a) => todayItems.push(`🔴 ${a.name}: ブロック中 (${a.riskLevel})`));
  criticalFeedbacks.forEach((f) => todayItems.push(`🔴 フィードバック: ${f.title}`));
  preSubmissionApps.forEach((a) => todayItems.push(`📦 ${a.name}: 提出準備中`));

  const blockedItems = blockedApps.map((a) => `${a.name}: ${a.riskLevel} - ${a.nextAction || '確認が必要'}`);

  const nearCompleteItems = nearCompleteApps.map((a) => `${a.name}: ${a.lifecycleStage}`);

  const preSubmissionItems = preSubmissionApps.map((a) => `${a.name}: ${a.nextAction || '提出チェックリストを確認'}`);

  const releasedAppNames = new Set(releases.filter((r) => r.status === 'released').map((r) => r.appName));
  const nextToBuild = ideaApps
    .filter((a) => !releasedAppNames.has(a.name))
    .slice(0, 3)
    .map((a) => `${a.name}: ${a.notes || 'アイデア段階'}`);

  const darakeComment =
    blockedApps.length > 0
      ? `⚠️ ${blockedApps.length}件がブロック中です。でも大丈夫、ひとつずつ解消しましょう。`
      : preSubmissionApps.length > 0
        ? `📦 ${preSubmissionApps.length}件が提出直前です！もう少し！`
        : nearCompleteApps.length > 0
          ? `🎉 ${nearCompleteApps.length}件がもうすぐ完成！だらけながらでも進んでいます。`
          : apps.length === 0
            ? '🌱 まだアプリが登録されていません。最初のアプリを登録してみましょう。'
            : '😌 今日は落ち着いています。次のアイデアを温める時間にしましょう。';

  return {
    todayItems,
    blockedItems,
    nearComplete: nearCompleteItems,
    preSubmission: preSubmissionItems,
    nextToBuild,
    darakeComment,
  };
}
