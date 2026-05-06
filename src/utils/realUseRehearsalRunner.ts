import type { RealUseRehearsalScenario } from './realUseRehearsalScenario';

export type RealUseRehearsalStatus =
  | 'darake-success'
  | 'too-much-human-work'
  | 'blocked'
  | 'needs-review';

export type RealUseRehearsalResult = {
  title: string;
  status: RealUseRehearsalStatus;
  scenarioId: string;
  visibleToHuman: string[];
  hiddenFromHuman: string[];
  autoHandled: string[];
  manualGates: string[];
  unnecessaryFriction: string[];
  recommendedCuts: string[];
  summary: string;
};

const STATUS_LABELS: Record<RealUseRehearsalStatus, string> = {
  'darake-success': 'だらけ成功 ✅',
  'too-much-human-work': '手間多すぎ ⚠️',
  blocked: 'ブロック中 🚫',
  'needs-review': '要確認 📋',
};

export function runRealUseRehearsal(scenario: RealUseRehearsalScenario): RealUseRehearsalResult {
  const unnecessaryFriction: string[] = [];
  const recommendedCuts: string[] = [];

  // Check for unnecessary friction
  if (scenario.humanShouldSee.length > 3) {
    unnecessaryFriction.push('人間が見る項目が多すぎます');
    recommendedCuts.push('見る項目を3件以内に絞る');
  }

  if (scenario.manualGates.length > 3) {
    unnecessaryFriction.push('手動ゲートが多すぎます（3件以上）');
    recommendedCuts.push('手動ゲートをまとめるか、Review Inboxへ移動する');
  }

  const safeItems = scenario.humanShouldNotNeedToSee.filter((item) =>
    !item.includes('blocked') &&
    !item.includes('secret') &&
    !item.includes('production') &&
    !item.includes('billing') &&
    !item.includes('auth')
  );
  if (safeItems.length > 0) {
    unnecessaryFriction.push('安全な詳細が表示されたままになっています');
    recommendedCuts.push(`詳細をデフォルト非表示にする: ${safeItems.slice(0, 2).join(', ')} など`);
  }

  if (scenario.expectedDarakeFlow.length > 8) {
    unnecessaryFriction.push('フローが長すぎます（ステップが多い）');
    recommendedCuts.push('自動化できるステップをまとめる');
  }

  // Determine status
  let status: RealUseRehearsalStatus;
  const isBlocked = scenario.blockedIf.some((b) =>
    b.includes('secret') || b.includes('CI失敗') || b.includes('リジェクト')
  ) && scenario.currentStage === 'submission-gate';

  if (isBlocked) {
    status = 'blocked';
  } else if (unnecessaryFriction.length >= 3) {
    status = 'too-much-human-work';
  } else if (unnecessaryFriction.length >= 1) {
    status = 'needs-review';
  } else {
    status = 'darake-success';
  }

  // Build visible / hidden / auto-handled lists
  const visibleToHuman = scenario.humanShouldSee.slice();
  if (status === 'blocked') {
    visibleToHuman.push('🚫 ブロック理由');
  }

  const hiddenFromHuman = scenario.humanShouldNotNeedToSee.slice();
  const autoHandled = scenario.expectedDarakeFlow.filter((step) =>
    !scenario.manualGates.some((gate) => step.includes(gate.split(/\s/)[0]))
  );

  const summaryLines: string[] = [
    `## 通し稽古結果: ${scenario.title}`,
    '',
    `**だらけ成功度**: ${STATUS_LABELS[status]}`,
    '',
    `**アプリ**: ${scenario.appName} (${scenario.platform})`,
    `**現在のステージ**: ${scenario.currentStage}`,
    '',
  ];

  if (unnecessaryFriction.length > 0) {
    summaryLines.push('**人間の手間が残っています:**');
    unnecessaryFriction.forEach((f) => summaryLines.push(`- ${f}`));
    summaryLines.push('');
  }

  if (recommendedCuts.length > 0) {
    summaryLines.push('**削るべきもの:**');
    recommendedCuts.forEach((c) => summaryLines.push(`- ${c}`));
    summaryLines.push('');
  }

  summaryLines.push('**手動ゲート（必要なもの）:**');
  scenario.manualGates.forEach((g) => summaryLines.push(`- ${g}`));

  return {
    title: `通し稽古: ${scenario.title}`,
    status,
    scenarioId: scenario.id,
    visibleToHuman,
    hiddenFromHuman,
    autoHandled,
    manualGates: scenario.manualGates,
    unnecessaryFriction,
    recommendedCuts,
    summary: summaryLines.join('\n'),
  };
}

export { STATUS_LABELS as REHEARSAL_STATUS_LABELS };
