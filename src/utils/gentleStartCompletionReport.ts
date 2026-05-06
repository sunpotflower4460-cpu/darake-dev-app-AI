import { loadGentleAppStartForm, validateGentleAppStartForm } from './gentleAppStartForm';
import { buildGentleFormToBlueprintBridge } from './gentleFormToBlueprintBridge';

export type GentleStartCompletionReport = {
  title: string;
  phase: string;
  isFormFilled: boolean;
  isBlueprintReady: boolean;
  missingItems: string[];
  recommendations: string[];
  completionMarkdown: string;
};

export function buildGentleStartCompletionReport(): GentleStartCompletionReport {
  const form = loadGentleAppStartForm();
  const bridge = buildGentleFormToBlueprintBridge(form);

  const formErrors = form ? validateGentleAppStartForm(form) : ['フォームが未入力です'];
  const isFormFilled = formErrors.length === 0;
  const isBlueprintReady = bridge.status === 'ready';

  const missingItems = [...formErrors, ...bridge.blockers];
  const recommendations: string[] = [];

  if (!isFormFilled) {
    recommendations.push('やさしいフォームにアプリ名と内容を入力してください');
  } else if (!isBlueprintReady) {
    recommendations.push('設計書プレビューで確認事項を解消してください');
  } else {
    recommendations.push('ぽん開始パックを生成できます');
    recommendations.push('Cloud Agent指示書をコピーして渡せます');
  }

  const lines = [
    '# やさしい開始 完成レポート (Phase 46)',
    '',
    `**フォーム入力**: ${isFormFilled ? '✅ 完了' : '⏳ 未完了'}`,
    `**設計書準備**: ${isBlueprintReady ? '✅ 準備OK' : '⏳ 未準備'}`,
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
    title: 'やさしい開始 完成レポート',
    phase: '46',
    isFormFilled,
    isBlueprintReady,
    missingItems,
    recommendations,
    completionMarkdown: lines.join('\n'),
  };
}
