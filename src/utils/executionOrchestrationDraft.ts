import type { CompletionReport } from './completionReport';
import type { SavedAutoRunPlanQueue } from './savedAutoRunPlanQueue';
import type { SavedQueuePreflight } from './savedQueuePreflight';

export type ExecutionOrchestrationDraft = {
  title: string;
  message: string;
  canPrepare: boolean;
  handoffMode: 'not-ready' | 'batch-gate' | 'ready' | 'blocked';
  payloadSummary: string[];
  safetyNotes: string[];
};

export function buildExecutionOrchestrationDraft(
  queue: SavedAutoRunPlanQueue,
  preflight: SavedQueuePreflight,
  report: CompletionReport,
): ExecutionOrchestrationDraft {
  if (preflight.status === 'empty') {
    return {
      title: '実行オーケストレーション入口：未準備',
      message: '保存済みAuto Run Planがまだないため、実行パック下書きは作れません。まずPlanを保存します。',
      canPrepare: false,
      handoffMode: 'not-ready',
      payloadSummary: ['保存済みQueueなし', 'Preflightはempty', 'Completion Reportは候補のみ'],
      safetyNotes: ['外部実行なし', 'GitHub操作なし', 'secret不使用'],
    };
  }

  if (preflight.status === 'hard-stop') {
    return {
      title: '実行オーケストレーション入口：停止候補あり',
      message: '実行パック下書きは作れますが、blockedが含まれます。該当地点では必ず停止候補として扱います。',
      canPrepare: true,
      handoffMode: 'blocked',
      payloadSummary: [
        `Queue items: ${queue.items.length}`,
        `Hard stop items: ${report.hardStopItems.length}`,
        'Blockedを含むため、実行前または該当地点で停止候補',
      ],
      safetyNotes: ['secret / token / key は含めない', '本番DB・認証・課金・公開判断は手動', '外部実行ボタンはまだ作らない'],
    };
  }

  if (preflight.status === 'batch-gate') {
    return {
      title: '実行オーケストレーション入口：Batch Gate候補',
      message: '後で確認する項目はありますが、完成間近レポートにまとめる前提で実行パック下書きにできます。',
      canPrepare: true,
      handoffMode: 'batch-gate',
      payloadSummary: [
        `Queue items: ${queue.items.length}`,
        `Batched notes: ${report.batchedNotes.length}`,
        `Manual items: ${report.manualItems.length}`,
      ],
      safetyNotes: ['needs-reviewは途中停止せず最後にまとめる', 'manual-gateは必要時だけ止める', '外部実行ボタンはまだ作らない'],
    };
  }

  return {
    title: '実行オーケストレーション入口：実行候補',
    message: '保存済みQueueは低リスク中心です。次の段階では、この下書きを外部実行に渡す候補にできます。',
    canPrepare: true,
    handoffMode: 'ready',
    payloadSummary: [`Queue items: ${queue.items.length}`, 'blockedなし', 'needs-reviewなし'],
    safetyNotes: ['外部実行はまだしない', 'PR作成・マージはしない', 'secret / token / key は扱わない'],
  };
}

export function formatExecutionOrchestrationDraft(draft: ExecutionOrchestrationDraft): string {
  return [
    `# ${draft.title}`,
    '',
    draft.message,
    '',
    `- canPrepare: ${draft.canPrepare}`,
    `- handoffMode: ${draft.handoffMode}`,
    '',
    '## Payload Summary',
    ...draft.payloadSummary.map((item) => `- ${item}`),
    '',
    '## Safety Notes',
    ...draft.safetyNotes.map((item) => `- ${item}`),
  ].join('\n');
}
