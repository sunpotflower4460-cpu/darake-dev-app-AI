import { useMemo, useState } from 'react';
import { Check, Copy, Image, RefreshCcw, Save, Trash2 } from 'lucide-react';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import type { PreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import {
  buildInitialScreenshotResultRecord,
  clearScreenshotResultRecord,
  formatScreenshotResultRecord,
  loadScreenshotResultRecord,
  saveScreenshotResultRecord,
  summarizeScreenshotResult,
  updateScreenshotResultEntry,
} from '../utils/screenshotResultRecord';
import type { ScreenshotCaptureStatus, ScreenshotResultRecord } from '../utils/screenshotResultRecord';

const statusOptions: ScreenshotCaptureStatus[] = ['not-captured', 'captured', 'warn', 'failed'];

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

function buildFallbackRecord(record: PreviewUrlRecord): ScreenshotResultRecord {
  const screenshotDraft = buildScreenshotJobDraft(record);
  return buildInitialScreenshotResultRecord(screenshotDraft);
}

export function ScreenshotResultRecordPanel() {
  const [previewRecord, setPreviewRecord] = useState<PreviewUrlRecord>(() => loadPreviewUrlRecord());
  const fallbackRecord = useMemo(() => buildFallbackRecord(previewRecord), [previewRecord]);
  const [resultRecord, setResultRecord] = useState<ScreenshotResultRecord>(() => loadScreenshotResultRecord(fallbackRecord));
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const summary = useMemo(() => summarizeScreenshotResult(resultRecord), [resultRecord]);
  const formattedRecord = useMemo(() => formatScreenshotResultRecord(resultRecord), [resultRecord]);

  function handleReload() {
    const nextPreviewRecord = loadPreviewUrlRecord();
    const nextFallback = buildFallbackRecord(nextPreviewRecord);
    setPreviewRecord(nextPreviewRecord);
    setResultRecord(loadScreenshotResultRecord(nextFallback));
    setSaveState('idle');
    setCopyState('idle');
  }

  function handleReset() {
    clearScreenshotResultRecord();
    const nextFallback = buildFallbackRecord(loadPreviewUrlRecord());
    setResultRecord(nextFallback);
    setSaveState('idle');
    setCopyState('idle');
  }

  function handleSave() {
    const next = saveScreenshotResultRecord(resultRecord);
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

  function handleStatus(targetId: string, status: ScreenshotCaptureStatus) {
    setResultRecord((current) => updateScreenshotResultEntry(current, targetId, { status }));
  }

  function handleField(targetId: string, field: 'imagePath' | 'capturedAt' | 'note', value: string) {
    setResultRecord((current) => updateScreenshotResultEntry(current, targetId, { [field]: value }));
  }

  return (
    <div className="screenshotResultRecordPanel">
      <div className={`screenshotResultHero capture-${summary.status}`}>
        <Image />
        <div>
          <p className="eyebrow">Phase 10.7</p>
          <h3>Screenshot Result Record</h3>
          <p>{summary.message}</p>
        </div>
      </div>

      <div className="screenshotResultSafetyBox">
        <strong>撮影結果の受け皿です</strong>
        <p>この段階では、将来のスクショ実行結果を保存する欄だけを作ります。撮影・外部アクセス・画像生成はまだ行いません。</p>
      </div>

      <div className="screenshotResultControls">
        <button type="button" onClick={handleSave}>
          <Save size={16} /> {saveState === 'saved' ? '保存しました' : '結果を保存'}
        </button>
        <button type="button" className="secondaryScreenshotResultButton" onClick={handleReload}>
          <RefreshCcw size={16} /> 記録を再読み込み
        </button>
        <button type="button" className="secondaryScreenshotResultButton" onClick={handleReset}>
          <Trash2 size={16} /> 初期化
        </button>
        <button type="button" className={`screenshotResultCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '結果をコピー'}
        </button>
        <span>保存時刻: {formatSavedAt(resultRecord.savedAt)}</span>
      </div>

      <div className="screenshotResultSummaryGrid">
        <section>
          <h4>Total</h4>
          <p>{summary.total}</p>
        </section>
        <section>
          <h4>Waiting</h4>
          <p>{summary.notCaptured}</p>
        </section>
        <section>
          <h4>Captured</h4>
          <p>{summary.captured}</p>
        </section>
        <section>
          <h4>Warn</h4>
          <p>{summary.warn}</p>
        </section>
        <section>
          <h4>Failed</h4>
          <p>{summary.failed}</p>
        </section>
        <section>
          <h4>Done</h4>
          <p>{summary.completionRate}%</p>
        </section>
      </div>

      <div className="screenshotResultListBox">
        <div>
          <strong>Result Entries</strong>
          <span>{summary.status}</span>
        </div>
        <div className="screenshotResultEntryList">
          {resultRecord.entries.map((entry) => (
            <article className={`screenshotResultEntry capture-${entry.status}`} key={entry.targetId}>
              <div>
                <strong>{entry.label}</strong>
                <span>{entry.viewportWidth} × {entry.viewportHeight}</span>
              </div>
              <p>{entry.url || 'URL未入力'}</p>
              <div className="screenshotResultOptions">
                {statusOptions.map((option) => (
                  <button
                    className={entry.status === option ? 'active' : ''}
                    key={option}
                    type="button"
                    onClick={() => handleStatus(entry.targetId, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <label>
                imagePath
                <input value={entry.imagePath} onChange={(event) => handleField(entry.targetId, 'imagePath', event.target.value)} placeholder="artifacts/screenshot.png" />
              </label>
              <label>
                capturedAt
                <input value={entry.capturedAt} onChange={(event) => handleField(entry.targetId, 'capturedAt', event.target.value)} placeholder="2026-05-05T00:00:00.000Z" />
              </label>
              <label>
                note
                <textarea rows={2} value={entry.note} onChange={(event) => handleField(entry.targetId, 'note', event.target.value)} />
              </label>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
