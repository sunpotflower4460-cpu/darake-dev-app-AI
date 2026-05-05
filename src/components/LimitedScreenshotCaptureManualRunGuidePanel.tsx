import { useMemo, useState } from 'react';
import { Camera, Check, Copy, RefreshCcw } from 'lucide-react';
import {
  buildLimitedScreenshotCaptureManualRunGuide,
  formatLimitedScreenshotCaptureManualRunGuide,
} from '../utils/limitedScreenshotCaptureManualRunGuide';

export function LimitedScreenshotCaptureManualRunGuidePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const guide = useMemo(() => buildLimitedScreenshotCaptureManualRunGuide(), [reloadKey]);
  const formattedGuide = useMemo(() => formatLimitedScreenshotCaptureManualRunGuide(guide), [guide]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedGuide);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="limitedCaptureManualPanel">
      <div className="limitedCaptureManualHero">
        <Camera />
        <div>
          <p className="eyebrow">Phase 10.24</p>
          <h3>Limited Capture Manual Run Guide</h3>
          <p>少数target実撮影workflowをGitHub Actionsで手動実行するための手順カードです。アプリからworkflowは起動しません。</p>
        </div>
      </div>

      <div className="limitedCaptureManualSafetyBox">
        <strong>初回はmax_targets=1推奨</strong>
        <p>このworkflowは実際にPreview URLを開き、スクショartifactを作ります。撮影対象とprivate情報の有無を確認してから手動実行します。</p>
      </div>

      <div className="limitedCaptureManualControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 手順を再表示
        </button>
        <button type="button" className={`limitedCaptureManualCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '手順をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '手順をコピー'}
        </button>
        <span>{guide.status}</span>
      </div>

      <div className="limitedCaptureManualSummaryGrid">
        <section>
          <h4>Workflow</h4>
          <p>{guide.workflowName}</p>
        </section>
        <section>
          <h4>Path</h4>
          <p>{guide.workflowPath}</p>
        </section>
        <section>
          <h4>Hint</h4>
          <p>{guide.actionsPageHint}</p>
        </section>
      </div>

      <div className="limitedCaptureManualStepsBox">
        <div>
          <strong>手動実行ステップ</strong>
          <span>{guide.steps.length} steps</span>
        </div>
        <div className="limitedCaptureManualStepList">
          {guide.steps.map((step, index) => (
            <article className="limitedCaptureManualStepItem" key={step.id}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
                <small>{step.actionLabel}</small>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="limitedCaptureManualGrid">
        <section>
          <h4>入力欄</h4>
          {guide.requiredInputs.map((input) => (
            <span key={input.name}>{input.name}: {input.value}</span>
          ))}
        </section>
        <section>
          <h4>止める条件</h4>
          {guide.stopIf.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>実行前チェック</h4>
          {guide.beforeRunChecks.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>実行後チェック</h4>
          {guide.afterRunChecks.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Artifact Checks</h4>
          {guide.artifactChecks.map((item) => <span key={item.label}>{item.label}: {item.expected}</span>)}
        </section>
        <section>
          <h4>Safety Notes</h4>
          {guide.safetyNotes.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
