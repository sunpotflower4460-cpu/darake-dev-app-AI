import { useMemo, useState } from 'react';
import { Check, ClipboardCheck, Copy, RefreshCcw } from 'lucide-react';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import type { PreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildUiMachineCheckDraft, formatUiMachineCheckDraft } from '../utils/uiMachineCheckDraft';

export function UiMachineCheckDraftPanel() {
  const [record, setRecord] = useState<PreviewUrlRecord>(() => loadPreviewUrlRecord());
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const screenshotDraft = useMemo(() => buildScreenshotJobDraft(record), [record]);
  const checkDraft = useMemo(() => buildUiMachineCheckDraft(screenshotDraft), [screenshotDraft]);
  const formattedDraft = useMemo(() => formatUiMachineCheckDraft(checkDraft), [checkDraft]);

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
    <div className="uiMachineCheckDraftPanel">
      <div className={`uiMachineHero machine-${checkDraft.status}`}>
        <ClipboardCheck />
        <div>
          <p className="eyebrow">Phase 10.3</p>
          <h3>UI Machine Check Draft</h3>
          <p>{checkDraft.message}</p>
        </div>
      </div>

      <div className="uiMachineSafetyBox">
        <strong>まだ実チェックはしません</strong>
        <p>この段階は、URL・対象件数・表示幅などの事前確認リストを作るだけです。画面取得や画像判定は次以降で扱います。</p>
      </div>

      <div className="uiMachineControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 記録を再読み込み
        </button>
        <button type="button" className={`uiMachineCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'チェック下書きをコピー'}
        </button>
        <span>{checkDraft.status}</span>
      </div>

      <div className="uiMachineSummaryGrid">
        <section>
          <h4>Total</h4>
          <p>{checkDraft.totalChecks}</p>
        </section>
        <section>
          <h4>Pass</h4>
          <p>{checkDraft.passCount}</p>
        </section>
        <section>
          <h4>Warn</h4>
          <p>{checkDraft.warnCount}</p>
        </section>
        <section>
          <h4>Block</h4>
          <p>{checkDraft.blockCount}</p>
        </section>
      </div>

      <div className="uiMachineGlobalBox">
        <div>
          <strong>Global Checks</strong>
          <span>{checkDraft.globalChecks.length} checks</span>
        </div>
        <div className="uiMachineCheckList">
          {checkDraft.globalChecks.map((check) => (
            <article className={`uiMachineCheckItem check-${check.status}`} key={check.id}>
              <div>
                <strong>{check.label}</strong>
                <span>{check.status}</span>
              </div>
              <p>{check.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="uiMachineTargetBox">
        <div>
          <strong>Target Checks</strong>
          <span>{checkDraft.targets.length} targets</span>
        </div>
        <div className="uiMachineTargetList">
          {checkDraft.targets.map((target) => (
            <article className="uiMachineTargetItem" key={target.targetId}>
              <div>
                <strong>{target.label}</strong>
                <span>{target.checks.length} checks</span>
              </div>
              <p>{target.url || 'URL未入力'}</p>
              <div className="uiMachineMiniChecks">
                {target.checks.map((check) => (
                  <span className={`mini-${check.status}`} key={check.id}>{check.label}: {check.status}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="uiMachineNotesBox">
        <div>
          <strong>Next Notes</strong>
          <span>draft only</span>
        </div>
        <ul>
          {checkDraft.nextNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </div>
    </div>
  );
}
