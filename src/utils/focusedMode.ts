export type FocusedModeId =
  | 'all'
  | 'today'
  | 'current-app'
  | 'submission'
  | 'screenshot'
  | 'portfolio'
  | 'templates'
  | 'blocked-only';

export type FocusedMode = {
  id: FocusedModeId;
  label: string;
  description: string;
  navGroups: string[];
};

const STORAGE_KEY = 'darake.focusedMode.v1';

export const FOCUSED_MODES: FocusedMode[] = [
  {
    id: 'all',
    label: '全表示',
    description: 'すべてのパネルを表示します',
    navGroups: ['home', 'create', 'run', 'watch', 'screenshots', 'submit', 'post-release', 'portfolio', 'templates', 'reports', 'settings'],
  },
  {
    id: 'today',
    label: '今日のフォーカス',
    description: '今日見るべきものだけ表示します',
    navGroups: ['home', 'portfolio'],
  },
  {
    id: 'current-app',
    label: '現在のアプリ',
    description: '今開発中のアプリに関連するパネルを表示します',
    navGroups: ['create', 'run', 'watch'],
  },
  {
    id: 'submission',
    label: '提出準備',
    description: '提出関連のパネルを表示します',
    navGroups: ['submit'],
  },
  {
    id: 'screenshot',
    label: 'スクショ確認',
    description: 'スクショ関連のパネルを表示します',
    navGroups: ['screenshots'],
  },
  {
    id: 'portfolio',
    label: 'ポートフォリオ',
    description: '複数アプリ管理パネルを表示します',
    navGroups: ['portfolio'],
  },
  {
    id: 'templates',
    label: 'テンプレ工場',
    description: 'テンプレート・設計書パネルを表示します',
    navGroups: ['templates'],
  },
  {
    id: 'blocked-only',
    label: 'ブロックのみ',
    description: 'ブロック・手動確認が必要なものだけ表示します',
    navGroups: ['home'],
  },
];

export function loadFocusedModeId(): FocusedModeId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'all';
    return raw as FocusedModeId;
  } catch {
    return 'all';
  }
}

export function saveFocusedModeId(id: FocusedModeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function getFocusedModeById(id: FocusedModeId): FocusedMode {
  return FOCUSED_MODES.find((m) => m.id === id) ?? FOCUSED_MODES[0];
}
