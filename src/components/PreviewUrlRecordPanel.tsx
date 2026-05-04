import { useMemo, useState } from 'react';
import { Check, Copy, Link2, RotateCcw, Save, Trash2 } from 'lucide-react';
import {
  buildPreviewUrlSummary,
  clearPreviewUrlRecord,
  formatPreviewUrlRecord,
  loadPreviewUrlRecord,
  savePreviewUrlRecord,
} from '../utils/previewUrlStore';
import type { PreviewUrlRecord } from '../utils/previewUrlStore';

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

export function PreviewUrlRecordPanel() {
  const [record, setRecord] = useState<PreviewUrlRecord>(() => loadPreviewUrlRecord());
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const summary = useMemo(() => buildPreviewUrlSummary(record), [record]);
  const formattedRecord = useMemo(() => formatPreviewUrlRecord(record), [record]);

  function handleSave() {
    const next = savePreviewUrlRecord(record);
    setRecord(next);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  }

  function handleClear() {
    const next = clearPreviewUrlRecord();
    setRecord(next);
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

  function updateField(field: keyof Pick<PreviewUrlRecord, 'previewUrl' | 'localUrl'>, value: string) {
    setRecord((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="previewUrlRecordPanel">
      <div className="previewUrlHero">
        <Link2 />
        <div>
          <p className="eyebrow">Phase 10.1</p>
          <h3>Preview URL記録</h3>
          <p>スクショ確認へ進む前に、Preview URL・ローカルURL・対象ページ・PC/スマホ幅を保存します。</p>
        </div>
      </div>

      <div className="previewUrlSafetyBox">
        <strong>まだスクショ生成はしません</strong>
        <p>この段階はURLと対象条件の記録だけです。画像生成やレビュー実行は次のPhase以降で扱います。</p>
      </div>

      <div className="previewUrlForm">
        <label>
          Preview URL
          <input
            value={record.previewUrl}
            onChange={(event) => updateField('previewUrl', event.target.value)}
            placeholder="preview url"
          />
        </label>
        <label>
          Local URL
          <input
            value={record.localUrl}
            onChange={(event) => updateField('localUrl', event.target.value)}
            placeholder="local url"
          />
        </label>
      </div>

      <div className="previewUrlActions">
        <button type="button" onClick={handleSave}>
          <Save size={16} /> {saveState === 'saved' ? '保存しました' : '記録を保存'}
        </button>
        <button type="button" className="secondaryPreviewButton" onClick={() => setRecord(loadPreviewUrlRecord())}>
          <RotateCcw size={16} /> 保存済みを再読み込み
        </button>
        <button type="button" className="secondaryPreviewButton" onClick={handleClear}>
          <Trash2 size={16} /> 初期状態へ戻す
        </button>
        <button type="button" className={`previewCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '記録をコピー'}
        </button>
        <span>保存時刻: {formatSavedAt(record.savedAt)}</span>
      </div>

      <div className="previewUrlSummaryBox">
        <div>
          <strong>Record Summary</strong>
          <span>copy-only</span>
        </div>
        <div>
          {summary.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>

      <div className="previewTargetGrid">
        <section>
          <h4>Target Pages</h4>
          <div>
            {record.targetPages.map((page) => (
              <article key={page.id}>
                <strong>{page.label}</strong>
                <span>{page.path}</span>
                <p>{page.note}</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h4>Viewports</h4>
          <div>
            {record.viewports.map((viewport) => (
              <article key={viewport.id}>
                <strong>{viewport.label}</strong>
                <span>{viewport.width} × {viewport.height}</span>
                <p>Phase 10.2以降でスクショ対象サイズとして使います。</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
