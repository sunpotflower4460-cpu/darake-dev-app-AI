import { useMemo, useState } from 'react';
import { Check, ClipboardCheck, Copy, RefreshCcw, Save, Trash2 } from 'lucide-react';
import {
  buildInitialPlaywrightSetupReportRecord,
  clearPlaywrightSetupReportRecord,
  formatPlaywrightSetupReportRecord,
  loadPlaywrightSetupReportRecord,
  savePlaywrightSetupReportRecord,
  summarizePlaywrightSetupReportRecord,
} from '../utils/playwrightSetupReportRecord';
import type { PlaywrightSetupReportRecord, PlaywrightSetupReportStatus } from '../utils/playwrightSetupReportRecord';

const statusOptions: PlaywrightSetupReportStatus[] = ['unchecked', 'success', 'warn', 'failed'];

type ResultField = 'status' | 'schemaVersionResult' | 'installResult' | 'openedUrlResult' | 'screenshotResult' | 'browserLaunchResult';

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

export function PlaywrightSetupReportRecordPanel() {
  const [record, setRecord] = useState<PlaywrightSetupReportRecord>(() => loadPlaywrightSetupReportRecord());
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const summary = useMemo(() => summarizePlaywrightSetupReportRecord(record), [record]);
  const formattedRecord = useMemo(() => formatPlaywrightSetupReportRecord(record), [record]);

  function updateField<K extends keyof PlaywrightSetupReportRecord>(field: K, value: PlaywrightSetupReportRecord[K]) {
    setRecord((current) => ({ ...current, [field]: value }));
    setSaveState('idle');
  }

  function updateStatus(field: ResultField, value: PlaywrightSetupReportStatus) {
    updateField(field, value as PlaywrightSetupReportRecord[ResultField]);
  }

  function handleSave() {
    const next = savePlaywrightSetupReportRecord({
      ...record,
      checkedAt: record.checkedAt || new Date().toISOString(),
    });
    setRecord(next);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  }

  function handleReload() {
    setRecord(loadPlaywrightSetupReportRecord());
    setSaveState('idle');
    setCopyState('idle');
  }

  function handleReset() {
    clearPlaywrightSetupReportRecord();
    setRecord(buildInitialPlaywrightSetupReportRecord());
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
    { field: 'status', label: '全体結果', detail: 'setup report確認全体の状態です。' },
    { field: 'schemaVersionResult', label: 'schemaVersion', detail: 'darake-playwright-setup-dry-run-v1だったか。' },
    { field: 'installResult', label: 'Chromium setup', detail: 'Playwright/Chromium installが成功したか。' },
    { field: 'openedUrlResult', label: 'openedUrl=false', detail: 'Preview URLを開いていないことを確認します。' },
    { field: 'screenshotResult', label: 'capturedScreenshot=false', detail: 'スクショ撮影が行われていないことを確認します。' },
    { field: 'browserLaunchResult', label: 'launchedBrowser=false', detail: 'ページ遷移用のブラウザ起動が行われていないことを確認します。' },
  ];

  return (
    <div className="playwrightReportRecordPanel">
      <div className={`playwrightReportRecordHero report-${summary.status}`}>
        <ClipboardCheck />
        <div>
          <p className="eyebrow">Phase 10.21</p>
          <h3>Playwright Setup Report Record</h3>
          <p>{summary.message}</p>
        </div>
      </div>

      <div className="playwrightReportRecordSafetyBox">
        <strong>人間が確認した結果の記録欄です</strong>
        <p>setup reportの自動取得・解析・URLアクセス・スクショ撮影は行いません。確認した結果だけをlocalStorageに保存します。</p>
      </div>

      <div className="playwrightReportRecordControls">
        <button type="button" onClick={handleSave}>
          <Save size={16} /> {saveState === 'saved' ? '保存しました' : '確認結果を保存'}
        </button>
        <button type="button" className="secondaryPlaywrightReportButton" onClick={handleReload}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className="secondaryPlaywrightReportButton" onClick={handleReset}>
          <Trash2 size={16} /> 初期化
        </button>
        <button type="button" className={`playwrightReportCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '確認結果をコピー'}
        </button>
        <span>保存時刻: {formatSavedAt(record.checkedAt)}</span>
      </div>

      <div className="playwrightReportSummaryGrid">
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
          <p>{summary.canProceedToCaptureWorkflow ? 'capture workflow OK' : 'hold'}</p>
        </section>
      </div>

      <div className="playwrightReportRecordForm">
        <label>
          workflowRunUrl
          <input value={record.workflowRunUrl} onChange={(event) => updateField('workflowRunUrl', event.target.value)} placeholder="https://github.com/.../actions/runs/..." />
        </label>
        <label>
          artifactUrl
          <input value={record.artifactUrl} onChange={(event) => updateField('artifactUrl', event.target.value)} placeholder="https://github.com/.../actions/runs/.../artifacts/..." />
        </label>
        <label>
          notes
          <textarea rows={3} value={record.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="確認メモ、気づいたこと、次に見ること" />
        </label>
      </div>

      <div className="playwrightReportStatusBox">
        <div>
          <strong>Report Result Checks</strong>
          <span>{summary.status}</span>
        </div>
        <div className="playwrightReportStatusList">
          {statusFields.map((item) => (
            <article className={`report-status-${record[item.field]}`} key={item.field}>
              <div>
                <strong>{item.label}</strong>
                <span>{record[item.field]}</span>
              </div>
              <p>{item.detail}</p>
              <div className="playwrightReportOptions">
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
