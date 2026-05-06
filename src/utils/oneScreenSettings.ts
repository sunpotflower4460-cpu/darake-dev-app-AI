// Phase 38.4: One Screen Settings

export type OneScreenSettings = {
  defaultToOneScreen: boolean;
  hideCompletedPanels: boolean;
  hideLowWarnings: boolean;
  showBlockedImmediately: boolean;
  showManualGateInInboxOnly: boolean;
  showCompletionFirst: boolean;
  allowAllDetailsView: boolean;
  fixedSafetyMode: 'strict-manual-gate';
};

const STORAGE_KEY = 'darake.oneScreenSettings.v1';

export const DEFAULT_ONE_SCREEN_SETTINGS: OneScreenSettings = {
  defaultToOneScreen: true,
  hideCompletedPanels: true,
  hideLowWarnings: true,
  showBlockedImmediately: true,
  showManualGateInInboxOnly: false,
  showCompletionFirst: true,
  allowAllDetailsView: true,
  fixedSafetyMode: 'strict-manual-gate',
};

export function loadOneScreenSettings(): OneScreenSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ONE_SCREEN_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<OneScreenSettings>;
    // fixedSafetyMode cannot be changed
    return {
      ...DEFAULT_ONE_SCREEN_SETTINGS,
      ...parsed,
      fixedSafetyMode: 'strict-manual-gate',
    };
  } catch {
    return { ...DEFAULT_ONE_SCREEN_SETTINGS };
  }
}

export function saveOneScreenSettings(settings: OneScreenSettings): void {
  try {
    // Always enforce fixedSafetyMode
    const safe: OneScreenSettings = { ...settings, fixedSafetyMode: 'strict-manual-gate' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // ignore
  }
}

export function formatOneScreenSettingsMarkdown(settings: OneScreenSettings): string {
  const lines = [
    `# One Screen Settings`,
    '',
    `| 設定 | 値 |`,
    `|------|-----|`,
    `| デフォルトで1画面 | ${settings.defaultToOneScreen ? 'ON' : 'OFF'} |`,
    `| 完了パネルを非表示 | ${settings.hideCompletedPanels ? 'ON' : 'OFF'} |`,
    `| 低優先warningを非表示 | ${settings.hideLowWarnings ? 'ON' : 'OFF'} |`,
    `| blockedはすぐ表示 | ${settings.showBlockedImmediately ? 'ON' : 'OFF'} |`,
    `| manual gateはInboxのみ | ${settings.showManualGateInInboxOnly ? 'ON' : 'OFF'} |`,
    `| 完成ファーストを最初に | ${settings.showCompletionFirst ? 'ON' : 'OFF'} |`,
    `| 全詳細表示ボタンを許可 | ${settings.allowAllDetailsView ? 'ON' : 'OFF'} |`,
    `| 安全モード | ${settings.fixedSafetyMode} (変更不可) |`,
  ];
  return lines.join('\n');
}
