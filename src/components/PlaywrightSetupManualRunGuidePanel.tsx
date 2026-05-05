import { useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, RefreshCcw } from 'lucide-react';
import {
  buildPlaywrightSetupManualRunGuide,
  formatPlaywrightSetupManualRunGuide,
} from '../utils/playwrightSetupManualRunGuide';

export function PlaywrightSetupManualRunGuidePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const guide = useMemo(() => buildPlaywrightSetupManualRunGuide(), [reloadKey]);
  const formattedGuide = useMemo(() => formatPlaywrightSetupManualRunGuide(guide), [guide]);

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
    <div className="playwrightManualGuidePanel">
      <div className="playwrightManualHero">
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 10.20</p>
          <h3>Playwright Setup Manual Run Guide</h3>
          <p>GitHub Actions上でPlaywright setup dry-runを手動実行するための手順カードです。アプリからworkflowを起動する機能はありません。</p>
        </div>
      </div>

      <div className="playwrightManualSafetyBox">
        <strong>手動実行だけの案内です</strong>
        <p>どこを押し、confirm_setupに何を入れ、実行後に何を見るかを表示します。URLアクセスやスクショ撮影はまだありません。</p>
      </div>

      <div className="playwrightManualControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 手順を再表示
        </button>
        <button type="button" className={`playwrightManualCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '手順をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '手順をコピー'}
        </button>
        <span>{guide.status}</span>
      </div>

      <div className="playwrightManualSummaryGrid">
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

      <div className="playwrightManualStepsBox">
        <div>
          <strong>手動実行ステップ</strong>
          <span>{guide.steps.length} steps</span>
        </div>
        <div className="playwrightManualStepList">
          {guide.steps.map((step, index) => (
            <article className="playwrightManualStepItem" key={step.id}>
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

      <div className="playwrightManualGrid">
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
