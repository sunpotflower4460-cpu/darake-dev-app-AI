export type CompletionReportForecast = {
  title: string;
  status: 'likely-success' | 'likely-needs-review' | 'likely-blocked';
  wouldComplete: string[];
  wouldRemain: string[];
  wouldNeedHuman: string[];
  forecastMarkdown: string;
};

export function buildCompletionReportForecast(
  candidateTitle: string,
  wouldComplete: string[],
  wouldRemain: string[],
  wouldNeedHuman: string[]
): CompletionReportForecast {
  const status: CompletionReportForecast['status'] =
    wouldRemain.length === 0 && wouldNeedHuman.length === 0
      ? 'likely-success'
      : wouldNeedHuman.length > 0
        ? 'likely-needs-review'
        : 'likely-blocked';

  const lines = [
    `# 完了レポート予測: ${candidateTitle}`,
    '',
    `**見込みステータス:** ${
      status === 'likely-success'
        ? '✅ 成功見込み'
        : status === 'likely-needs-review'
          ? '⚠️ 確認必要'
          : '🚫 ブロック見込み'
    }`,
  ];

  if (wouldComplete.length > 0) {
    lines.push('', '## 完了見込み');
    wouldComplete.forEach((c) => lines.push(`- ✅ ${c}`));
  }
  if (wouldNeedHuman.length > 0) {
    lines.push('', '## 人間対応が必要');
    wouldNeedHuman.forEach((h) => lines.push(`- 👤 ${h}`));
  }
  if (wouldRemain.length > 0) {
    lines.push('', '## 残り課題');
    wouldRemain.forEach((r) => lines.push(`- 📋 ${r}`));
  }

  return {
    title: `完了レポート予測: ${candidateTitle}`,
    status,
    wouldComplete,
    wouldRemain,
    wouldNeedHuman,
    forecastMarkdown: lines.join('\n'),
  };
}
