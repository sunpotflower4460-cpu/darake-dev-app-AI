// Phase 38.1: One Screen Command State

export type OneScreenCommandStatus =
  | 'all-quiet'
  | 'auto-progressing'
  | 'needs-later-review'
  | 'needs-human-once'
  | 'blocked';

export type OneScreenCommandState = {
  title: string;
  status: OneScreenCommandStatus;
  headline: string;
  subline: string;
  autoProgressSummary: string;
  humanNeedSummary: string;
  blockedSummary: string;
  completionSummary: string;
  primaryCard: {
    title: string;
    body: string;
    actionLabel: string;
    actionType:
      | 'show-details'
      | 'copy-instruction'
      | 'open-review-inbox'
      | 'show-completion-map'
      | 'none';
  };
  secondaryCards: Array<{
    label: string;
    value: string;
    tone: 'quiet' | 'good' | 'warn' | 'danger';
  }>;
  hiddenPanelGroups: string[];
};

const STORAGE_KEY = 'darake.oneScreenCommandState.v1';

export function loadOneScreenCommandState(): OneScreenCommandState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OneScreenCommandState;
  } catch {
    return null;
  }
}

export function saveOneScreenCommandState(state: OneScreenCommandState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export const STATUS_LABELS: Record<OneScreenCommandStatus, string> = {
  'all-quiet': '順調にだらけられます',
  'auto-progressing': '裏で自動処理中',
  'needs-later-review': 'あとで確認すればOK',
  'needs-human-once': '1回だけ人間が必要',
  blocked: '🚫 ブロック中',
};

export const STATUS_EMOJI: Record<OneScreenCommandStatus, string> = {
  'all-quiet': '😴',
  'auto-progressing': '⚙️',
  'needs-later-review': '📋',
  'needs-human-once': '👤',
  blocked: '🚫',
};

export function buildOneScreenCommandState(options: {
  autoProgressCount?: number;
  humanNeedCount?: number;
  blockedCount?: number;
  completionPercent?: number;
  reviewInboxCount?: number;
  primaryActionLabel?: string;
  primaryActionType?: OneScreenCommandState['primaryCard']['actionType'];
  primaryCardTitle?: string;
  primaryCardBody?: string;
}): OneScreenCommandState {
  const {
    autoProgressCount = 0,
    humanNeedCount = 0,
    blockedCount = 0,
    completionPercent = 0,
    reviewInboxCount = 0,
    primaryActionLabel = '詳細を見る',
    primaryActionType = 'show-details',
    primaryCardTitle = '次に見るなら',
    primaryCardBody = '（今は何もない）',
  } = options;

  let status: OneScreenCommandStatus = 'all-quiet';
  if (blockedCount > 0) status = 'blocked';
  else if (humanNeedCount > 0) status = 'needs-human-once';
  else if (reviewInboxCount > 0) status = 'needs-later-review';
  else if (autoProgressCount > 0) status = 'auto-progressing';

  return {
    title: 'だらけ管制室',
    status,
    headline: STATUS_LABELS[status],
    subline: buildSubline(status, blockedCount, humanNeedCount, reviewInboxCount),
    autoProgressSummary: autoProgressCount > 0 ? `裏で整ったこと: ${autoProgressCount}件` : '自動処理なし',
    humanNeedSummary: humanNeedCount > 0 ? `人間が今すぐ見る必要: ${humanNeedCount}件` : 'なし',
    blockedSummary: blockedCount > 0 ? `ブロック: ${blockedCount}件` : '（なし）',
    completionSummary: `完成まで: ${completionPercent}%`,
    primaryCard: {
      title: primaryCardTitle,
      body: primaryCardBody,
      actionLabel: primaryActionLabel,
      actionType: primaryActionType,
    },
    secondaryCards: buildSecondaryCards(autoProgressCount, humanNeedCount, blockedCount, reviewInboxCount),
    hiddenPanelGroups: buildHiddenGroups(status),
  };
}

function buildSubline(
  status: OneScreenCommandStatus,
  blocked: number,
  human: number,
  inbox: number
): string {
  if (status === 'blocked') return `ブロックを解消してください（${blocked}件）`;
  if (status === 'needs-human-once') return `人間確認が${human}件あります`;
  if (status === 'needs-later-review') return `Review Inboxに${inbox}件あります`;
  return '今すぐやることはありません';
}

function buildSecondaryCards(
  auto: number,
  human: number,
  blocked: number,
  inbox: number
): OneScreenCommandState['secondaryCards'] {
  return [
    { label: '裏で整ったこと', value: `${auto}件`, tone: auto > 0 ? 'good' : 'quiet' },
    { label: '人間必要', value: human > 0 ? `${human}件` : 'なし', tone: human > 0 ? 'warn' : 'quiet' },
    { label: 'ブロック', value: blocked > 0 ? `${blocked}件` : 'なし', tone: blocked > 0 ? 'danger' : 'quiet' },
    { label: 'Review Inbox', value: `${inbox}件`, tone: inbox > 0 ? 'warn' : 'quiet' },
  ];
}

function buildHiddenGroups(status: OneScreenCommandStatus): string[] {
  const alwaysHidden = ['report-details', 'warning-details', 'draft-only', 'copy-only', 'optional'];
  if (status === 'all-quiet' || status === 'auto-progressing') {
    return [...alwaysHidden, 'post-release', 'portfolio'];
  }
  return alwaysHidden;
}

export function formatOneScreenCommandStateMarkdown(state: OneScreenCommandState): string {
  const lines = [
    `# ${state.title}`,
    `ステータス: ${STATUS_EMOJI[state.status]} ${state.headline}`,
    state.subline,
    '',
    state.autoProgressSummary,
    state.humanNeedSummary,
    state.blockedSummary,
    state.completionSummary,
    '',
    `## 今見るなら`,
    `**${state.primaryCard.title}**`,
    state.primaryCard.body,
    '',
    `## 詳細`,
    ...state.secondaryCards.map((c) => `- ${c.label}: ${c.value}`),
  ];
  return lines.join('\n');
}
