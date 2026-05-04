import { useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, RefreshCcw, Save, Trash2 } from 'lucide-react';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import type { PreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildUiMachineCheckDraft } from '../utils/uiMachineCheckDraft';
import {
  buildInitialUiCheckResultRecord,
  clearUiCheckResultRecord,
  formatUiCheckResultRecord,
  loadUiCheckResultRecord,
  saveUiCheckResultRecord,
  summarizeUiCheckResult,
  updateUiCheckResultEntry,
} from '../utils/uiCheckResultRecord';
import type { UiCheckResultRecord, UiCheckResultValue } from '../utils/uiCheckResultRecord';

const resultOptions: UiCheckResultValue[] = ['unchecked', 'pass', 'warn', 'fail'];

function formatSavedAt(value?: string): string {
  if (!value) return '未保存';

  try {
    return new Intl.DateTimeFormat('ja-JP', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildFallbackRecord(record: PreviewUrlRecord): UiCheckResultRecord {
  const screenshotDraft = buildScreenshotJobDraft(record);
  const checkDraft = buildUiMachineCheckDraft(screenshotDraft);
  return buildInitialUiCheckResultRecord(checkDraft);
}

export function UiCheckResultRecordPanel() {
  const [previewRecord, setPreviewRecord] = useState<PreviewUrlRecord>(() => loadPreviewUrlRecord());
  const fallbackRecord = useMemo(() => buildFallbackRecord(previewRecord), [previewRecord]);
  const [resultRecord, setResultRecord] = useState<UiCheckResultRecord>(() => loadUiCheckResultRecord(fallbackRecord));
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const summary = useMemo(() => summarizeUiCheckResult(resultRecord), [resultRecord]);
  const formattedRecord = useMemo(() => formatUiCheckResultRecord(resultRecord), [resultRecord]);

  function handleReload() {
    const nextPreviewRecord = loadPreviewUrlRecord();
    const nextFallback = buildFallbackRecord(nextPreviewRecord);
    setPreviewRecord(nextPreviewRecord);
    setResultRecord(loadUiCheckResultRecord(nextFallback));
    setSaveState('idle');
    setCopyState('idle');
  }

  function handleReset() {
    clearUiCheckResultRecord();
    const nextFallback = buildFallbackRecord(loadPreviewUrlRecord());
    setResultRecord(nextFallback);
    setSaveState('idle');
    setCopyState('idle');
  }

  function handleSave() {
    const next = saveUiCheckResultRecord(resultRecord);
    setResultRecord(next);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedRecord);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  function handleChange(checkId: string, result: UiCheckResultValue) {
    setResultRecord((current) => updateUiCheckResultEntry(current, checkId, result));
  }

  return (
    <div className="uiCheckResultRecordPanel">
      <div className={`uiCheckResultHero result-${summary.status}`}>
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 10.4</p>
          <h3>UI Check Result Record</h3>
          <p>{summary.message}</p>
        </div>
      </div>

      <div className="uiCheckResultSafetyBox">
        <strong>結果を記録する器です</strong>
        <p>この段階では、チェック結果を保存するだけです。画面取得・画像判定・外部実行はまだ行いません。</p>
      </div>

      <div className="uiCheckResultControls">
        <button type="button" onClick={handleSave}>
          <Save size={16} /> {saveState === 'saved' ? '保存しました' : '結果を保存'}
        </button>
        <button type="button" className="secondaryResultButton" onClick={handleReload}>
          <RefreshCcw size={16} /> 記録を再読み込み
        </button>
        <button type="button" className="secondaryResultButton" onClick={handleReset}>
          <Trash2 size={16} /> 初期化
        </button>
        <button type="button" className={`resultCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '結果をコピー'}
        </button>
        <span>保存時刻: {formatSavedAt(resultRecord.savedAt)}</span>
      </div>

      <div className="uiCheckResultSummaryGrid">
        <section>
          <h4>Total</h4>
          <p>{summary.total}</p>
        </section>
        <section>
          <h4>Unchecked</h4>
          <p>{summary.unchecked}</p>
        </section>
        <section>
          <h4>Pass</h4>
          <p>{summary.pass}</p>
        </section>
        <section>
          <h4>Warn</h4>
          <p>{summary.warn}</p>
        </section>
        <section>
          <h4>Fail</h4>
          <p>{summary.fail}</p>
        </section>
        <section>
          <h4>Done</h4>
          <p>{summary.completionRate}%</p>
        </section>
      </div>

      <div className="uiCheckResultListBox">
        <div>
          <strong>Result Entries</strong>
          <span>{summary.status}</span>
        </div>
        <div className="uiCheckResultEntryList">
          {resultRecord.entries.map((entry) => (
            <article className={`uiCheckResultEntry entry-${entry.result}`} key={entry.checkId}>
              <div>
                <strong>{entry.targetLabel ? `${entry.targetLabel} / ${entry.label}` : entry.label}</strong>
                <span>{entry.scope}</span>
              </div>
              <p>{entry.note}</p>
              <div className="uiCheckResultOptions">
                {resultOptions.map((option) => (
                  <button
                    className={entry.result === option ? 'active' : ''}
                    key={option}
                    type="button"
                    onClick={() => handleChange(entry.checkId, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
