export type DarakeFinalFormStatus =
  | 'sleep'
  | 'quiet'
  | 'review-later'
  | 'human-needed'
  | 'blocked';

export type DarakeFinalFormState = {
  title: string;
  status: DarakeFinalFormStatus;
  mainMessage: string;
  subMessage: string;
  primaryNeed: {
    title: string;
    body: string;
    actionLabel: string;
    urgency: 'none' | 'later' | 'soon' | 'now';
  };
  counters: {
    autoHandled: number;
    batched: number;
    reviewLater: number;
    humanNow: number;
    blocked: number;
    completionRemaining: number;
  };
  visibleCards: Array<{
    id: string;
    label: string;
    value: string;
    tone: 'soft' | 'good' | 'warn' | 'danger';
  }>;
  hiddenPanelCount: number;
  detailsMarkdown: string;
};

export const STATUS_LABELS_FINAL: Record<DarakeFinalFormStatus, string> = {
  sleep: '😴 寝てて大丈夫',
  quiet: '👁️ 静かに動作中',
  'review-later': '📋 あとで確認',
  'human-needed': '👋 確認が必要',
  blocked: '🚫 ブロック中',
};

type BuildFinalFormParams = {
  autoHandled?: number;
  batched?: number;
  reviewLater?: number;
  humanNow?: number;
  blocked?: number;
  completionRemaining?: number;
  hiddenPanelCount?: number;
  primaryNeedTitle?: string;
  primaryNeedBody?: string;
  primaryNeedActionLabel?: string;
};

export function buildDarakeFinalFormState(params: BuildFinalFormParams = {}): DarakeFinalFormState {
  const {
    autoHandled = 0,
    batched = 0,
    reviewLater = 0,
    humanNow = 0,
    blocked = 0,
    completionRemaining = 0,
    hiddenPanelCount = 0,
    primaryNeedTitle = '',
    primaryNeedBody = '',
    primaryNeedActionLabel = '確認する',
  } = params;

  let status: DarakeFinalFormStatus;
  let mainMessage: string;
  let subMessage: string;
  let urgency: DarakeFinalFormState['primaryNeed']['urgency'];

  if (blocked > 0) {
    status = 'blocked';
    mainMessage = `${blocked}件ブロックされています。`;
    subMessage = '最優先で確認してください';
    urgency = 'now';
  } else if (humanNow > 0) {
    status = 'human-needed';
    mainMessage = `${humanNow}件の確認が必要です。`;
    subMessage = 'それ以外は自動処理中です';
    urgency = 'soon';
  } else if (reviewLater > 0) {
    status = 'review-later';
    mainMessage = 'あとで確認できる項目があります。';
    subMessage = '急ぎじゃないので好きなタイミングで';
    urgency = 'later';
  } else if (batched > 0 || autoHandled > 0) {
    status = 'quiet';
    mainMessage = '静かに動いています。';
    subMessage = '人間の対応は不要です';
    urgency = 'none';
  } else {
    status = 'sleep';
    mainMessage = '今は寝ててOKです。';
    subMessage = 'すべて順調です。だらけていて大丈夫です 😴';
    urgency = 'none';
  }

  const visibleCards: DarakeFinalFormState['visibleCards'] = [];
  if (blocked > 0) {
    visibleCards.push({ id: 'blocked', label: 'ブロック', value: `${blocked}件`, tone: 'danger' });
  }
  if (humanNow > 0) {
    visibleCards.push({ id: 'human', label: '要確認', value: `${humanNow}件`, tone: 'warn' });
  }
  if (reviewLater > 0) {
    visibleCards.push({ id: 'review', label: 'あとで', value: `${reviewLater}件`, tone: 'soft' });
  }
  if (autoHandled > 0) {
    visibleCards.push({ id: 'auto', label: '自動処理', value: `${autoHandled}件`, tone: 'good' });
  }

  const lines = [
    '# だらけ管制室 — Final Form',
    '',
    `**${mainMessage}**`,
    subMessage,
    '',
    '## カウンター',
    `- 自動処理: ${autoHandled}件`,
    `- まとめた警告: ${batched}件`,
    `- あとで確認: ${reviewLater}件`,
    `- 今すぐ確認: ${humanNow}件`,
    `- ブロック: ${blocked}件`,
    `- 完成待ち: ${completionRemaining}件`,
    `- 非表示パネル: ${hiddenPanelCount}件`,
  ];

  if (primaryNeedTitle) {
    lines.push('', `## 優先事項`, `**${primaryNeedTitle}**`, primaryNeedBody);
  }

  return {
    title: 'だらけ管制室',
    status,
    mainMessage,
    subMessage,
    primaryNeed: {
      title: primaryNeedTitle || (urgency !== 'none' ? '確認が必要です' : '何もありません'),
      body: primaryNeedBody || (urgency !== 'none' ? '上の内容を確認してください' : 'のんびりしていてください'),
      actionLabel: primaryNeedActionLabel,
      urgency,
    },
    counters: {
      autoHandled,
      batched,
      reviewLater,
      humanNow,
      blocked,
      completionRemaining,
    },
    visibleCards,
    hiddenPanelCount,
    detailsMarkdown: lines.join('\n'),
  };
}

const STORAGE_KEY = 'darake.finalFormState.v1';

export function loadDarakeFinalFormState(): DarakeFinalFormState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DarakeFinalFormState;
  } catch {
    return null;
  }
}

export function saveDarakeFinalFormState(state: DarakeFinalFormState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function formatFinalFormMarkdown(state: DarakeFinalFormState): string {
  return state.detailsMarkdown;
}
