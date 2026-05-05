import { useMemo, useState } from 'react';
import { Check, ClipboardCheck, Copy, RefreshCcw, Save, Trash2 } from 'lucide-react';
import {
  buildInitialDryRunArtifactCheckRecord,
  clearDryRunArtifactCheckRecord,
  formatDryRunArtifactCheckRecord,
  loadDryRunArtifactCheckRecord,
  saveDryRunArtifactCheckRecord,
  summarizeDryRunArtifactCheckRecord,
} from '../utils/dryRunArtifactCheckRecord';
import type { DryRunArtifactCheckRecord, DryRunArtifactCheckStatus } from '../utils/dryRunArtifactCheckRecord';

const statusOptions: DryRunArtifactCheckStatus[] = ['unchecked', 'success', 'warn', 'failed'];

type ResultField = 'status' | 'schemaVersionResult' | 'runnerModeResult' | 'baseUrlResult' | 'targetsResult';

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

export function DryRunArtifactCheckRecordPanel() {
  const [record, setRecord] = useState<DryRunArtifactCheckRecord>(() => loadDryRunArtifactCheckRecord());
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const summary = useMemo(() => summarizeDryRunArtifactCheckRecord(record), [record]);
  const formattedRecord = useMemo(() => formatDryRunArtifactCheckRecord(record), [record]);

  function updateField<K extends keyof DryRunArtifactCheckRecord>(field: K, value: DryRunArtifactCheckRecord[K]) {
    setRecord((current) => ({ ...current, [field]: value }));
    setSaveState('idle');
  }

  function updateStatus(field: ResultField, value: DryRunArtifactCheckStatus) {
    updateField(field, value as DryRunArtifactCheckRecord[ResultField]);
  }

  function handleSave() {
    const next = saveDryRunArtifactCheckRecord({
      ...record,
      checkedAt: record.checkedAt || new Date().toISOString(),
    });
    setRecord(next);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  }

  function handleReload() {
    setRecord(loadDryRunArtifactCheckRecord());
    setSaveState('idle');
    setCopyState('idle');
  }

  function handleReset() {
    clearDryRunArtifactCheckRecord();
    setRecord(buildInitialDryRunArtifactCheckRecord());
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
    { field: 'status', label: '全体結果', detail: 'artifact確認全体の状態です。' },
    { field: 'schemaVersionResult', label: 'schemaVersion', detail: 'darake-screenshot-plan-v1だったか。' },
    { field: 'runnerModeResult', label: 'runner mode', detail: 'draft-only / shouldRunAutomatically=falseだったか。' },
    { field: 'baseUrlResult', label: 'baseUrl', detail: 'Preview URLが入っていたか。' },
    { field: 'targetsResult', label: 'targets', detail: 'ready targetが入っていたか。' },
  ];

  return (
    <div className="dryRunArtifactRecordPanel">
      <div className={`dryRunArtifactRecordHero record-${summary.status}`}>
        <ClipboardCheck />
        <div>
          <p className="eyebrow">Phase 10.15</p>
          <h3>Artifact Check Record</h3>
          <p>{summary.message}</p>
        </div>
      </div>

      <div className="dryRunArtifactRecordSafetyBox">
        <strong>人間が確認した結果の記録欄です</strong>
        <p>artifactの自動取得・解析・スクショ撮影は行いません。確認した結果だけをlocalStorageに保存します。</p>
      </div>

      <div className="dryRunArtifactRecordControls">
        <button type="button" onClick={handleSave}>
          <Save size={16} /> {saveState === 'saved' ? '保存しました' : '確認結果を保存'}
        </button>
        <button type="button" className="secondaryArtifactRecordButton" onClick={handleReload}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className="secondaryArtifactRecordButton" onClick={handleReset}>
          <Trash2 size={16} /> 初期化
        </button>
        <button type="button" className={`dryRunArtifactRecordCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '確認結果をコピー'}
        </button>
        <span>保存時刻: {formatSavedAt(record.checkedAt)}</span>
      </div>

      <div className="dryRunArtifactRecordSummaryGrid">
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
          <p>{summary.canProceedToCapturePlanning ? 'capture planning OK' : 'hold'}</p>
        </section>
      </div>

      <div className="dryRunArtifactRecordForm">
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

      <div className="dryRunArtifactRecordStatusBox">
        <div>
          <strong>Result Checks</strong>
          <span>{summary.status}</span>
        </div>
        <div className="dryRunArtifactRecordStatusList">
          {statusFields.map((item) => (
            <article className={`artifact-status-${record[item.field]}`} key={item.field}>
              <div>
                <strong>{item.label}</strong>
                <span>{record[item.field]}</span>
              </div>
              <p>{item.detail}</p>
              <div className="dryRunArtifactRecordOptions">
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
