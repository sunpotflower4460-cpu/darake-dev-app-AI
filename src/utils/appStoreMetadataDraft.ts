export type AppStoreMetadataDraft = {
  appName: string;
  subtitle: string;
  promotionalText: string;
  description: string;
  keywords: string;
  categoryPrimary: string;
  categorySecondary: string;
  supportUrl: string;
  privacyPolicyUrl: string;
  reviewNotes: string;
  loginRequired: 'unknown' | 'no' | 'yes';
  hasIap: 'unknown' | 'no' | 'yes';
  collectsData: 'unknown' | 'no' | 'yes';
  usesTracking: 'unknown' | 'no' | 'yes';
  ageRatingNotes: string;
  privacyNotes: string;
  screenshotNotes: string;
  iconNotes: string;
};

const STORAGE_KEY = 'darake.appStoreMetadataDraft.v1';

export function buildInitialAppStoreMetadataDraft(): AppStoreMetadataDraft {
  return {
    appName: '',
    subtitle: '',
    promotionalText: '',
    description: '',
    keywords: '',
    categoryPrimary: '',
    categorySecondary: '',
    supportUrl: '',
    privacyPolicyUrl: '',
    reviewNotes: '',
    loginRequired: 'unknown',
    hasIap: 'unknown',
    collectsData: 'unknown',
    usesTracking: 'unknown',
    ageRatingNotes: '',
    privacyNotes: '',
    screenshotNotes: '',
    iconNotes: '',
  };
}

export function loadAppStoreMetadataDraft(): AppStoreMetadataDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialAppStoreMetadataDraft();
    return { ...buildInitialAppStoreMetadataDraft(), ...JSON.parse(raw) };
  } catch {
    return buildInitialAppStoreMetadataDraft();
  }
}

export function saveAppStoreMetadataDraft(draft: AppStoreMetadataDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

export function clearAppStoreMetadataDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function summarizeAppStoreMetadataDraft(draft: AppStoreMetadataDraft): {
  blockers: string[];
  warnings: string[];
  ready: boolean;
} {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!draft.appName.trim()) blockers.push('アプリ名が未入力です');
  if (!draft.description.trim()) blockers.push('説明文が未入力です');
  if (!draft.supportUrl.trim()) blockers.push('サポートURLが未入力です');
  if (!draft.privacyPolicyUrl.trim()) blockers.push('プライバシーポリシーURLが未入力です');
  if (draft.collectsData === 'unknown') blockers.push('データ収集有無が未確認です（unknown）');
  if (draft.usesTracking === 'unknown') blockers.push('トラッキング有無が未確認です（unknown）');
  if (draft.loginRequired === 'unknown') blockers.push('ログイン必要か未確認です（unknown）');
  if (draft.hasIap === 'unknown') blockers.push('課金有無が未確認です（unknown）');

  if (!draft.keywords.trim()) warnings.push('キーワードが未入力です');
  if (!draft.subtitle.trim()) warnings.push('サブタイトルが未入力です');
  if (!draft.reviewNotes.trim()) warnings.push('審査メモが未入力です');
  if (!draft.screenshotNotes.trim()) warnings.push('スクショメモが未入力です');
  if (!draft.iconNotes.trim()) warnings.push('アイコンメモが未入力です');

  return { blockers, warnings, ready: blockers.length === 0 };
}

export function formatAppStoreMetadataDraft(draft: AppStoreMetadataDraft): string {
  const lines: string[] = [
    '# App Store メタデータ下書き',
    '',
    `- **アプリ名**: ${draft.appName || '（未入力）'}`,
    `- **サブタイトル**: ${draft.subtitle || '（未入力）'}`,
    `- **プロモーション文**: ${draft.promotionalText || '（未入力）'}`,
    '',
    '## 説明文',
    draft.description || '（未入力）',
    '',
    `- **キーワード**: ${draft.keywords || '（未入力）'}`,
    `- **カテゴリ（主）**: ${draft.categoryPrimary || '（未入力）'}`,
    `- **カテゴリ（副）**: ${draft.categorySecondary || '（未入力）'}`,
    `- **サポートURL**: ${draft.supportUrl || '（未入力）'}`,
    `- **プライバシーポリシーURL**: ${draft.privacyPolicyUrl || '（未入力）'}`,
    '',
    '## 確認項目',
    `- ログイン必要: ${draft.loginRequired}`,
    `- 課金あり: ${draft.hasIap}`,
    `- データ収集: ${draft.collectsData}`,
    `- トラッキング: ${draft.usesTracking}`,
    '',
    '## メモ',
    `- 審査メモ: ${draft.reviewNotes || '（未入力）'}`,
    `- スクショ: ${draft.screenshotNotes || '（未入力）'}`,
    `- アイコン: ${draft.iconNotes || '（未入力）'}`,
    `- 年齢レーティング: ${draft.ageRatingNotes || '（未入力）'}`,
    `- プライバシー: ${draft.privacyNotes || '（未入力）'}`,
    '',
    '## Safety Note',
    '- App Store Connect APIは呼びません',
    '- 最終Submitは人間が行います',
  ];
  return lines.join('\n');
}
