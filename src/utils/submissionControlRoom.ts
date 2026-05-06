import { loadAppStoreMetadataDraft, summarizeAppStoreMetadataDraft } from './appStoreMetadataDraft';
import { loadPrivacyAgeRatingDraft, summarizePrivacyAgeRatingDraft } from './privacyAgeRatingDraft';
import { loadAppStoreScreenshotChecklist, summarizeAppStoreScreenshotChecklist } from './appStoreScreenshotChecklist';
import { buildAppStorePrepCompletionReport } from './appStorePrepCompletionReport';

export type SubmissionControlRoomStatus =
  | 'blocked'
  | 'needs-review'
  | 'ready-to-open-app-store-connect';

export type SubmissionControlRoom = {
  title: string;
  status: SubmissionControlRoomStatus;
  message: string;
  sections: Array<{
    id: string;
    label: string;
    status: 'pass' | 'warn' | 'fail' | 'unchecked';
    detail: string;
  }>;
  manualGates: string[];
  nextActions: string[];
};

export function buildSubmissionControlRoom(): SubmissionControlRoom {
  const metaDraft = loadAppStoreMetadataDraft();
  const metaSummary = summarizeAppStoreMetadataDraft(metaDraft);
  const privacyDraft = loadPrivacyAgeRatingDraft();
  const privacySummary = summarizePrivacyAgeRatingDraft(privacyDraft);
  const screenshotChecklist = loadAppStoreScreenshotChecklist();
  const screenshotSummary = summarizeAppStoreScreenshotChecklist(screenshotChecklist);
  const prepReport = buildAppStorePrepCompletionReport();

  const sections: SubmissionControlRoom['sections'] = [
    {
      id: 'metadata',
      label: 'メタデータ',
      status:
        metaSummary.blockers.length > 0
          ? 'fail'
          : metaSummary.warnings.length > 0
            ? 'warn'
            : 'pass',
      detail:
        metaSummary.blockers.length > 0
          ? `blockerあり: ${metaSummary.blockers.slice(0, 2).join(', ')}`
          : metaSummary.warnings.length > 0
            ? `warningあり: ${metaSummary.warnings.slice(0, 2).join(', ')}`
            : 'メタデータOK',
    },
    {
      id: 'screenshots',
      label: 'スクショ',
      status:
        screenshotSummary.status === 'ready'
          ? 'pass'
          : screenshotSummary.status === 'needs-review'
            ? 'warn'
            : screenshotSummary.status === 'blocked'
              ? 'fail'
              : 'unchecked',
      detail:
        screenshotSummary.failedItems.length > 0
          ? `failed: ${screenshotSummary.failedItems.slice(0, 2).join(', ')}`
          : screenshotSummary.uncheckedItems.length > 0
            ? `未確認: ${screenshotSummary.uncheckedItems.length}件`
            : screenshotSummary.warnItems.length > 0
              ? `warning: ${screenshotSummary.warnItems.slice(0, 2).join(', ')}`
              : 'スクショOK',
    },
    {
      id: 'privacy',
      label: 'プライバシー',
      status: privacySummary.blocked ? 'fail' : 'pass',
      detail: privacySummary.blocked
        ? `unknownが${privacySummary.unknownItems.length}件あります`
        : 'プライバシー確認済み',
    },
    {
      id: 'age-rating',
      label: '年齢レーティング',
      status: privacySummary.blocked ? 'unchecked' : 'pass',
      detail: privacySummary.blocked
        ? 'プライバシー / 年齢レーティングを完了してください'
        : '年齢レーティング確認済み',
    },
    {
      id: 'build',
      label: 'ビルド選択',
      status: 'unchecked',
      detail: 'App Store Connectでビルドを選択してください（人間が行います）',
    },
    {
      id: 'testflight',
      label: 'TestFlight',
      status: 'unchecked',
      detail: 'TestFlight確認は人間が行います',
    },
    {
      id: 'review-notes',
      label: '審査メモ',
      status: metaDraft.reviewNotes.trim() ? 'pass' : 'warn',
      detail: metaDraft.reviewNotes.trim() ? '審査メモあり' : '審査メモが未入力です（推奨）',
    },
    {
      id: 'submit',
      label: 'Submit for Review',
      status: 'unchecked',
      detail: '最終Submitは必ず人間が行います。このアプリは自動提出しません。',
    },
  ];

  const hasFail = sections.some((s) => s.status === 'fail');
  const hasWarn = sections.some((s) => s.status === 'warn');

  let status: SubmissionControlRoomStatus;
  if (hasFail || prepReport.status === 'blocked') {
    status = 'blocked';
  } else if (hasWarn || prepReport.status === 'needs-review') {
    status = 'needs-review';
  } else {
    status = 'ready-to-open-app-store-connect';
  }

  const message =
    status === 'blocked'
      ? 'blockerがあります。未完了のセクションを解消してください。'
      : status === 'needs-review'
        ? 'warningがあります。確認してからApp Store Connectへ進んでください。'
        : 'App Store Connectを開く準備ができています。Submit for Reviewは人間が行います。';

  const manualGates = [
    'App Store ConnectでSubmit for Reviewを人間が押す',
    'ビルドの選択はApp Store Connect上で人間が行う',
    'スクショのアップロードはApp Store Connect上で人間が行う',
    'プライバシー / 年齢レーティングの最終確認は人間が行う',
  ];

  const nextActions =
    status === 'blocked'
      ? [
          'Phase 12のフォームに戻ってblockerを解消してください',
          'プライバシー / 年齢レーティングのunknownを解消してください',
          'スクショチェックを完了してください',
        ]
      : status === 'needs-review'
        ? [
            'warningを確認してから次へ進んでください',
            'App Store Connect入力パック（Phase 13.2）を確認してください',
          ]
        : [
            'App Store Connect入力パック（Phase 13.2）を開いてください',
            'TestFlightチェック（Phase 13.4）を確認してください',
            '最終ゲート（Phase 13.5）を確認してください',
          ];

  return {
    title: '提出管制室 / Submission Control Room',
    status,
    message,
    sections,
    manualGates,
    nextActions,
  };
}
