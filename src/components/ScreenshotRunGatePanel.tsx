import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, ShieldCheck } from 'lucide-react';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildScreenshotPlanExport } from '../utils/screenshotPlanExport';
import { buildScreenshotRunGate, formatScreenshotRunGate } from '../utils/screenshotRunGate';

export function ScreenshotRunGatePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const gate = useMemo(() => {
    const previewRecord = loadPreviewUrlRecord();
    const screenshotDraft = buildScreenshotJobDraft(previewRecord);
    const exportPlan = buildScreenshotPlanExport(screenshotDraft);
    return buildScreenshotRunGate(exportPlan);
  }, [reloadKey]);

  const formattedGate = useMemo(() => formatScreenshotRunGate(gate), [gate]);

  const passCount = gate.checks.filter((item) => item.status === 'pass').length;
  const warnCount = gate.checks.filter((item) => item.status === 'warn').length;
  const blockCount = gate.checks.filter((item) => item.status === 'block').length;

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedGate);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="screenshotRunGatePanel">
      <div className={`screenshotRunGateHero run-gate-${gate.status}`}>
        <ShieldCheck />
        <div>
          <p className="eyebrow">Phase 10.10</p>
          <h3>Screenshot Run Gate</h3>
          <p>{gate.message}</p>
        </div>
      </div>

      <div className="screenshotRunGateSafetyBox">
        <strong>まだ実行しません</strong>
        <p>この段階では、JSON下書きを実行してよい条件を表示するだけです。GitHub Actions、外部ワーカー、スクショ撮影は起動しません。</p>
      </div>

      <div className="screenshotRunGateControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> ゲートを再判定
        </button>
        <button type="button" className={`screenshotRunGateCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'ゲート内容をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'ゲート内容をコピー'}
        </button>
        <span>{gate.status}</span>
      </div>

      <div className="screenshotRunGateSummaryGrid">
        <section>
          <h4>Total</h4>
          <p>{gate.checks.length}</p>
        </section>
        <section>
          <h4>Pass</h4>
          <p>{passCount}</p>
        </section>
        <section>
          <h4>Warn</h4>
          <p>{warnCount}</p>
        </section>
        <section>
          <h4>Block</h4>
          <p>{blockCount}</p>
        </section>
      </div>

      <div className="screenshotRunGateCheckBox">
        <div>
          <strong>Run Checks</strong>
          <span>{gate.checks.length} checks</span>
        </div>
        <div className="screenshotRunGateCheckList">
          {gate.checks.map((item) => (
            <article className={`screenshotRunGateCheckItem gate-check-${item.status}`} key={item.id}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.status}</span>
              </div>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="screenshotRunGateConditionGrid">
        <section>
          <h4>実行してよい条件</h4>
          {gate.allowedConditions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>押してはいけない条件</h4>
          {gate.blockedConditions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Manual Gate Notes</h4>
          {gate.manualGateNotes.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
