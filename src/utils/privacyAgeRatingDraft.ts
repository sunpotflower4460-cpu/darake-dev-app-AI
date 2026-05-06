export type PrivacyAgeRatingItem = {
  id: string;
  label: string;
  value: 'yes' | 'no' | 'unknown';
  notes: string;
};

export type PrivacyAgeRatingDraft = {
  items: PrivacyAgeRatingItem[];
  updatedAt: string;
};

const STORAGE_KEY = 'darake.privacyAgeRatingDraft.v1';

export const PRIVACY_AGE_RATING_ITEM_DEFINITIONS: Array<{ id: string; label: string }> = [
  { id: 'data-collection', label: 'データ収集あり' },
  { id: 'data-types', label: '収集データの種類メモ（自由記入）' },
  { id: 'tracking', label: 'トラッキングあり' },
  { id: 'account-creation', label: 'アカウント作成あり' },
  { id: 'user-generated-content', label: 'ユーザー生成コンテンツあり' },
  { id: 'external-links', label: '外部リンクあり' },
  { id: 'ai-generated-content', label: 'AI生成コンテンツあり' },
  { id: 'iap', label: '課金（IAP）あり' },
  { id: 'ads', label: '広告あり' },
  { id: 'violence', label: '暴力表現あり' },
  { id: 'sexual', label: '性的表現あり' },
  { id: 'medical', label: '医療情報あり' },
  { id: 'gambling', label: 'ギャンブル要素あり' },
  { id: 'location', label: '位置情報あり' },
];

export function buildInitialPrivacyAgeRatingDraft(): PrivacyAgeRatingDraft {
  return {
    items: PRIVACY_AGE_RATING_ITEM_DEFINITIONS.map((def) => ({
      id: def.id,
      label: def.label,
      value: 'unknown',
      notes: '',
    })),
    updatedAt: '',
  };
}

export function loadPrivacyAgeRatingDraft(): PrivacyAgeRatingDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialPrivacyAgeRatingDraft();
    return { ...buildInitialPrivacyAgeRatingDraft(), ...JSON.parse(raw) };
  } catch {
    return buildInitialPrivacyAgeRatingDraft();
  }
}

export function savePrivacyAgeRatingDraft(draft: PrivacyAgeRatingDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  } catch {
    // ignore
  }
}

export function clearPrivacyAgeRatingDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function summarizePrivacyAgeRatingDraft(draft: PrivacyAgeRatingDraft): {
  hasUnknown: boolean;
  unknownItems: string[];
  blocked: boolean;
} {
  const unknownItems = draft.items.filter((i) => i.value === 'unknown').map((i) => i.label);
  return {
    hasUnknown: unknownItems.length > 0,
    unknownItems,
    blocked: unknownItems.length > 0,
  };
}

export function formatPrivacyAgeRatingDraft(draft: PrivacyAgeRatingDraft): string {
  const lines: string[] = ['# プライバシー / 年齢レーティング確認メモ', ''];
  draft.items.forEach((item) => {
    const icon = item.value === 'yes' ? '✅' : item.value === 'no' ? '❌' : '❓';
    lines.push(`- ${icon} ${item.label}: ${item.value}${item.notes ? ` （${item.notes}）` : ''}`);
  });
  lines.push(
    '',
    '## Safety Note',
    '- この情報はメモ整理のみです。法的な最終判断は人間が行います。',
    '- App Store Connect APIは呼びません。',
  );
  return lines.join('\n');
}
