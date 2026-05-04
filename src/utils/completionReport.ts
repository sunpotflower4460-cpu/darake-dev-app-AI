import type { AutoRunQueueItem } from './autoRunPhaseQueue';
import type { RiskClassification } from './riskClassifier';

export type CompletionReport = {
  title: string;
  message: string;
  doneItems: string[];
  batchedNotes: string[];
  manualItems: string[];
  hardStopItems: string[];
  nextRecommendations: string[];
};

export function buildCompletionReport(
  queueItems: AutoRunQueueItem[],
  classifications: RiskClassification[],
): CompletionReport {
  const safeItems = classifications.filter((item) => item.risk === 'safe-auto').map((item) => item.item);
  const reviewItems = classifications.filter((item) => item.risk === 'review-needed').map((item) => item.item);
  const manualItems = classifications.filter((item) => item.risk === 'manual-gate').map((item) => item.item);
  const blockedItems = classifications.filter((item) => item.risk === 'blocked').map((item) => item.item);
  const queueBlocked = queueItems.filter((item) => item.status === 'blocked').map((item) => item.title);

  return {
    title: blockedItems.length > 0 ? '完成間近レポート候補：途中停止候補あり' : '完成間近レポート候補',
    message:
      blockedItems.length > 0
        ? '大半はまとめて進められますが、途中停止候補があります。secretや本番公開などが含まれる場合はそこで止めます。'
        : '途中の軽微な確認はまとめ、完成間近で確認しやすい形にします。',
    doneItems: safeItems.length > 0 ? safeItems : ['まだ自動進行候補はありません'],
    batchedNotes: reviewItems.length > 0 ? reviewItems : ['軽微な後回し項目はまだありません'],
    manualItems: manualItems.length > 0 ? manualItems : ['最後にまとめる手動項目はまだありません'],
    hardStopItems: [...new Set([...blockedItems, ...queueBlocked])].length > 0 ? [...new Set([...blockedItems, ...queueBlocked])] : ['途中停止が必要な項目はまだありません'],
    nextRecommendations: [
      'Phase Queueを保存できるようにする',
      'Completion Reportをコピーできるようにする',
      '将来はPreview URLとスクショ結果をここへ合流する',
    ],
  };
}
