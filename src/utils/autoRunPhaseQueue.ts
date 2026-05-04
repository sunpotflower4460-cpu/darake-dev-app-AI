import type { RiskClassification } from './riskClassifier';

export type AutoRunQueueStatus = 'pending' | 'running' | 'done' | 'needs-review' | 'blocked';

export type AutoRunQueueItem = {
  id: string;
  order: number;
  title: string;
  status: AutoRunQueueStatus;
  riskLabel: string;
  note: string;
};

function toQueueStatus(classification: RiskClassification): AutoRunQueueStatus {
  if (classification.risk === 'blocked') return 'blocked';
  if (classification.risk === 'manual-gate' || classification.risk === 'review-needed') return 'needs-review';
  return 'pending';
}

function toQueueNote(classification: RiskClassification): string {
  if (classification.risk === 'safe-auto') return '自動進行候補です。実行段階では前の項目が成功したら順番に進めます。';
  if (classification.risk === 'review-needed') return '途中停止ではなく、完成間近レポートにまとめる候補です。';
  if (classification.risk === 'manual-gate') return '人間確認が必要です。できる限り完成間近レポートへまとめます。';
  return '進行不能または危険になりやすい項目です。必要なら途中停止します。';
}

export function buildAutoRunPhaseQueue(classifications: RiskClassification[]): AutoRunQueueItem[] {
  return classifications.map((classification, index) => ({
    id: `auto-run-${index + 1}-${classification.item}`,
    order: index + 1,
    title: classification.item,
    status: toQueueStatus(classification),
    riskLabel: classification.label,
    note: toQueueNote(classification),
  }));
}

export function summarizeAutoRunQueue(items: AutoRunQueueItem[]) {
  return {
    pending: items.filter((item) => item.status === 'pending').length,
    running: items.filter((item) => item.status === 'running').length,
    done: items.filter((item) => item.status === 'done').length,
    needsReview: items.filter((item) => item.status === 'needs-review').length,
    blocked: items.filter((item) => item.status === 'blocked').length,
  };
}
