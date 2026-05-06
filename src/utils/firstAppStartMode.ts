export type FirstAppStartMode = {
  enabled: boolean;
  visiblePanels: string[];
  hiddenPanels: string[];
  reason: string;
};

export const FIRST_START_VISIBLE_PANELS = [
  'first-launch-care',
  'gentle-app-start-form',
  'gentle-blueprint-preview',
  'pon-start',
  'beginner-next-step-card',
  'first-app-start-completion-report',
];

export const FIRST_START_HIDDEN_PANEL_PATTERNS = [
  'github',
  'app-store',
  'ai-',
  'notification',
  'audit',
  'local-storage',
  'completion-report',
  'rehearsal',
  'friction',
  'v1-readiness',
  'dry-run',
  'workflow',
  'playwright',
  'screenshot',
  'pr-',
  'ci-',
  'submission',
  'rejection',
  'post-release',
  'merge',
  'sleep-mode',
  'morning-report',
];

export function buildFirstAppStartMode(hasCompletedFirstLaunch: boolean): FirstAppStartMode {
  if (hasCompletedFirstLaunch) {
    return {
      enabled: false,
      visiblePanels: [],
      hiddenPanels: [],
      reason: '初回設定完了済み — 通常モードで表示します',
    };
  }

  return {
    enabled: true,
    visiblePanels: FIRST_START_VISIBLE_PANELS,
    hiddenPanels: FIRST_START_HIDDEN_PANEL_PATTERNS,
    reason: '初回ユーザー向けの介護モードです。最小限のパネルだけ表示します。',
  };
}
