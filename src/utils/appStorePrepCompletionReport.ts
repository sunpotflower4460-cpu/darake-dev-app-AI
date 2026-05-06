import { loadAppStoreMetadataDraft, summarizeAppStoreMetadataDraft } from './appStoreMetadataDraft';
import { loadPrivacyAgeRatingDraft, summarizePrivacyAgeRatingDraft } from './privacyAgeRatingDraft';
import { loadAppStoreScreenshotChecklist, summarizeAppStoreScreenshotChecklist } from './appStoreScreenshotChecklist';

export type AppStorePrepCompletionReport = {
  title: string;
  status: 'blocked' | 'needs-review' | 'ready-for-submission-control';
  completed: string[];
  missing: string[];
  manualGates: string[];
  warnings: string[];
  nextActions: string[];
};

export function buildAppStorePrepCompletionReport(): AppStorePrepCompletionReport {
  const metaDraft = loadAppStoreMetadataDraft();
  const metaSummary = summarizeAppStoreMetadataDraft(metaDraft);
  const privacyDraft = loadPrivacyAgeRatingDraft();
  const privacySummary = summarizePrivacyAgeRatingDraft(privacyDraft);
  const screenshotChecklist = loadAppStoreScreenshotChecklist();
  const screenshotSummary = summarizeAppStoreScreenshotChecklist(screenshotChecklist);

  const completed: string[] = [];
  const missing: string[] = [];
  const manualGates: string[] = [
    'App Store ConnectでSubmit for Reviewを人間が押す',
    'プライバシー・年齢レーティングの最終法的判断は人間が行う',
    'スクショのApp Store ConnectへのアップロードはApp Storeで人間が行う',
  ];
  const warnings: string[] = [];
  const nextActions: string[] = [];

  // Metadata
  if (metaDraft.appName.trim()) completed.push('アプリ名あり');
  else missing.push('アプリ名が未入力です');
  if (metaDraft.description.trim()) completed.push('説明文あり');
  else missing.push('説明文が未入力です');
  if (metaDraft.supportUrl.trim()) completed.push('サポートURLあり');
  else missing.push('サポートURLが未入力です');
  if (metaDraft.privacyPolicyUrl.trim()) completed.push('プライバシーポリシーURLあり');
  else missing.push('プライバシーポリシーURLが未入力です');
  if (metaSummary.warnings.length > 0) {
    warnings.push(...metaSummary.warnings);
  }

  // Privacy / Age Rating
  if (!privacySummary.blocked) {
    completed.push('プライバシー / 年齢レーティング確認済み');
  } else {
    missing.push(`プライバシー / 年齢レーティングにunknownがあります（${privacySummary.unknownItems.slice(0, 3).join(', ')}...）`);
  }

  // Screenshots
  if (screenshotSummary.status === 'ready') {
    completed.push('スクショ素材チェック完了');
  } else if (screenshotSummary.status === 'needs-review') {
    completed.push('スクショ素材チェック（warning）');
    warnings.push(...screenshotSummary.warnItems.map((i) => `スクショ: ${i}`));
  } else {
    if (screenshotSummary.failedItems.length > 0) {
      missing.push(`スクショチェックがfailedです: ${screenshotSummary.failedItems.slice(0, 2).join(', ')}`);
    }
    if (screenshotSummary.uncheckedItems.length > 0) {
      missing.push(`スクショチェックが未確認です（${screenshotSummary.uncheckedItems.length}件）`);
    }
  }

  // Determine status
  let status: AppStorePrepCompletionReport['status'];
  if (missing.length > 0 || metaSummary.blockers.length > 0) {
    status = 'blocked';
    nextActions.push('未入力のメタデータを埋めてください（Phase 12.2）');
    nextActions.push('プライバシー / 年齢レーティングのunknownを解消してください（Phase 12.4）');
    nextActions.push('スクショチェックを完了してください（Phase 12.5）');
  } else if (warnings.length > 0) {
    status = 'needs-review';
    nextActions.push('warningを確認してから提出管制室（Phase 13）へ進んでください');
  } else {
    status = 'ready-for-submission-control';
    nextActions.push('Phase 13：提出管制室へ進んでください');
    nextActions.push('App Store Connectを開いてメタデータを入力してください（人間が行います）');
  }

  return {
    title: 'App Store 提出準備 完成レポート',
    status,
    completed,
    missing,
    manualGates,
    warnings,
    nextActions,
  };
}

export function formatAppStorePrepCompletionReport(report: AppStorePrepCompletionReport): string {
  const lines: string[] = [
    `# ${report.title}`,
    '',
    `- status: ${report.status}`,
    '',
  ];
  if (report.completed.length > 0) {
    lines.push('## 完了');
    report.completed.forEach((i) => lines.push(`- ✅ ${i}`));
    lines.push('');
  }
  if (report.missing.length > 0) {
    lines.push('## 未完了 / Blockers');
    report.missing.forEach((i) => lines.push(`- 🔴 ${i}`));
    lines.push('');
  }
  if (report.warnings.length > 0) {
    lines.push('## Warnings');
    report.warnings.forEach((i) => lines.push(`- ⚠️ ${i}`));
    lines.push('');
  }
  lines.push('## 手動ゲート');
  report.manualGates.forEach((i) => lines.push(`- 🔒 ${i}`));
  lines.push('', '## 次のアクション');
  report.nextActions.forEach((i) => lines.push(`- ${i}`));
  lines.push(
    '',
    '## Safety Note',
    '- App Store Connect APIは呼びません',
    '- 最終Submitは人間が行います',
  );
  return lines.join('\n');
}
