import { loadAppStoreMetadataDraft, formatAppStoreMetadataDraft } from './appStoreMetadataDraft';
import { formatPrivacyAgeRatingDraft, loadPrivacyAgeRatingDraft, summarizePrivacyAgeRatingDraft } from './privacyAgeRatingDraft';
import { loadAppStoreScreenshotChecklist, summarizeAppStoreScreenshotChecklist } from './appStoreScreenshotChecklist';

export type AppStoreConnectInputPack = {
  title: string;
  status: 'blocked' | 'ready-to-copy' | 'needs-review';
  metadata: {
    appName: string;
    subtitle: string;
    promotionalText: string;
    description: string;
    keywords: string;
    supportUrl: string;
    privacyPolicyUrl: string;
    reviewNotes: string;
  };
  privacySummary: string;
  ageRatingSummary: string;
  screenshotSummary: string;
  manualSteps: string[];
  markdown: string;
};

export function buildAppStoreConnectInputPack(): AppStoreConnectInputPack {
  const meta = loadAppStoreMetadataDraft();
  const privacy = loadPrivacyAgeRatingDraft();
  const privacySummary = summarizePrivacyAgeRatingDraft(privacy);
  const screenshots = loadAppStoreScreenshotChecklist();
  const screenshotSummary = summarizeAppStoreScreenshotChecklist(screenshots);

  const hasBlocker =
    !meta.appName.trim() ||
    !meta.description.trim() ||
    !meta.supportUrl.trim() ||
    !meta.privacyPolicyUrl.trim() ||
    privacySummary.blocked;

  const hasWarning =
    !meta.keywords.trim() ||
    !meta.subtitle.trim() ||
    screenshotSummary.status !== 'ready';

  const status: AppStoreConnectInputPack['status'] = hasBlocker
    ? 'blocked'
    : hasWarning
      ? 'needs-review'
      : 'ready-to-copy';

  const metadata = {
    appName: meta.appName,
    subtitle: meta.subtitle,
    promotionalText: meta.promotionalText,
    description: meta.description,
    keywords: meta.keywords,
    supportUrl: meta.supportUrl,
    privacyPolicyUrl: meta.privacyPolicyUrl,
    reviewNotes: meta.reviewNotes,
  };

  const privacySummaryText = privacySummary.blocked
    ? `⚠️ unknownが${privacySummary.unknownItems.length}件残っています`
    : '✅ プライバシー確認済み';

  const ageRatingSummaryText = privacySummary.blocked
    ? '⚠️ 年齢レーティングの確認が必要です'
    : '✅ 年齢レーティング確認済み';

  const screenshotSummaryText =
    screenshotSummary.status === 'ready'
      ? '✅ スクショ素材OK'
      : screenshotSummary.status === 'needs-review'
        ? `⚠️ ${screenshotSummary.warnItems.length}件のwarn`
        : `🔴 ${screenshotSummary.failedItems.length}件のfailed / ${screenshotSummary.uncheckedItems.length}件未確認`;

  const manualSteps = [
    'App Store Connectを開く（https://appstoreconnect.apple.com）',
    'アプリを選択する',
    '対象バージョンを開く',
    'アプリ名・説明文・サブタイトル等を貼り付ける',
    'スクショをアップロードする',
    'プライバシー・年齢レーティングを設定する',
    'ビルドを選択する',
    '審査メモを入力する',
    'Submit for Reviewを人間が押す',
  ];

  const markdown = [
    '# App Store Connect 入力パック',
    '',
    `- status: ${status}`,
    '',
    '## メタデータ',
    `- アプリ名: ${metadata.appName || '（未入力）'}`,
    `- サブタイトル: ${metadata.subtitle || '（未入力）'}`,
    `- プロモーション文: ${metadata.promotionalText || '（未入力）'}`,
    '',
    '### 説明文',
    metadata.description || '（未入力）',
    '',
    `- キーワード: ${metadata.keywords || '（未入力）'}`,
    `- サポートURL: ${metadata.supportUrl || '（未入力）'}`,
    `- プライバシーポリシーURL: ${metadata.privacyPolicyUrl || '（未入力）'}`,
    `- 審査メモ: ${metadata.reviewNotes || '（未入力）'}`,
    '',
    '## プライバシー',
    privacySummaryText,
    '',
    '## 年齢レーティング',
    ageRatingSummaryText,
    '',
    '## スクショ',
    screenshotSummaryText,
    '',
    '## 手動ステップ',
    ...manualSteps.map((s) => `- ${s}`),
    '',
    '## Safety Note',
    '- App Store Connect APIは呼びません',
    '- Submit for Reviewは人間が行います',
  ].join('\n');

  return {
    title: 'App Store Connect 入力パック',
    status,
    metadata,
    privacySummary: privacySummaryText,
    ageRatingSummary: ageRatingSummaryText,
    screenshotSummary: screenshotSummaryText,
    manualSteps,
    markdown,
  };
}
