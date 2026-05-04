import { useMemo, useState } from 'react';
import { Camera, Check, Copy, RefreshCcw } from 'lucide-react';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import type { PreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft, formatScreenshotJobDraft } from '../utils/screenshotJobDraft';

export function ScreenshotJobDraftPanel() {
  const [record, setRecord] = useState<PreviewUrlRecord>(() => loadPreviewUrlRecord());
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const draft = useMemo(() => buildScreenshotJobDraft(record), [record]);
  const formattedDraft = useMemo(() => formatScreenshotJobDraft(draft), [draft]);

  function handleReload() {
    setRecord(loadPreviewUrlRecord());
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedDraft);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="screenshotJobDraftPanel">
      <div className={`screenshotJobHero screenshot-${draft.status}`}>
        <Camera />
        <div>
          <p className="eyebrow">Phase 10.2</p>
          <h3>Screenshot Job Draft</h3>
          <p>{draft.message}</p>
        </div>
      </div>

      <div className="screenshotJobSafetyBox">
        <strong>この段階は下書きのみ</strong>
        <p>対象ページと表示幅の組み合わせを一覧化します。実行系の処理はまだ入れていません。</p>
      </div>

      <div className="screenshotJobControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 記録を再読み込み
        </button>
        <button type="button" className={`screenshotJobCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '下書きをコピー'}
        </button>
        <span>{draft.status}</span>
      </div>

      <div className="screenshotJobSummaryGrid">
        <section>
          <h4>Base URL</h4>
          <p>{draft.baseUrl || '未入力'}</p>
        </section>
        <section>
          <h4>Total Targets</h4>
          <p>{draft.targetCount}</p>
        </section>
        <section>
          <h4>Ready</h4>
          <p>{draft.readyCount}</p>
        </section>
        <section>
          <h4>Blocked</h4>
          <p>{draft.blockedCount}</p>
        </section>
      </div>

      <div className="screenshotTargetQueueBox">
        <div>
          <strong>Screenshot Target Queue</strong>
          <span>{draft.targets.length} targets</span>
        </div>
        <div className="screenshotTargetList">
          {draft.targets.map((target) => (
            <article className={`screenshotTargetItem target-${target.status}`} key={target.id}>
              <div>
                <strong>{target.label}</strong>
                <span>{target.status}</span>
              </div>
              <p>{target.url || 'URL未入力'}</p>
              <small>{target.viewport.width} × {target.viewport.height} / {target.note}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="screenshotSafetyNotesBox">
        <div>
          <strong>Notes</strong>
          <span>draft only</span>
        </div>
        <ul>
          {draft.safetyNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </div>
    </div>
  );
}
