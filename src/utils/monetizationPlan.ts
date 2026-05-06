export type MonetizationModel =
  | 'free'
  | 'one-time-paid'
  | 'subscription'
  | 'freemium'
  | 'ads'
  | 'donation'
  | 'unknown';

export type MonetizationPlan = {
  appId: string;
  appName: string;
  model: MonetizationModel;
  monthlyPriceJpy: string;
  oneTimePriceJpy: string;
  freeScope: string;
  paidScope: string;
  targetUsers: string;
  expectedMonthlyRevenueMemo: string;
  costMemo: string;
  notes: string;
};

const STORAGE_KEY = 'darake.monetizationPlans.v1';

export function buildInitialMonetizationPlan(): MonetizationPlan {
  return {
    appId: `app-${Date.now()}`,
    appName: '',
    model: 'unknown',
    monthlyPriceJpy: '',
    oneTimePriceJpy: '',
    freeScope: '',
    paidScope: '',
    targetUsers: '',
    expectedMonthlyRevenueMemo: '',
    costMemo: '',
    notes: '',
  };
}

export function loadMonetizationPlans(): MonetizationPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MonetizationPlan[];
  } catch {
    return [];
  }
}

export function saveMonetizationPlans(plans: MonetizationPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // ignore
  }
}

export function addMonetizationPlan(plans: MonetizationPlan[], plan: MonetizationPlan): MonetizationPlan[] {
  return [...plans, plan];
}

export function updateMonetizationPlan(plans: MonetizationPlan[], updated: MonetizationPlan): MonetizationPlan[] {
  return plans.map((p) => (p.appId === updated.appId ? updated : p));
}

export function deleteMonetizationPlan(plans: MonetizationPlan[], appId: string): MonetizationPlan[] {
  return plans.filter((p) => p.appId !== appId);
}

export function summarizeMonetizationPlans(plans: MonetizationPlan[]): string {
  if (plans.length === 0) return '収益化プランが登録されていません。';
  const modelCounts: Partial<Record<MonetizationModel, number>> = {};
  plans.forEach((p) => {
    modelCounts[p.model] = (modelCounts[p.model] ?? 0) + 1;
  });
  const modelSummary = Object.entries(modelCounts)
    .map(([model, count]) => `- ${model}: ${count}件`)
    .join('\n');
  return [`## 収益化プラン一覧 (${plans.length}件)`, modelSummary].join('\n');
}

export function formatMonetizationPlanMarkdown(plan: MonetizationPlan): string {
  return [
    `# 収益化プラン: ${plan.appName || '（未設定）'}`,
    `- モデル: ${plan.model}`,
    `- 月額価格: ${plan.monthlyPriceJpy ? `¥${plan.monthlyPriceJpy}` : '未設定'}`,
    `- 買い切り価格: ${plan.oneTimePriceJpy ? `¥${plan.oneTimePriceJpy}` : '未設定'}`,
    `- 無料範囲: ${plan.freeScope || '未設定'}`,
    `- 有料範囲: ${plan.paidScope || '未設定'}`,
    `- ターゲットユーザー: ${plan.targetUsers || '未設定'}`,
    '',
    '## 収益見込みメモ',
    plan.expectedMonthlyRevenueMemo || '（未入力）',
    '',
    '## コストメモ',
    plan.costMemo || '（未入力）',
    '',
    '## ノート',
    plan.notes || '（未入力）',
    '',
    '## 注意',
    '- これは収益計画メモです。投資・金融助言ではありません。',
    '- 自動価格設定は行いません。',
  ].join('\n');
}

export function getMonetizationModelLabel(model: MonetizationModel): string {
  const labels: Record<MonetizationModel, string> = {
    free: '無料',
    'one-time-paid': '買い切り',
    subscription: 'サブスクリプション',
    freemium: 'フリーミアム',
    ads: '広告',
    donation: '寄付',
    unknown: '未定',
  };
  return labels[model];
}
