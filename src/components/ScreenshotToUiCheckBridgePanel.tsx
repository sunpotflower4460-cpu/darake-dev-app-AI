import { useMemo, useState } from 'react';
import { Check, Copy, GitBranch, RefreshCcw, Save } from 'lucide-react';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import {
  buildInitialScreenshotResultRecord,
  loadScreenshotResultRecord,
} from '../utils/screenshotResultRecord';
import {
  buildScreenshotToUiCheckBridge,
  formatScreenshotToUiCheckBridge,
} from '../utils/screenshotToUiCheckResult';
import { buildUiMachineCheckDraft } from '../utils/uiMachineCheckDraft';
import {
  buildInitialUiCheckResultRecord,
  loadUiCheckResultRecord,
  saveUiCheckResultRecord,
  summarizeUiCheckResult,
} from '../utils/uiCheckResultRecord';

export function ScreenshotToUiCheckBridgePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const bridge = useMemo(() => {
    const previewRecord = loadPreviewUrlRecord();
    const screenshotDraft = buildScreenshotJobDraft(previewRecord);
    const machineDraft = buildUiMachineCheckDraft(screenshotDraft);
    const screenshotFallback = buildInitialScreenshotResultRecord(screenshotDraft);
    const uiFallback = buildInitialUiCheckResultRecord(machineDraft);
    const screenshotRecord = loadScreenshotResultRecord(screenshotFallback);
    const uiRecord = loadUiCheckResultRecord(uiFallback);

    return buildScreenshotToUiCheckBridge(screenshotRecord, uiRecord);
  }, [reloadKey]);

  const uiSummaryAfter = useMemo(() => summarizeUiCheckResult(bridge.previewRecord), [bridge.previewRecord]);
  const formattedBridge = useMemo(() => formatScreenshotToUiCheckBridge(bridge), [bridge]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setSaveState('idle');
    setCopyState('idle');
  }

  function handleApply() {
    saveUiCheckResultRecord(bridge.previewRecord);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedBridge);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="screenshotToUiBridgePanel">
      <div className={`screenshotToUiHero bridge-${bridge.status}`}>
        <GitBranch />
        <div>
          <p className="eyebrow">Phase 10.8</p>
          <h3>Screenshot Result → UI Check</h3>
          <p>{bridge.message}</p>
        </div>
      </div>

      <div className="screenshotToUiSafetyBox">
        <strong>保存済み結果の写像だけです</strong>
        <p>スクショ撮影や外部アクセスは行わず、保存済みのスクショ結果をUIチェック結果へ反映するための橋です。</p>
      </div>

      <div className="screenshotToUiControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 最新結果を再読み込み
        </button>
        <button type="button" onClick={handleApply}>
          <Save size={16} /> {saveState === 'saved' ? 'UIチェックへ保存しました' : 'UIチェックへ反映保存'}
        </button>
        <button type="button" className={`screenshotToUiCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '橋渡し結果をコピー'}
        </button>
        <span>{bridge.status}</span>
      </div>

      <div className="screenshotToUiSummaryGrid">
        <section>
          <h4>Screenshot</h4>
          <p>{bridge.screenshotSummary.status}</p>
        </section>
        <section>
          <h4>UI Before</h4>
          <p>{bridge.uiSummaryBefore.status}</p>
        </section>
        <section>
          <h4>UI After</h4>
          <p>{uiSummaryAfter.status}</p>
        </section>
        <section>
          <h4>Mapped</h4>
          <p>{bridge.mappings.length}</p>
        </section>
        <section>
          <h4>After Pass</h4>
          <p>{uiSummaryAfter.pass}</p>
        </section>
        <section>
          <h4>After Fail</h4>
          <p>{uiSummaryAfter.fail}</p>
        </section>
      </div>

      <div className="screenshotToUiMappingBox">
        <div>
          <strong>Mappings</strong>
          <span>{bridge.mappings.length} targets</span>
        </div>
        <div className="screenshotToUiMappingList">
          {bridge.mappings.map((mapping) => (
            <article className={`screenshotToUiMappingItem mapped-${mapping.mappedResult}`} key={mapping.screenshotTargetId}>
              <div>
                <strong>{mapping.screenshotLabel}</strong>
                <span>{mapping.screenshotStatus} → {mapping.mappedResult}</span>
              </div>
              <p>{mapping.note}</p>
              <small>affected: {mapping.affectedCheckIds.length}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="screenshotToUiNotesBox">
        <div>
          <strong>Safety Notes</strong>
          <span>bridge only</span>
        </div>
        <ul>
          {bridge.safetyNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </div>
    </div>
  );
}
