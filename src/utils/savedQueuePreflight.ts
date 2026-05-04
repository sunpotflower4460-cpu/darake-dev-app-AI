import type { SavedAutoRunPlanQueue } from './savedAutoRunPlanQueue';

export type SavedQueuePreflightStatus = 'ready' | 'batch-gate' | 'hard-stop' | 'empty';

export type SavedQueuePreflight = {
  status: SavedQueuePreflightStatus;
  title: string;
  message: string;
  checks: string[];
};

export function buildSavedQueuePreflight(queue: SavedAutoRunPlanQueue): SavedQueuePreflight {
  if (queue.items.length === 0) {
    return {
      status: 'empty',
      title: '実行前チェック：保存済みQueueなし',
      message: 'Auto Run Planを保存すると、実行前チェックを表示できます。',
      checks: ['保存済みPlanなし', 'Queueなし', '実行対象なし'],
    };
  }

  const blocked = queue.items.filter((item) => item.status === 'blocked');
  const needsReview = queue.items.filter((item) => item.status === 'needs-review');
  const pending = queue.items.filter((item) => item.status === 'pending');

  if (blocked.length > 0) {
    return {
      status: 'hard-stop',
      title: '実行前チェック：途中停止候補あり',
      message: '一部にblockedがあります。secret、本番公開、ストア提出などが含まれる場合は、そこだけ途中停止します。',
      checks: [
        `pending: ${pending.length}`,
        `needs-review: ${needsReview.length}`,
        `blocked: ${blocked.length}`,
        'blockedは実行前または該当地点で停止候補',
      ],
    };
  }

  if (needsReview.length > 0) {
    return {
      status: 'batch-gate',
      title: '実行前チェック：Batch Gateで進行可能',
      message: '後で確認する項目がありますが、途中で止めず完成間近レポートへまとめる方針で進められます。',
      checks: [
        `pending: ${pending.length}`,
        `needs-review: ${needsReview.length}`,
        'needs-reviewは完成間近レポートへ集約',
        '致命的なblockedなし',
      ],
    };
  }

  return {
    status: 'ready',
    title: '実行前チェック：自動進行候補',
    message: '保存済みQueueは低リスク中心です。次の段階では、このQueueを実行候補として扱えます。',
    checks: [`pending: ${pending.length}`, 'needs-reviewなし', 'blockedなし', '次Phaseで実行候補化できる'],
  };
}
