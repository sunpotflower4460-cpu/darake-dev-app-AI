import type { CompletionReport } from './completionReport';
import type { UiCheckResultRecord } from './uiCheckResultRecord';
import { summarizeUiCheckResult } from './uiCheckResultRecord';

export type UiCheckCompletionReport = CompletionReport & {
  uiSummary: ReturnType<typeof summarizeUiCheckResult>;
};

const placeholderDone = 'まだ自動進行候補はありません';
const placeholderNote = '軽微な後回し項目はまだありません';
const placeholderHardStop = '途中停止が必要な項目はまだありません';

function withoutPlaceholder(items: string[], placeholder: string): string[] {
  return items.filter((item) => item !== placeholder);
}

function resultLabel(entry: UiCheckResultRecord['entries'][number]): string {
  const target = entry.targetLabel ? `${entry.targetLabel} / ` : '';
  return `${target}${entry.label}: ${entry.note}`;
}

export function buildUiCheckCompletionReport(
  baseReport: CompletionReport,
  uiRecord: UiCheckResultRecord,
): UiCheckCompletionReport {
  const uiSummary = summarizeUiCheckResult(uiRecord);
  const passItems = uiRecord.entries.filter((entry) => entry.result === 'pass').map(resultLabel);
  const warnItems = uiRecord.entries.filter((entry) => entry.result === 'warn').map(resultLabel);
  const failItems = uiRecord.entries.filter((entry) => entry.result === 'fail').map(resultLabel);
  const uncheckedItems = uiRecord.entries.filter((entry) => entry.result === 'unchecked').map(resultLabel);

  const doneItems = [
    ...withoutPlaceholder(baseReport.doneItems, placeholderDone),
    ...passItems.map((item) => `UI pass: ${item}`),
  ];

  const batchedNotes = [
    ...withoutPlaceholder(baseReport.batchedNotes, placeholderNote),
    ...warnItems.map((item) => `UI warn: ${item}`),
    ...uncheckedItems.map((item) => `UI unchecked: ${item}`),
  ];

  const hardStopItems = [
    ...withoutPlaceholder(baseReport.hardStopItems, placeholderHardStop),
    ...failItems.map((item) => `UI fail: ${item}`),
  ];

  return {
    ...baseReport,
    title: uiSummary.fail > 0
      ? '完成間近レポート候補：UI停止候補あり'
      : uiSummary.warn > 0 || uiSummary.unchecked > 0
        ? '完成間近レポート候補：UI確認項目あり'
        : '完成間近レポート候補：UIチェック統合済み',
    message: uiSummary.message,
    doneItems: doneItems.length > 0 ? doneItems : [placeholderDone],
    batchedNotes: batchedNotes.length > 0 ? batchedNotes : [placeholderNote],
    hardStopItems: hardStopItems.length > 0 ? hardStopItems : [placeholderHardStop],
    nextRecommendations: [
      ...baseReport.nextRecommendations,
      'Phase 10.6でUIチェック結果をCompletion Report本体へ常時合流する',
      'Phase 10.7でスクショ実行結果を同じ結果欄へ接続する',
    ],
    uiSummary,
  };
}

export function formatUiCheckCompletionReport(report: UiCheckCompletionReport): string {
  const formatList = (items: string[]) => items.map((item) => `- ${item}`).join('\n');

  return [
    `# ${report.title}`,
    '',
    report.message,
    '',
    '## UI Check Summary',
    `- status: ${report.uiSummary.status}`,
    `- total: ${report.uiSummary.total}`,
    `- unchecked: ${report.uiSummary.unchecked}`,
    `- pass: ${report.uiSummary.pass}`,
    `- warn: ${report.uiSummary.warn}`,
    `- fail: ${report.uiSummary.fail}`,
    `- completionRate: ${report.uiSummary.completionRate}%`,
    '',
    '## できたこと候補',
    formatList(report.doneItems),
    '',
    '## 最後にまとめる注意点',
    formatList(report.batchedNotes),
    '',
    '## 手動項目',
    formatList(report.manualItems),
    '',
    '## 途中停止候補',
    formatList(report.hardStopItems),
    '',
    '## 次のおすすめ',
    formatList(report.nextRecommendations),
  ].join('\n');
}
