import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.levelSettings.v1';

export type DarakeLevel =
  | 'careful'
  | 'important-only'
  | 'mostly-sleeping'
  | 'wake-me-only-if-needed';

export const DARAKE_LEVEL_LABELS: Record<DarakeLevel, string> = {
  careful: '丁寧に見たい',
  'important-only': '大事なことだけ見たい',
  'mostly-sleeping': 'ほぼ寝てたい',
  'wake-me-only-if-needed': '緊急以外起こさない',
};

export const DEFAULT_DARAKE_LEVEL: DarakeLevel = 'wake-me-only-if-needed';

export type DarakeLevelSettings = {
  level: DarakeLevel;
  updatedAt: string;
};

export function loadDarakeLevelSettings(): DarakeLevelSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { level: DEFAULT_DARAKE_LEVEL, updatedAt: new Date().toISOString() };
    }
    return JSON.parse(raw) as DarakeLevelSettings;
  } catch {
    return { level: DEFAULT_DARAKE_LEVEL, updatedAt: new Date().toISOString() };
  }
}

export function saveDarakeLevelSettings(level: DarakeLevel): void {
  try {
    const toSave: DarakeLevelSettings = {
      level,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

/**
 * Returns what should be visible based on the current darake level.
 * careful:              Issue内容, Cloud Agent指示, いまここ, 注意点, 詳細ボタン
 * important-only:       主ボタン, いまここ, エラーだけ
 * mostly-sleeping:      主ボタン, 次にやることだけ
 * wake-me-only-if-needed: 成功時は「何もしなくてOK」, 失敗時だけ理由と次のボタン
 */
export type DarakeLevelVisibility = {
  showIssueContent: boolean;
  showCloudAgentInstruction: boolean;
  showNowCard: boolean;
  showWarnings: boolean;
  showDetailsButton: boolean;
  showErrorsOnly: boolean;
  showNextActionOnly: boolean;
  collapseOnSuccess: boolean;
};

export function getDarakeLevelVisibility(level: DarakeLevel): DarakeLevelVisibility {
  switch (level) {
    case 'careful':
      return {
        showIssueContent: true,
        showCloudAgentInstruction: true,
        showNowCard: true,
        showWarnings: true,
        showDetailsButton: true,
        showErrorsOnly: false,
        showNextActionOnly: false,
        collapseOnSuccess: false,
      };
    case 'important-only':
      return {
        showIssueContent: false,
        showCloudAgentInstruction: false,
        showNowCard: true,
        showWarnings: false,
        showDetailsButton: false,
        showErrorsOnly: true,
        showNextActionOnly: false,
        collapseOnSuccess: false,
      };
    case 'mostly-sleeping':
      return {
        showIssueContent: false,
        showCloudAgentInstruction: false,
        showNowCard: false,
        showWarnings: false,
        showDetailsButton: false,
        showErrorsOnly: false,
        showNextActionOnly: true,
        collapseOnSuccess: false,
      };
    case 'wake-me-only-if-needed':
    default:
      return {
        showIssueContent: false,
        showCloudAgentInstruction: false,
        showNowCard: false,
        showWarnings: false,
        showDetailsButton: false,
        showErrorsOnly: false,
        showNextActionOnly: false,
        collapseOnSuccess: true,
      };
  }
}
