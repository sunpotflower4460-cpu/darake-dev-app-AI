import { useMemo, useState } from 'react';
import { Check, Copy, FileCheck2, RefreshCcw } from 'lucide-react';
import {
  buildPlaywrightSetupWorkflowFileStatus,
  formatPlaywrightSetupWorkflowFileStatus,
} from '../utils/playwrightSetupWorkflowFileStatus';

export function PlaywrightSetupWorkflowFileStatusPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const status = useMemo(() => buildPlaywrightSetupWorkflowFileStatus(), [reloadKey]);
  const formattedStatus = useMemo(() => formatPlaywrightSetupWorkflowFileStatus(status), [status]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedStatus);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="playwrightSetupFilePanel">
      <div className="playwrightSetupFileHero">
        <FileCheck2 />
        <div>
          <p className="eyebrow">Phase 10.19</p>
          <h3>Playwright Setup Workflow File</h3>
          <p>Playwright/Chromium環境確認用のworkflow実ファイルを追加しました。Preview URLは開かず、スクショ撮影も行いません。</p>
        </div>
      </div>

      <div className="playwrightSetupFileSafetyBox">
        <strong>setup確認だけ</strong>
        <p>このworkflowはChromium環境が立つかを確認し、setup report artifactを保存するだけです。画面撮影や外部ワーカー呼び出しはまだありません。</p>
      </div>

      <div className="playwrightSetupFileControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 状態を再表示
        </button>
        <button type="button" className={`playwrightSetupFileCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '状態メモをコピー'}
        </button>
        <span>{status.status}</span>
      </div>

      <div className="playwrightSetupFileSummaryGrid">
        <section>
          <h4>Path</h4>
          <p>{status.workflowPath}</p>
        </section>
        <section>
          <h4>Name</h4>
          <p>{status.workflowName}</p>
        </section>
        <section>
          <h4>Artifact</h4>
          <p>{status.artifact.name}</p>
        </section>
      </div>

      <div className="playwrightSetupFileGrid">
        <section>
          <h4>Inputs</h4>
          {status.dispatchInputs.map((input) => (
            <span key={input.name}>{input.name}{input.defaultValue ? `=${input.defaultValue}` : ''}</span>
          ))}
        </section>
        <section>
          <h4>Guards</h4>
          {status.guards.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Allowed Actions</h4>
          {status.allowedActions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Blocked Actions</h4>
          {status.blockedActions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Artifact</h4>
          <span>{status.artifact.path}</span>
          <span>{status.artifact.schemaVersion}</span>
        </section>
        <section>
          <h4>Next Steps</h4>
          {status.nextSteps.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
