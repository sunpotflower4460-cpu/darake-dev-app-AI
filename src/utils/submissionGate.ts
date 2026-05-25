export type SubmissionPlatform = 'web' | 'ios' | 'android';

export type GateItemId =
  | 'apple-developer'
  | 'google-play-fee'
  | 'privacy-policy'
  | 'app-icons'
  | 'age-rating'
  | 'in-app-purchase'
  | 'screenshots';

export type GateItem = {
  id: GateItemId;
  title: string;
  /** Why this is a human gate (cost / legal / risk). */
  note: string;
  /** Platforms this gate applies to. */
  platforms: SubmissionPlatform[];
  /** Whether this is a one-time cost the user must explicitly accept. */
  cost?: string;
  /** AI can pre-draft this; user only approves. */
  aiDrafted: boolean;
  /** Optional freeform value the user enters (e.g. Team ID). */
  needsValue?: boolean;
  valueLabel?: string;
};

export const GATE_ITEMS: GateItem[] = [
  {
    id: 'apple-developer',
    title: 'Apple Developer Program 加入',
    note: '年間費用が発生します。Team IDを入力してください。',
    platforms: ['ios'],
    cost: '¥12,980 / 年',
    aiDrafted: false,
    needsValue: true,
    valueLabel: 'Apple Team ID',
  },
  {
    id: 'google-play-fee',
    title: 'Google Play Developer 登録',
    note: '初回登録料が発生します。署名キーストアの準備が必要です。',
    platforms: ['android'],
    cost: '$25 (初回のみ)',
    aiDrafted: false,
    needsValue: true,
    valueLabel: 'Play Console アカウント',
  },
  {
    id: 'privacy-policy',
    title: 'プライバシーポリシー URL',
    note: 'AIが下書きします。内容を確認して承認してください。',
    platforms: ['web', 'ios', 'android'],
    aiDrafted: true,
    needsValue: true,
    valueLabel: 'プライバシーポリシー URL',
  },
  {
    id: 'app-icons',
    title: 'アプリアイコン',
    note: 'AIが生成します。最終的な見た目を承認してください。',
    platforms: ['ios', 'android'],
    aiDrafted: true,
  },
  {
    id: 'age-rating',
    title: '年齢区分 質問票',
    note: 'AIがプリフィルします。回答を確認して承認してください。',
    platforms: ['ios', 'android'],
    aiDrafted: true,
  },
  {
    id: 'in-app-purchase',
    title: 'アプリ内課金 設定',
    note: '自動化対象外。課金がある場合のみストア管理画面で手動設定してください。',
    platforms: ['ios', 'android'],
    aiDrafted: false,
  },
  {
    id: 'screenshots',
    title: 'ストア用スクリーンショット',
    note: '自動撮影済みのものを確認・承認してください。',
    platforms: ['web', 'ios', 'android'],
    aiDrafted: true,
  },
];

export type GateState = {
  approved: Record<string, boolean>;
  values: Record<string, string>;
};

export function emptyGateState(): GateState {
  return { approved: {}, values: {} };
}

export function itemsForPlatforms(platforms: SubmissionPlatform[]): GateItem[] {
  return GATE_ITEMS.filter((item) => item.platforms.some((p) => platforms.includes(p)));
}

export function allApproved(state: GateState, platforms: SubmissionPlatform[]): boolean {
  const items = itemsForPlatforms(platforms);
  return items.every((item) => {
    if (!state.approved[item.id]) return false;
    if (item.needsValue && !state.values[item.id]?.trim()) return false;
    return true;
  });
}

export function costSummary(platforms: SubmissionPlatform[]): string[] {
  return itemsForPlatforms(platforms)
    .filter((item) => item.cost)
    .map((item) => `${item.title}: ${item.cost}`);
}

const STORAGE_KEY_PREFIX = 'darake-submission-gate:';

export function loadGateState(projectId: string): GateState {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${projectId}`);
    if (!raw) return emptyGateState();
    const parsed = JSON.parse(raw) as GateState;
    return {
      approved: parsed.approved ?? {},
      values: parsed.values ?? {},
    };
  } catch {
    return emptyGateState();
  }
}

export function saveGateState(projectId: string, state: GateState): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${projectId}`, JSON.stringify(state));
  } catch {
    // ignore quota / disabled storage
  }
}
