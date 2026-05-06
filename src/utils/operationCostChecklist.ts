export type OperationCostItem = {
  id: string;
  label: string;
  category: string;
  monthlyJpy: string;
  yearlyJpy: string;
  isFree: boolean;
  notes: string;
  checked: boolean;
};

const STORAGE_KEY = 'darake.operationCostChecklist.v1';

const DEFAULT_ITEMS: OperationCostItem[] = [
  {
    id: 'apple-dev',
    label: 'Apple Developer Program',
    category: 'platform',
    monthlyJpy: '',
    yearlyJpy: '12800',
    isFree: false,
    notes: '年額 $99 USD（約¥12,800〜）',
    checked: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    category: 'development',
    monthlyJpy: '0',
    yearlyJpy: '0',
    isFree: true,
    notes: '個人・OSSは無料。TeamやEnterpriseは有料。',
    checked: false,
  },
  {
    id: 'vercel',
    label: 'Vercel / Cloudflare',
    category: 'hosting',
    monthlyJpy: '0',
    yearlyJpy: '0',
    isFree: true,
    notes: 'Hobby planは無料。商用利用はPro planが必要な場合あり。',
    checked: false,
  },
  {
    id: 'firebase',
    label: 'Firebase / Supabase',
    category: 'backend',
    monthlyJpy: '0',
    yearlyJpy: '0',
    isFree: true,
    notes: '無料枠あり。スケールに応じて課金発生。',
    checked: false,
  },
  {
    id: 'ai-api',
    label: 'AI API（OpenAI / Claude / Gemini等）',
    category: 'ai',
    monthlyJpy: '',
    yearlyJpy: '',
    isFree: false,
    notes: '使用量に応じた従量課金。このアプリでは現在使用しない。',
    checked: false,
  },
  {
    id: 'domain',
    label: 'ドメイン',
    category: 'infrastructure',
    monthlyJpy: '',
    yearlyJpy: '1500',
    isFree: false,
    notes: '年額約¥1,500〜（ドメインによる）',
    checked: false,
  },
  {
    id: 'design-assets',
    label: 'デザインアセット（Figma / アイコン等）',
    category: 'design',
    monthlyJpy: '',
    yearlyJpy: '0',
    isFree: true,
    notes: 'Figma無料枠あり。有料アセット購入の場合は別途。',
    checked: false,
  },
  {
    id: 'ads',
    label: '広告費',
    category: 'marketing',
    monthlyJpy: '0',
    yearlyJpy: '0',
    isFree: true,
    notes: '初期はSNS有機投稿のみ想定。',
    checked: false,
  },
  {
    id: 'other',
    label: 'その他',
    category: 'other',
    monthlyJpy: '',
    yearlyJpy: '',
    isFree: false,
    notes: '',
    checked: false,
  },
];

export function loadOperationCostChecklist(): OperationCostItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ITEMS;
    return JSON.parse(raw) as OperationCostItem[];
  } catch {
    return DEFAULT_ITEMS;
  }
}

export function saveOperationCostChecklist(items: OperationCostItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function formatOperationCostChecklistMarkdown(items: OperationCostItem[]): string {
  return [
    '# 運用コストチェックリスト',
    '',
    ...items.map(
      (item) =>
        `- [${item.checked ? 'x' : ' '}] **${item.label}** (${item.category}) — ` +
        `${item.isFree ? '無料' : `月額: ¥${item.monthlyJpy || '?'} / 年額: ¥${item.yearlyJpy || '?'}`}` +
        (item.notes ? ` — ${item.notes}` : ''),
    ),
  ].join('\n');
}
