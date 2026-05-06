export type ScreenshotChecklistItem = {
  id: string;
  label: string;
  status: 'success' | 'warn' | 'failed' | 'unchecked';
  notes: string;
};

export type AppStoreScreenshotChecklist = {
  items: ScreenshotChecklistItem[];
  artifactUrl: string;
  screenshotSource: string;
  updatedAt: string;
};

const STORAGE_KEY = 'darake.appStoreScreenshotChecklist.v1';

export const SCREENSHOT_CHECKLIST_ITEM_DEFINITIONS: Array<{ id: string; label: string }> = [
  { id: 'iphone-screenshots', label: 'iPhone用スクショがある' },
  { id: 'required-count', label: '必要枚数がある（最低1枚）' },
  { id: 'format', label: 'PNG / JPG形式である' },
  { id: 'no-private-info', label: 'private情報（メール・電話等）が映っていない' },
  { id: 'text-readable', label: '文字が小さすぎない' },
  { id: 'main-value', label: 'アプリの主要価値が伝わる' },
  { id: 'strong-first', label: '1枚目のスクショが印象的' },
  { id: 'device-sizes', label: 'デバイスサイズ別の必要性を確認済み' },
];

export function buildInitialAppStoreScreenshotChecklist(): AppStoreScreenshotChecklist {
  return {
    items: SCREENSHOT_CHECKLIST_ITEM_DEFINITIONS.map((def) => ({
      id: def.id,
      label: def.label,
      status: 'unchecked',
      notes: '',
    })),
    artifactUrl: '',
    screenshotSource: '',
    updatedAt: '',
  };
}

export function loadAppStoreScreenshotChecklist(): AppStoreScreenshotChecklist {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialAppStoreScreenshotChecklist();
    return { ...buildInitialAppStoreScreenshotChecklist(), ...JSON.parse(raw) };
  } catch {
    return buildInitialAppStoreScreenshotChecklist();
  }
}

export function saveAppStoreScreenshotChecklist(checklist: AppStoreScreenshotChecklist): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...checklist, updatedAt: new Date().toISOString() }));
  } catch {
    // ignore
  }
}

export function clearAppStoreScreenshotChecklist(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function summarizeAppStoreScreenshotChecklist(checklist: AppStoreScreenshotChecklist): {
  status: 'ready' | 'needs-review' | 'blocked';
  failedItems: string[];
  uncheckedItems: string[];
  warnItems: string[];
} {
  const failedItems = checklist.items.filter((i) => i.status === 'failed').map((i) => i.label);
  const uncheckedItems = checklist.items.filter((i) => i.status === 'unchecked').map((i) => i.label);
  const warnItems = checklist.items.filter((i) => i.status === 'warn').map((i) => i.label);

  let status: 'ready' | 'needs-review' | 'blocked' = 'ready';
  if (failedItems.length > 0 || uncheckedItems.length > 0) {
    status = 'blocked';
  } else if (warnItems.length > 0) {
    status = 'needs-review';
  }

  return { status, failedItems, uncheckedItems, warnItems };
}

export function formatAppStoreScreenshotChecklist(checklist: AppStoreScreenshotChecklist): string {
  const lines: string[] = ['# App Store スクショ素材チェック', ''];
  checklist.items.forEach((item) => {
    const icon =
      item.status === 'success'
        ? '✅'
        : item.status === 'warn'
          ? '⚠️'
          : item.status === 'failed'
            ? '🔴'
            : '❓';
    lines.push(`- ${icon} ${item.label}${item.notes ? `: ${item.notes}` : ''}`);
  });
  if (checklist.artifactUrl) lines.push('', `- Artifact URL: ${checklist.artifactUrl}`);
  if (checklist.screenshotSource) lines.push(`- Source: ${checklist.screenshotSource}`);
  lines.push(
    '',
    '## Safety Note',
    '- このPhaseではApp Store Connectへアップロードしません。',
    '- 最終Submitは人間が行います。',
  );
  return lines.join('\n');
}
