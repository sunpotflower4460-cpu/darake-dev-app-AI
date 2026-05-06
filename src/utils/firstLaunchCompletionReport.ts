import { loadFirstLaunchCareState } from './firstLaunchCareOnboarding';

export type FirstLaunchCompletionReport = {
  title: string;
  phase: string;
  isCompleted: boolean;
  missingItems: string[];
  canPonStart: boolean;
  recommendations: string[];
  completionMarkdown: string;
};

export function buildFirstLaunchCompletionReport(): FirstLaunchCompletionReport {
  const state = loadFirstLaunchCareState();

  const missingItems: string[] = [];

  if (!state) {
    missingItems.push('初回設定がまだ始まっていません');
  } else {
    if (!state.appName) missingItems.push('アプリ名が未入力');
    if (!state.appSeed) missingItems.push('アプリの内容が未入力');
    if (!state.targetUser) missingItems.push('対象ユーザーが未入力');
  }

  const isCompleted = state?.hasCompletedFirstLaunch === true && missingItems.length === 0;
  const canPonStart = isCompleted;

  const recommendations: string[] = [];
  if (!isCompleted) {
    recommendations.push('「はじめる」ボタンから初回設定を完了してください');
  } else {
    recommendations.push('やさしいフォームでアプリの詳細を入力できます');
    recommendations.push('ぽん開始パックで設計書を生成できます');
  }

  const lines = [
    '# 初回介護オンボーディング 完成レポート (Phase 45)',
    '',
    `**完了状態**: ${isCompleted ? '✅ 完了' : '⏳ 未完了'}`,
    `**ぽん開始可能**: ${canPonStart ? 'はい' : 'いいえ'}`,
    '',
  ];

  if (missingItems.length > 0) {
    lines.push('## 未入力項目');
    missingItems.forEach((m) => lines.push(`- ${m}`));
    lines.push('');
  }

  lines.push('## 次のおすすめ');
  recommendations.forEach((r) => lines.push(`- ${r}`));

  return {
    title: '初回介護オンボーディング 完成レポート',
    phase: '45',
    isCompleted,
    missingItems,
    canPonStart,
    recommendations,
    completionMarkdown: lines.join('\n'),
  };
}
