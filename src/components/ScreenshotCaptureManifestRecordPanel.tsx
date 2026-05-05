import { useMemo, useState } from 'react';
import { Check, ClipboardCheck, Copy, RefreshCcw, Save, Trash2 } from 'lucide-react';
import {
  buildInitialScreenshotCaptureManifestRecord,
  clearScreenshotCaptureManifestRecord,
  formatScreenshotCaptureManifestRecord,
  loadScreenshotCaptureManifestRecord,
  saveScreenshotCaptureManifestRecord,
  summarizeScreenshotCaptureManifestRecord,
} from '../utils/screenshotCaptureManifestRecord';
import type { ScreenshotCaptureManifestRecord, ScreenshotCaptureManifestRecordStatus } from '../utils/screenshotCaptureManifestRecord';

const statusOptions: ScreenshotCaptureManifestRecordStatus[] = ['unchecked', 'success', 'warn', 'failed'];

type ResultField = 'status' | 'schemaVersionResult' | 'pngResult' | 'capturedCountResult' | 'failedCountResult' | 'privateInfoResult' | 'visualQuickLookResult';

function formatSavedAt(value: string): string {
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

export function ScreenshotCaptureManifestRecordPanel() {
  const [record, setRecord] = useState<ScreenshotCaptureManifestRecord>(() => loadScreenshotCaptureManifestRecord());
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const summary = useMemo(() => summarizeScreenshotCaptureManifestRecord(record), [record]);
  const formattedRecord = useMemo(() => formatScreenshotCaptureManifestRecord(record), [record]);

  function updateField<K extends keyof ScreenshotCaptureManifestRecord>(field: K, value: ScreenshotCaptureManifestRecord[K]) {
    setRecord((current) => ({ ...current, [field]: value }));
    setSaveState('idle');
  }

  function updateStatus(field: ResultField, value: ScreenshotCaptureManifestRecordStatus) {
    updateField(field, value as ScreenshotCaptureManifestRecord[ResultField]);
  }

  function handleSave() {
    const next = saveScreenshotCaptureManifestRecord({
      ...record,
      checkedAt: record.checkedAt || new Date().toISOString(),
    });
    setRecord(next);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  }

  function handleReload() {
    setRecord(loadScreenshotCaptureManifestRecord());
    setSaveState('idle');
    setCopyState('idle');
  }

  function handleReset() {
    clearScreenshotCaptureManifestRecord();
    setRecord(buildInitialScreenshotCaptureManifestRecord());
    setSaveState('idle');
    setCopyState('idle');
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

  const statusFields: Array<{ field: ResultField; label: string; detail: string }> = [
    { field: 'status', label: '全体結果', detail: 'manifestとPNG確認全体の状態です。' },
    { field: 'schemaVersionResult', label: 'schemaVersion', detail: 'darake-screenshot-capture-manifest-v1だったか。' },
    { field: 'pngResult', label: 'PNG存在', detail: 'artifact内にPNG画像が含まれているか。' },
    { field: 'capturedCountResult', label: 'capturedCount', detail: 'capturedCountが1以上か。' },
    { field: 'failedCountResult', label: 'failedCount', detail: 'failedCountが0か。' },
    { field: 'privateInfoResult', label: 'private情報', detail: 'スクショ内に共有したくない情報が写っていないか。' },
    { field: 'visualQuickLookResult', label: '目視ざっくり確認', detail: '真っ白・崩壊・エラー画面などがないか。' },
  ];

  return (
    <div className="captureManifestRecordPanel">
      <div className={`captureManifestRecordHero manifest-${summary.status}`}>
        <ClipboardCheck />
        <div>
          <p className="eyebrow">Phase 10.25</p>
          <h3>Screenshot Capture Manifest Record</h3>
          <p>{summary.message}</p>
        </div>
      </div>

      <div className="captureManifestRecordSafetyBox">
        <strong>人間がmanifestとPNGを確認した結果の記録欄です</strong>
        <p>artifactの自動取得・画像解析はまだ行いません。スクショ画像にはprivate情報が写る可能性があるため、共有前に必ず確認します。</p>
      </div>

      <div className="captureManifestRecordControls">
        <button type="button" onClick={handleSave}>
          <Save size={16} /> {saveState === 'saved' ? '保存しました' : '確認結果を保存'}
        </button>
        <button type="button" className="secondaryCaptureManifestButton" onClick={handleReload}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className="secondaryCaptureManifestButton" onClick={handleReset}>
          <Trash2 size={16} /> 初期化
        </button>
        <button type="button" className={`captureManifestCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '確認結果をコピー'}
        </button>
        <span>保存時刻: {formatSavedAt(record.checkedAt)}</span>
      </div>

      <div className="captureManifestSummaryGrid">
        <section>
          <h4>Status</h4>
          <p>{summary.status}</p>
        </section>
        <section>
          <h4>Success</h4>
          <p>{summary.successCount}</p>
        </section>
        <section>
          <h4>Warn</h4>
          <p>{summary.warnCount}</p>
        </section>
        <section>
          <h4>Failed</h4>
          <p>{summary.failedCount}</p>
        </section>
        <section>
          <h4>Unchecked</h4>
          <p>{summary.uncheckedCount}</p>
        </section>
        <section>
          <h4>Next</h4>
          <p>{summary.canProceedToUiCheck ? 'UI check OK' : 'hold'}</p>
        </section>
      </div>

      <div className="captureManifestRecordForm">
        <label>
          workflowRunUrl
          <input value={record.workflowRunUrl} onChange={(event) => updateField('workflowRunUrl', event.target.value)} placeholder="https://github.com/.../actions/runs/..." />
        </label>
        <label>
          artifactUrl
          <input value={record.artifactUrl} onChange={(event) => updateField('artifactUrl', event.target.value)} placeholder="https://github.com/.../actions/runs/.../artifacts/..." />
        </label>
        <div className="captureManifestRecordCountGrid">
          <label>
            capturedCount
            <input value={record.capturedCount} onChange={(event) => updateField('capturedCount', event.target.value)} placeholder="1" inputMode="numeric" />
          </label>
          <label>
            failedCount
            <input value={record.failedCount} onChange={(event) => updateField('failedCount', event.target.value)} placeholder="0" inputMode="numeric" />
          </label>
        </div>
        <label>
          notes
          <textarea rows={3} value={record.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="スクショの見た目、private情報の有無、次に見ること" />
        </label>
      </div>

      <div className="captureManifestStatusBox">
        <div>
          <strong>Manifest & PNG Result Checks</strong>
          <span>{summary.status}</span>
        </div>
        <div className="captureManifestStatusList">
          {statusFields.map((item) => (
            <article className={`manifest-status-${record[item.field]}`} key={item.field}>
              <div>
                <strong>{item.label}</strong>
                <span>{record[item.field]}</span>
              </div>
              <p>{item.detail}</p>
              <div className="captureManifestOptions">
                {statusOptions.map((option) => (
                  <button
                    className={record[item.field] === option ? 'active' : ''}
                    key={option}
                    type="button"
                    onClick={() => updateStatus(item.field, option)}
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
