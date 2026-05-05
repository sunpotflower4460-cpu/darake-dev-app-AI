import { useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, RefreshCcw } from 'lucide-react';
import {
  buildScreenshotWorkflowManualRunGuide,
  formatScreenshotWorkflowManualRunGuide,
} from '../utils/screenshotWorkflowManualRunGuide';

export function ScreenshotWorkflowManualRunGuidePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const guide = useMemo(() => buildScreenshotWorkflowManualRunGuide(), [reloadKey]);
  const formattedGuide = useMemo(() => formatScreenshotWorkflowManualRunGuide(guide), [guide]);

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
    <div className="screenshotManualRunGuidePanel">
      <div className="screenshotManualRunHero">
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 10.13</p>
          <h3>Workflow Manual Run Guide</h3>
          <p>GitHub上でdry-run workflowを手動実行するための手順カードです。アプリからworkflowを起動する機能はまだありません。</p>
        </div>
      </div>

      <div className="screenshotManualRunSafetyBox">
        <strong>手動実行だけの案内です</strong>
        <p>Actions画面でどこを押し、どの入力欄に何を貼るかを表示します。スクショ撮影・外部実行・自動dispatchは行いません。</p>
      </div>

      <div className="screenshotManualRunControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 手順を再表示
        </button>
        <button type="button" className={`screenshotManualRunCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '手順をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '手順をコピー'}
        </button>
        <span>{guide.status}</span>
      </div>

      <div className="screenshotManualRunSummaryGrid">
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

      <div className="screenshotManualRunStepsBox">
        <div>
          <strong>手動実行ステップ</strong>
          <span>{guide.steps.length} steps</span>
        </div>
        <div className="screenshotManualRunStepList">
          {guide.steps.map((step, index) => (
            <article className="screenshotManualRunStepItem" key={step.id}>
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

      <div className="screenshotManualRunGrid">
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
          <h4>Safety Notes</h4>
          {guide.safetyNotes.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
