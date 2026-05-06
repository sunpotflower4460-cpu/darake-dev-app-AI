export type AiReviewTriageCategory =
  | 'blocker'
  | 'warning'
  | 'suggestion'
  | 'copy-improvement'
  | 'ui-fix'
  | 'code-risk'
  | 'store-risk'
  | 'ignore';

export type AiReviewTriageAction = 'issue' | 'manual-fix' | 'note' | 'ignore';

export type AiReviewTriageItem = {
  id: string;
  category: AiReviewTriageCategory;
  text: string;
  priority: 'low' | 'medium' | 'high';
  action: AiReviewTriageAction;
};

const STORAGE_KEY = 'darake.aiReviewTriageItems.v1';

export function loadAiReviewTriageItems(): AiReviewTriageItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AiReviewTriageItem[];
  } catch {
    return [];
  }
}

export function saveAiReviewTriageItems(items: AiReviewTriageItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function buildAiReviewTriageItem(
  partial: Partial<AiReviewTriageItem> & Pick<AiReviewTriageItem, 'text' | 'category'>
): AiReviewTriageItem {
  return {
    id: `triage-${crypto.randomUUID()}`,
    priority: 'medium',
    action: categoryToDefaultAction(partial.category),
    ...partial,
  };
}

function categoryToDefaultAction(category: AiReviewTriageCategory): AiReviewTriageAction {
  switch (category) {
    case 'blocker': return 'issue';
    case 'warning': return 'issue';
    case 'code-risk': return 'issue';
    case 'store-risk': return 'issue';
    case 'suggestion': return 'note';
    case 'copy-improvement': return 'manual-fix';
    case 'ui-fix': return 'manual-fix';
    case 'ignore': return 'ignore';
    default: return 'note';
  }
}

export function formatAiReviewTriageMarkdown(items: AiReviewTriageItem[]): string {
  if (items.length === 0) return '(triage items なし)';

  const groups: Record<AiReviewTriageCategory, AiReviewTriageItem[]> = {
    blocker: [],
    warning: [],
    suggestion: [],
    'copy-improvement': [],
    'ui-fix': [],
    'code-risk': [],
    'store-risk': [],
    ignore: [],
  };

  items.forEach((item) => groups[item.category].push(item));

  const lines: string[] = ['## AI Review Triage', ''];
  (Object.entries(groups) as [AiReviewTriageCategory, AiReviewTriageItem[]][]).forEach(([cat, catItems]) => {
    if (catItems.length === 0) return;
    lines.push(`### ${cat} (${catItems.length}件)`);
    catItems.forEach((i) => lines.push(`- [${i.priority}] ${i.text} → action: ${i.action}`));
    lines.push('');
  });

  return lines.join('\n');
}
