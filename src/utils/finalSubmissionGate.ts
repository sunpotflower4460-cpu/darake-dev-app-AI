import { loadAppStoreMetadataDraft, summarizeAppStoreMetadataDraft } from './appStoreMetadataDraft';
import { loadPrivacyAgeRatingDraft, summarizePrivacyAgeRatingDraft } from './privacyAgeRatingDraft';
import { loadAppStoreScreenshotChecklist, summarizeAppStoreScreenshotChecklist } from './appStoreScreenshotChecklist';
import { loadTestFlightPrepChecklist, summarizeTestFlightPrepChecklist } from './testFlightPrepChecklist';

export type FinalSubmissionGateStatus = 'blocked' | 'needs-review' | 'ready-manual-submit';

export type FinalSubmissionGate = {
  title: string;
  status: FinalSubmissionGateStatus;
  message: string;
  blockers: string[];
  warnings: string[];
  readyItems: string[];
  manualActions: string[];
  confirmMemo: string;
};

export function buildFinalSubmissionGate(): FinalSubmissionGate {
  const meta = loadAppStoreMetadataDraft();
  const metaSummary = summarizeAppStoreMetadataDraft(meta);
  const privacy = loadPrivacyAgeRatingDraft();
  const privacySummary = summarizePrivacyAgeRatingDraft(privacy);
  const screenshots = loadAppStoreScreenshotChecklist();
  const screenshotSummary = summarizeAppStoreScreenshotChecklist(screenshots);
  const testFlight = loadTestFlightPrepChecklist();
  const testFlightSummary = summarizeTestFlightPrepChecklist(testFlight);

  const blockers: string[] = [];
  const warnings: string[] = [];
  const readyItems: string[] = [];

  // Metadata
  if (metaSummary.blockers.length > 0) {
    blockers.push(...metaSummary.blockers.map((b) => `メタデータ: ${b}`));
  } else {
    readyItems.push('メタデータ OK');
  }
  warnings.push(...metaSummary.warnings.map((w) => `メタデータ: ${w}`));

  // Privacy
  if (privacySummary.blocked) {
    blockers.push(`プライバシー: unknownが${privacySummary.unknownItems.length}件あります`);
  } else {
    readyItems.push('プライバシー確認済み');
  }

  // Screenshots
  if (screenshotSummary.status === 'blocked') {
    if (screenshotSummary.failedItems.length > 0) {
      blockers.push(`スクショ: failed項目があります（${screenshotSummary.failedItems.length}件）`);
    }
    if (screenshotSummary.uncheckedItems.length > 0) {
      blockers.push(`スクショ: 未確認項目があります（${screenshotSummary.uncheckedItems.length}件）`);
    }
  } else if (screenshotSummary.status === 'needs-review') {
    warnings.push(`スクショ: ${screenshotSummary.warnItems.length}件のwarnがあります`);
    readyItems.push('スクショ（warn）');
  } else {
    readyItems.push('スクショ OK');
  }

  // TestFlight
  if (testFlightSummary.status === 'blocked') {
    warnings.push(`TestFlight: 未確認項目があります（${testFlightSummary.uncheckedItems.length + testFlightSummary.failedItems.length}件）`);
  } else {
    readyItems.push('TestFlight確認済み');
  }

  // Build (always manual)
  blockers.push('ビルド選択: App Store Connectで人間が選択する（必須）');

  const status: FinalSubmissionGateStatus =
    blockers.length > 0 ? 'blocked' : warnings.length > 0 ? 'needs-review' : 'ready-manual-submit';

  const message =
    status === 'blocked'
      ? 'blockerがあります。Submit for Reviewへ進む前に解消してください。'
      : status === 'needs-review'
        ? 'warningがあります。内容を確認してからApp Store ConnectでSubmit for Reviewを行ってください。'
        : 'ほぼ準備が整っています。App Store ConnectでSubmit for Reviewを人間が押してください。このアプリは自動提出しません。';

  const manualActions = [
    '① App Store Connectを開く（https://appstoreconnect.apple.com）',
    '② 対象アプリ・バージョンを開く',
    '③ ビルドを選択する',
    '④ メタデータを最終確認する',
    '⑤ スクショを確認する',
    '⑥ プライバシー・年齢レーティングを確認する',
    '⑦ 審査メモを確認する',
    '⑧ Submit for Review を自分で押す',
  ];

  const confirmMemo = [
    '## Submit前最終確認メモ',
    '',
    `- status: ${status}`,
    `- blockers: ${blockers.length}件`,
    `- warnings: ${warnings.length}件`,
    `- readyItems: ${readyItems.length}件`,
    '',
    '## 手動アクション',
    ...manualActions.map((a) => `- ${a}`),
    '',
    '## Safety Note',
    '- このアプリはSubmit for Reviewを押しません',
    '- 最終Submitは必ず人間が行います',
  ].join('\n');

  return {
    title: 'Final Submission Gate',
    status,
    message,
    blockers,
    warnings,
    readyItems,
    manualActions,
    confirmMemo,
  };
}
