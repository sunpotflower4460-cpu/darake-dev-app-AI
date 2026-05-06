import { loadMonetizationPlans } from './monetizationPlan';
import { loadOperationCostChecklist } from './operationCostChecklist';
import { loadLaunchPromotionMemos } from './launchPromotionMemo';

export type RevenueOperationsReport = {
  monetizationPlanCount: number;
  monetizationModels: string[];
  undecidedItems: string[];
  costMemos: string[];
  revenueMemos: string[];
  launchPromotionAppCount: number;
  nextRecommendations: string[];
};

export function buildRevenueOperationsReport(): RevenueOperationsReport {
  const plans = loadMonetizationPlans();
  const costItems = loadOperationCostChecklist();
  const promoMemos = loadLaunchPromotionMemos();

  const monetizationModels = [...new Set(plans.map((p) => p.model))];
  const undecidedItems: string[] = [];
  plans.forEach((p) => {
    if (p.model === 'unknown') undecidedItems.push(`${p.appName}: 収益モデル未定`);
    if (!p.monthlyPriceJpy && !p.oneTimePriceJpy && p.model !== 'free') {
      undecidedItems.push(`${p.appName}: 価格未設定`);
    }
  });

  const costMemos = costItems
    .filter((c) => !c.isFree && c.yearlyJpy)
    .map((c) => `${c.label}: 年額 ¥${c.yearlyJpy}`);

  const revenueMemos = plans
    .filter((p) => p.expectedMonthlyRevenueMemo)
    .map((p) => `${p.appName}: ${p.expectedMonthlyRevenueMemo}`);

  const nextRecommendations: string[] = [];
  if (undecidedItems.length > 0) {
    nextRecommendations.push('未定の収益モデル・価格を決定する');
  }
  if (promoMemos.length === 0) {
    nextRecommendations.push('Launch Promotionメモを作成する');
  } else {
    nextRecommendations.push('SNS投稿文を実際に投稿する（手動）');
  }
  nextRecommendations.push('運用コストの見直しを定期的に行う');

  return {
    monetizationPlanCount: plans.length,
    monetizationModels,
    undecidedItems,
    costMemos,
    revenueMemos,
    launchPromotionAppCount: promoMemos.length,
    nextRecommendations,
  };
}

export function formatRevenueOperationsReportMarkdown(report: RevenueOperationsReport): string {
  return [
    '# 収益・運用レポート',
    '',
    `- 収益化プラン登録数: ${report.monetizationPlanCount}件`,
    `- 収益モデル: ${report.monetizationModels.join(', ') || '未設定'}`,
    `- Launch Promotionメモ: ${report.launchPromotionAppCount}件`,
    '',
    '## 未定項目',
    report.undecidedItems.length > 0
      ? report.undecidedItems.map((i) => `- ⚠️ ${i}`).join('\n')
      : '- なし',
    '',
    '## コストメモ',
    report.costMemos.length > 0 ? report.costMemos.map((c) => `- ${c}`).join('\n') : '- なし',
    '',
    '## 収益見込みメモ',
    report.revenueMemos.length > 0 ? report.revenueMemos.map((r) => `- ${r}`).join('\n') : '- なし',
    '',
    '## 次のおすすめ',
    ...report.nextRecommendations.map((r) => `- ${r}`),
    '',
    '## 注意',
    '- これは自己管理メモです。投資・金融助言ではありません。',
    '- 自動価格設定・自動課金設定は行いません。',
  ].join('\n');
}
