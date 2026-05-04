import type { AutoRunQueueItem } from './autoRunPhaseQueue';
import { buildAutoRunPhaseQueue } from './autoRunPhaseQueue';
import type { SavedAutoRunPlan } from './autoRunPlanStore';
import { classifyRiskList } from './riskClassifier';

export type SavedAutoRunPlanQueue = {
  title: string;
  message: string;
  savedAt: string;
  items: AutoRunQueueItem[];
};

function splitLines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

export function buildSavedAutoRunPlanQueue(plan: SavedAutoRunPlan): SavedAutoRunPlanQueue {
  const scopeItems = splitLines(plan.autoScope);
  const hasPlan = Boolean(plan.appName || plan.seed || plan.completionDefinition || scopeItems.length > 0);
  const classifications = classifyRiskList(scopeItems);

  return {
    title: hasPlan ? `${plan.appName || '保存済みPlan'} の固定Queue` : '保存済みPlanはまだありません',
    message: hasPlan
      ? '保存済みAuto Run Planから生成したQueueです。次の一括進行では、この固定Queueを土台にします。'
      : 'Auto Run Planを保存すると、ここに固定Queueが表示されます。',
    savedAt: plan.savedAt || '未保存',
    items: buildAutoRunPhaseQueue(classifications),
  };
}
