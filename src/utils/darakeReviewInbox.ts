// Phase 35: Darake Review Inbox

export type DarakeReviewInboxItemType =
  | 'manual-gate'
  | 'blocked'
  | 'needs-human-choice'
  | 'app-store-submit'
  | 'secret-required'
  | 'production-risk'
  | 'failed-check'
  | 'optional-review';

export type DarakeReviewInboxItem = {
  id: string;
  type: DarakeReviewInboxItemType;
  title: string;
  summary: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'reviewed' | 'snoozed' | 'resolved' | 'ignored';
  recommendedAction: string;
  detailsMarkdown: string;
  createdAt: string;
};

export const INBOX_TYPE_LABELS: Record<DarakeReviewInboxItemType, string> = {
  'manual-gate': 'Manual Gate',
  'blocked': 'ブロック',
  'needs-human-choice': '人間の選択が必要',
  'app-store-submit': 'App Store Submit',
  'secret-required': 'Secret / Token 必要',
  'production-risk': '本番リスク',
  'failed-check': 'チェック失敗',
  'optional-review': '任意レビュー',
};

export const PRIORITY_ICONS: Record<DarakeReviewInboxItem['priority'], string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  urgent: '🔴',
};

export const STATUS_LABELS: Record<DarakeReviewInboxItem['status'], string> = {
  unread: '未読',
  reviewed: '確認済',
  snoozed: 'スヌーズ',
  resolved: '解決済',
  ignored: '無視',
};

export function buildDarakeReviewInboxItem(
  partial: Partial<DarakeReviewInboxItem> &
    Pick<DarakeReviewInboxItem, 'type' | 'title' | 'summary'>
): DarakeReviewInboxItem {
  return {
    id: `inbox-${crypto.randomUUID()}`,
    priority: 'medium',
    status: 'unread',
    recommendedAction: '',
    detailsMarkdown: '',
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function buildDarakeReviewInbox(
  items: Array<
    Partial<DarakeReviewInboxItem> & Pick<DarakeReviewInboxItem, 'type' | 'title' | 'summary'>
  >
): DarakeReviewInboxItem[] {
  return items.map(buildDarakeReviewInboxItem);
}

export function rankDarakeReviewInboxItems(
  items: DarakeReviewInboxItem[]
): DarakeReviewInboxItem[] {
  const priorityOrder: Record<DarakeReviewInboxItem['priority'], number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  const statusOrder: Record<DarakeReviewInboxItem['status'], number> = {
    unread: 0,
    snoozed: 1,
    reviewed: 2,
    resolved: 3,
    ignored: 4,
  };
  return [...items].sort((a, b) => {
    const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pd !== 0) return pd;
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

export function summarizeDarakeReviewInbox(items: DarakeReviewInboxItem[]): string {
  const unread = items.filter((i) => i.status === 'unread').length;
  const urgent = items.filter((i) => i.priority === 'urgent' && i.status === 'unread').length;
  const blocked = items.filter((i) => i.type === 'blocked').length;
  const manualGate = items.filter((i) => i.type === 'manual-gate').length;
  return `未読: ${unread} / urgent: ${urgent} / blocked: ${blocked} / manual gate: ${manualGate}`;
}

export function formatDarakeReviewInboxMarkdown(items: DarakeReviewInboxItem[]): string {
  const ranked = rankDarakeReviewInboxItems(items);
  const lines = [
    `# Darake Review Inbox`,
    '',
    summarizeDarakeReviewInbox(items),
    '',
  ];

  ranked.forEach((item) => {
    lines.push(
      `## ${PRIORITY_ICONS[item.priority]} ${item.title}`,
      `**タイプ:** ${INBOX_TYPE_LABELS[item.type]} | **優先度:** ${item.priority} | **状態:** ${STATUS_LABELS[item.status]}`,
      `${item.summary}`,
      item.recommendedAction ? `**推奨アクション:** ${item.recommendedAction}` : '',
      item.detailsMarkdown ? item.detailsMarkdown : '',
      ''
    );
  });

  return lines.filter((l) => l !== '').join('\n');
}

const STORAGE_KEY = 'darake.reviewInbox.v1';

export function loadDarakeReviewInbox(): DarakeReviewInboxItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DarakeReviewInboxItem[];
  } catch {
    return [];
  }
}

export function saveDarakeReviewInbox(items: DarakeReviewInboxItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}
