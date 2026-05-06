import { loadFirstLaunchCareState } from './firstLaunchCareOnboarding';
import { loadGentleAppStartForm, validateGentleAppStartForm } from './gentleAppStartForm';
import { buildGentleFormToBlueprintBridge } from './gentleFormToBlueprintBridge';
import { buildPonStartPack } from './ponStartPack';

export type FirstAppStartCompletionReport = {
  title: string;
  phase: string;
  onboardingComplete: boolean;
  formCanStart: boolean;
  ponPackReady: boolean;
  beginnerFlowReady: boolean;
  missingItems: string[];
  recommendations: string[];
  completionMarkdown: string;
};

export function buildFirstAppStartCompletionReport(): FirstAppStartCompletionReport {
  const launchState = loadFirstLaunchCareState();
  const form = loadGentleAppStartForm();
  const bridge = buildGentleFormToBlueprintBridge(form);
  const pack = buildPonStartPack();

  const onboardingComplete = launchState?.hasCompletedFirstLaunch === true;
  const formErrors = form ? validateGentleAppStartForm(form) : ['フォーム未入力'];
  const formCanStart = formErrors.length === 0;
  const ponPackReady = pack.status === 'ready-to-copy' || pack.status === 'needs-review';
  const beginnerFlowReady = onboardingComplete && formCanStart && ponPackReady;

  const missingItems: string[] = [];
  if (!onboardingComplete) missingItems.push('初回オンボーディングが未完了');
  if (!formCanStart) missingItems.push(...formErrors);
  if (!ponPackReady) missingItems.push(...bridge.blockers);

  const recommendations: string[] = [];
  if (!onboardingComplete) {
    recommendations.push('「はじめる」から初回設定を完了してください');
  } else if (!formCanStart) {
    recommendations.push('やさしいフォームの必須項目を入力してください');
  } else if (!ponPackReady) {
    recommendations.push('設計書プレビューで問題を解消してください');
  } else {
    recommendations.push('ぽん開始パックをコピーしてCloud Agentに渡せます');
    recommendations.push('Phase 48: First Real App Runへ進めます');
  }

  const lines = [
    '# First App Start 完成レポート (Phase 47)',
    '',
    `**オンボーディング**: ${onboardingComplete ? '✅' : '⏳'}`,
    `**フォーム入力**: ${formCanStart ? '✅' : '⏳'}`,
    `**ぽん開始パック**: ${ponPackReady ? '✅' : '⏳'}`,
    `**初心者導線全体**: ${beginnerFlowReady ? '✅ 完成' : '⏳ 未完成'}`,
    '',
  ];

  if (missingItems.length > 0) {
    lines.push('## 未対応項目');
    missingItems.forEach((m) => lines.push(`- ${m}`));
    lines.push('');
  }

  lines.push('## 次のおすすめ');
  recommendations.forEach((r) => lines.push(`- ${r}`));

  return {
    title: 'First App Start 完成レポート',
    phase: '47',
    onboardingComplete,
    formCanStart,
    ponPackReady,
    beginnerFlowReady,
    missingItems,
    recommendations,
    completionMarkdown: lines.join('\n'),
  };
}
