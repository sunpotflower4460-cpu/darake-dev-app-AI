import {
  DARAKE_FIRST_LAUNCH_UPDATED_EVENT,
  emitDarakeRuntimeEvent,
} from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.firstLaunchCare.v1';

export type FirstLaunchCareStep =
  | 'welcome'
  | 'app-seed'
  | 'auto-level'
  | 'safety'
  | 'ready';

export type FirstLaunchCareState = {
  hasCompletedFirstLaunch: boolean;
  currentStep: FirstLaunchCareStep;
  appName: string;
  appSeed: string;
  targetUser: string;
  platform: 'ios' | 'web' | 'android' | 'not-sure';
  appType:
    | 'simple-tool'
    | 'memo'
    | 'cute-app'
    | 'game'
    | 'music'
    | 'ai-companion'
    | 'research'
    | 'not-sure';
  darakeLevel:
    | 'guide-me-gently'
    | 'mostly-auto'
    | 'maximum-darake';
  safetyPreference: {
    allowLocalDraftAuto: boolean;
    allowReportAuto: boolean;
    allowInstructionAuto: boolean;
    externalActionsAlwaysManual: true;
  };
  createdAt: string;
  updatedAt: string;
};

export const FIRST_LAUNCH_STEP_LABELS: Record<FirstLaunchCareStep, string> = {
  welcome: 'ようこそ',
  'app-seed': 'アプリの種',
  'auto-level': '作り方',
  safety: '安全確認',
  ready: '準備完了',
};

export const FIRST_LAUNCH_STEPS: FirstLaunchCareStep[] = [
  'welcome',
  'app-seed',
  'auto-level',
  'safety',
  'ready',
];

export function buildInitialFirstLaunchCareState(): FirstLaunchCareState {
  const now = new Date().toISOString();
  return {
    hasCompletedFirstLaunch: false,
    currentStep: 'welcome',
    appName: '',
    appSeed: '',
    targetUser: '',
    platform: 'not-sure',
    appType: 'not-sure',
    darakeLevel: 'guide-me-gently',
    safetyPreference: {
      allowLocalDraftAuto: true,
      allowReportAuto: true,
      allowInstructionAuto: true,
      externalActionsAlwaysManual: true,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function loadFirstLaunchCareState(): FirstLaunchCareState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FirstLaunchCareState;
  } catch {
    return null;
  }
}

export function saveFirstLaunchCareState(state: FirstLaunchCareState): void {
  try {
    const updated = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitDarakeRuntimeEvent(DARAKE_FIRST_LAUNCH_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function clearFirstLaunchCareState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_FIRST_LAUNCH_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function summarizeFirstLaunchCareState(state: FirstLaunchCareState): string {
  if (!state.hasCompletedFirstLaunch) {
    return `ステップ ${FIRST_LAUNCH_STEP_LABELS[state.currentStep]} — 未完了`;
  }
  const parts: string[] = [];
  if (state.appName) parts.push(`アプリ: ${state.appName}`);
  if (state.appSeed) parts.push(`内容: ${state.appSeed}`);
  if (state.targetUser) parts.push(`対象: ${state.targetUser}`);
  return parts.join(' / ') || '初回設定完了';
}

export function formatFirstLaunchCareMarkdown(state: FirstLaunchCareState): string {
  const lines = [
    '# 初回オンボーディング — だらけ管制室',
    '',
    `**完了**: ${state.hasCompletedFirstLaunch ? 'はい' : 'いいえ'}`,
    `**ステップ**: ${FIRST_LAUNCH_STEP_LABELS[state.currentStep]}`,
    '',
    '## アプリ情報',
    `- アプリ名: ${state.appName || '未入力'}`,
    `- 内容: ${state.appSeed || '未入力'}`,
    `- 対象ユーザー: ${state.targetUser || '未入力'}`,
    `- プラットフォーム: ${state.platform}`,
    `- アプリ種別: ${state.appType}`,
    '',
    '## 設定',
    `- 進め方: ${state.darakeLevel}`,
    `- ローカル下書き自動: ${state.safetyPreference.allowLocalDraftAuto ? 'はい' : 'いいえ'}`,
    `- レポート自動: ${state.safetyPreference.allowReportAuto ? 'はい' : 'いいえ'}`,
    `- 指示書自動: ${state.safetyPreference.allowInstructionAuto ? 'はい' : 'いいえ'}`,
    `- 外部操作は常に手動: はい`,
    '',
    `作成: ${state.createdAt}`,
    `更新: ${state.updatedAt}`,
  ];
  return lines.join('\n');
}
