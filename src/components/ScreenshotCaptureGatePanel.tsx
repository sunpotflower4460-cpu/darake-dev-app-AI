import { useMemo, useState } from 'react';
import { Camera, Check, Copy, RefreshCcw } from 'lucide-react';
import { loadDryRunArtifactCheckRecord } from '../utils/dryRunArtifactCheckRecord';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildScreenshotPlanExport } from '../utils/screenshotPlanExport';
import { buildScreenshotRunGate } from '../utils/screenshotRunGate';
import { buildScreenshotCaptureGate, formatScreenshotCaptureGate } from '../utils/screenshotCaptureGate';

export function ScreenshotCaptureGatePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const gate = useMemo(() => {
    const artifactRecord = loadDryRunArtifactCheckRecord();
    const previewRecord = loadPreviewUrlRecord();
    const screenshotDraft = buildScreenshotJobDraft(previewRecord);
    const plan = buildScreenshotPlanExport(screenshotDraft);
    const runGate = buildScreenshotRunGate(plan);
    return buildScreenshotCaptureGate(artifactRecord, plan, runGate);
  }, [reloadKey]);

  const formattedGate = useMemo(() => formatScreenshotCaptureGate(gate), [gate]);
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
    <div className="screenshotCaptureGatePanel">
      <div className={`screenshotCaptureGateHero capture-gate-${gate.status}`}>
        <Camera />
        <div>
          <p className="eyebrow">Phase 10.16</p>
          <h3>Screenshot Capture Gate</h3>
          <p>{gate.message}</p>
        </div>
      </div>

      <div className="screenshotCaptureGateSafetyBox">
        <strong>まだ撮影しません</strong>
        <p>この段階では、実スクショ撮影へ進む準備が整っているかを判定するだけです。Playwright起動・workflow dispatch・画像生成は行いません。</p>
      </div>

      <div className="screenshotCaptureGateControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> ゲートを再判定
        </button>
        <button type="button" className={`screenshotCaptureGateCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'ゲート内容をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'ゲート内容をコピー'}
        </button>
        <span>{gate.status}</span>
      </div>

      <div className="screenshotCaptureGateSummaryGrid">
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

      <div className="screenshotCaptureGateCheckBox">
        <div>
          <strong>Capture Readiness Checks</strong>
          <span>{gate.checks.length} checks</span>
        </div>
        <div className="screenshotCaptureGateCheckList">
          {gate.checks.map((item) => (
            <article className={`screenshotCaptureGateCheckItem capture-check-${item.status}`} key={item.id}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.status}</span>
              </div>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="screenshotCaptureGateGrid">
        <section>
          <h4>進んでよい条件</h4>
          {gate.allowedConditions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>止める条件</h4>
          {gate.blockedConditions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>次の行動</h4>
          {gate.nextActions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Safety Notes</h4>
          {gate.safetyNotes.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
