import type { ScreenshotResultEntry, ScreenshotResultRecord } from './screenshotResultRecord';
import { summarizeScreenshotResult } from './screenshotResultRecord';
import type { UiCheckResultEntry, UiCheckResultRecord, UiCheckResultValue } from './uiCheckResultRecord';
import { summarizeUiCheckResult } from './uiCheckResultRecord';

export type ScreenshotToUiCheckMapping = {
  screenshotTargetId: string;
  screenshotLabel: string;
  screenshotStatus: ScreenshotResultEntry['status'];
  mappedResult: UiCheckResultValue;
  affectedCheckIds: string[];
  note: string;
};

export type ScreenshotToUiCheckBridge = {
  title: string;
  status: 'not-ready' | 'ready' | 'needs-review' | 'blocked';
  message: string;
  screenshotSummary: ReturnType<typeof summarizeScreenshotResult>;
  uiSummaryBefore: ReturnType<typeof summarizeUiCheckResult>;
  mappings: ScreenshotToUiCheckMapping[];
  previewRecord: UiCheckResultRecord;
  safetyNotes: string[];
};

function mapScreenshotStatus(status: ScreenshotResultEntry['status']): UiCheckResultValue {
  if (status === 'captured') return 'pass';
  if (status === 'warn') return 'warn';
  if (status === 'failed') return 'fail';
  return 'unchecked';
}

function normalizeTargetLabel(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function isEntryForScreenshot(entry: UiCheckResultEntry, screenshot: ScreenshotResultEntry): boolean {
  if (entry.scope !== 'target') return false;
  const entryTarget = normalizeTargetLabel(entry.targetLabel);
  const screenshotTarget = normalizeTargetLabel(screenshot.label);
  return Boolean(entryTarget && screenshotTarget && entryTarget === screenshotTarget);
}

function updateEntryFromScreenshot(entry: UiCheckResultEntry, screenshot: ScreenshotResultEntry): UiCheckResultEntry {
  const mappedResult = mapScreenshotStatus(screenshot.status);
  const statusNote = `screenshot ${screenshot.status}`;
  const imageNote = screenshot.imagePath ? `imagePath: ${screenshot.imagePath}` : 'imagePath未入力';
  const capturedNote = screenshot.capturedAt ? `capturedAt: ${screenshot.capturedAt}` : 'capturedAt未入力';

  return {
    ...entry,
    result: mappedResult,
    note: `${entry.note} / ${statusNote} / ${imageNote} / ${capturedNote}`,
  };
}

export function buildScreenshotToUiCheckBridge(
  screenshotRecord: ScreenshotResultRecord,
  uiRecord: UiCheckResultRecord,
): ScreenshotToUiCheckBridge {
  const screenshotSummary = summarizeScreenshotResult(screenshotRecord);
  const uiSummaryBefore = summarizeUiCheckResult(uiRecord);

  const mappings = screenshotRecord.entries.map((screenshot) => {
    const affectedCheckIds = uiRecord.entries
      .filter((entry) => isEntryForScreenshot(entry, screenshot))
      .map((entry) => entry.checkId);

    return {
      screenshotTargetId: screenshot.targetId,
      screenshotLabel: screenshot.label,
      screenshotStatus: screenshot.status,
      mappedResult: mapScreenshotStatus(screenshot.status),
      affectedCheckIds,
      note: affectedCheckIds.length > 0
        ? `${affectedCheckIds.length}件のUI target checkへ反映できます。`
        : '対応するUI target checkが見つかりません。',
    } satisfies ScreenshotToUiCheckMapping;
  });

  const previewRecord: UiCheckResultRecord = {
    ...uiRecord,
    entries: uiRecord.entries.map((entry) => {
      const screenshot = screenshotRecord.entries.find((item) => isEntryForScreenshot(entry, item));
      return screenshot ? updateEntryFromScreenshot(entry, screenshot) : entry;
    }),
  };

  const hasFailed = screenshotRecord.entries.some((entry) => entry.status === 'failed');
  const hasWarn = screenshotRecord.entries.some((entry) => entry.status === 'warn');
  const hasWaiting = screenshotRecord.entries.some((entry) => entry.status === 'not-captured');
  const hasUnmatched = mappings.some((mapping) => mapping.affectedCheckIds.length === 0);

  const status = hasFailed
    ? 'blocked'
    : hasWarn || hasWaiting || hasUnmatched
      ? 'needs-review'
      : screenshotRecord.entries.length > 0
        ? 'ready'
        : 'not-ready';

  return {
    title: 'Screenshot Result → UI Check Bridge',
    status,
    message: status === 'ready'
      ? 'スクショ結果をUIチェック結果へ反映する準備ができています。'
      : status === 'blocked'
        ? 'failedのスクショ結果があります。UIチェックへfailとして反映されます。'
        : status === 'needs-review'
          ? 'warn / 未撮影 / 未対応の対象があります。確認しながら反映します。'
          : 'スクショ結果がまだありません。',
    screenshotSummary,
    uiSummaryBefore,
    mappings,
    previewRecord,
    safetyNotes: [
      'Phase 10.8ではスクショ撮影を実行しません。',
      '保存済みスクショ結果をUIチェック結果へ写像するだけです。',
      '反映はlocalStorage上のUI Check Result Recordへ保存します。',
      'failedはUI fail、warnはUI warn、capturedはUI pass、not-capturedはuncheckedへ写像します。',
    ],
  };
}

export function formatScreenshotToUiCheckBridge(bridge: ScreenshotToUiCheckBridge): string {
  const uiSummaryAfter = summarizeUiCheckResult(bridge.previewRecord);

  return [
    `# ${bridge.title}`,
    '',
    bridge.message,
    '',
    `- status: ${bridge.status}`,
    `- screenshotStatus: ${bridge.screenshotSummary.status}`,
    `- uiBefore: ${bridge.uiSummaryBefore.status}`,
    `- uiAfterPreview: ${uiSummaryAfter.status}`,
    `- mappedTargets: ${bridge.mappings.length}`,
    '',
    '## Mappings',
    ...bridge.mappings.map((mapping) => [
      `- ${mapping.screenshotLabel}`,
      `  - screenshot: ${mapping.screenshotStatus}`,
      `  - mappedResult: ${mapping.mappedResult}`,
      `  - affected: ${mapping.affectedCheckIds.length}`,
      `  - note: ${mapping.note}`,
    ].join('\n')),
    '',
    '## Safety Notes',
    ...bridge.safetyNotes.map((note) => `- ${note}`),
  ].join('\n');
}
