export type FrictionType =
  | 'too-many-buttons'
  | 'too-much-text'
  | 'too-many-panels'
  | 'requires-repeated-ok'
  | 'requires-unneeded-choice'
  | 'safe-item-visible'
  | 'warning-not-batched'
  | 'details-shown-too-early'
  | 'next-action-unclear'
  | 'mobile-too-dense'
  | 'manual-gate-too-noisy';

export type FrictionItem = {
  id: string;
  type: FrictionType;
  label: string;
  severity: 'low' | 'medium' | 'high';
  where: string;
  whyItHurtsDarake: string;
  suggestedCut: string;
  canAutoHide: boolean;
  mustKeepVisibleForSafety: boolean;
};

const FRICTION_TYPE_LABELS: Record<FrictionType, string> = {
  'too-many-buttons': 'ボタンが多すぎる',
  'too-much-text': 'テキストが多すぎる',
  'too-many-panels': 'パネルが多すぎる',
  'requires-repeated-ok': '毎回OKが必要',
  'requires-unneeded-choice': '不要な選択が必要',
  'safe-item-visible': '安全な項目が表示されている',
  'warning-not-batched': '警告がまとまっていない',
  'details-shown-too-early': '詳細が早すぎる',
  'next-action-unclear': '次のアクションが不明瞭',
  'mobile-too-dense': 'スマホで密すぎる',
  'manual-gate-too-noisy': '手動ゲートがうるさい',
};

export function getFrictionTypeLabel(type: FrictionType): string {
  return FRICTION_TYPE_LABELS[type];
}

export const DETECTED_FRICTION_ITEMS: FrictionItem[] = [
  {
    id: 'friction-report-detail-always-shown',
    type: 'details-shown-too-early',
    label: '成功済みreportの詳細が常時表示',
    severity: 'high',
    where: 'Reports グループ全体',
    whyItHurtsDarake: '成功済みなのに毎回全文を見せる必要がない',
    suggestedCut: '成功済みreportはデフォルト折りたたみにする',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
  {
    id: 'friction-dry-run-detail',
    type: 'details-shown-too-early',
    label: 'GitHub dry-run詳細が展開済み',
    severity: 'high',
    where: 'GitHub dry-run パネル',
    whyItHurtsDarake: 'dry-runはOKなら詳細を見なくていい',
    suggestedCut: 'dry-runパス → 詳細はアコーディオン内に隠す',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
  {
    id: 'friction-prompt-full-text',
    type: 'too-much-text',
    label: 'Cloud Agentプロンプト全文が常時表示',
    severity: 'medium',
    where: 'Cloud Agent パネル',
    whyItHurtsDarake: 'コピーさえできれば全文を読む必要はない',
    suggestedCut: 'プロンプトはアコーディオン内 / コピーボタンを前面に出す',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
  {
    id: 'friction-notification-payload',
    type: 'safe-item-visible',
    label: 'notification payloadが常時展開',
    severity: 'medium',
    where: 'Notification パネル',
    whyItHurtsDarake: 'payloadの内容は人間が毎回確認しなくていい',
    suggestedCut: 'payloadはアコーディオンに折りたたむ',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
  {
    id: 'friction-too-many-panels-home',
    type: 'too-many-panels',
    label: 'ホーム画面のパネル数が多い',
    severity: 'high',
    where: 'home グループ',
    whyItHurtsDarake: '1画面で見きれない量のパネルはスマホで疲れる',
    suggestedCut: 'Final Form / Sleep Mode / Morning Report だけをデフォルト表示にする',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
  {
    id: 'friction-issue-body-visible',
    type: 'too-much-text',
    label: 'Issue本文が常時表示',
    severity: 'medium',
    where: 'Issue Draft パネル',
    whyItHurtsDarake: 'Issue本文はコピー時だけ見ればいい',
    suggestedCut: 'Issue本文はアコーディオンに折りたたむ',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
  {
    id: 'friction-pr-body-visible',
    type: 'too-much-text',
    label: 'PR本文が常時表示',
    severity: 'medium',
    where: 'PR Creation Preview パネル',
    whyItHurtsDarake: 'PR本文はコピー時だけ見ればいい',
    suggestedCut: 'PR本文はアコーディオンに折りたたむ',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
  {
    id: 'friction-localstorage-key-list',
    type: 'safe-item-visible',
    label: 'localStorageキー一覧が常時表示',
    severity: 'low',
    where: 'Settings — LocalStorage Key Registry',
    whyItHurtsDarake: '通常使用では見なくていい内部情報',
    suggestedCut: 'Settingsグループ内のみに表示 / デフォルト折りたたみ',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
  {
    id: 'friction-blocked-hidden',
    type: 'next-action-unclear',
    label: 'blockedが分かりにくい場所にある',
    severity: 'high',
    where: '全グループ',
    whyItHurtsDarake: 'blockedは一番最初に見えるべき',
    suggestedCut: 'blockedは常にホームに浮き出す',
    canAutoHide: false,
    mustKeepVisibleForSafety: true,
  },
  {
    id: 'friction-optional-warning-noisy',
    type: 'warning-not-batched',
    label: 'optionalな警告が個別表示',
    severity: 'medium',
    where: '複数パネル',
    whyItHurtsDarake: '毎回警告を読むのは疲れる',
    suggestedCut: '低リスク警告はMorning Reportにまとめて表示',
    canAutoHide: true,
    mustKeepVisibleForSafety: false,
  },
];

export function detectFrictionItems(): FrictionItem[] {
  return DETECTED_FRICTION_ITEMS;
}

export function detectFrictionByWhere(where: string): FrictionItem[] {
  return DETECTED_FRICTION_ITEMS.filter((f) =>
    f.where.toLowerCase().includes(where.toLowerCase()),
  );
}
