import { useMemo, useState } from 'react';
import { Check, Copy, FileCheck2, RefreshCcw } from 'lucide-react';
import {
  buildScreenshotWorkflowFileStatus,
  formatScreenshotWorkflowFileStatus,
} from '../utils/screenshotWorkflowFileStatus';

export function ScreenshotWorkflowFileStatusPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const status = useMemo(() => buildScreenshotWorkflowFileStatus(), [reloadKey]);
  const formattedStatus = useMemo(() => formatScreenshotWorkflowFileStatus(status), [status]);

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
    <div className="screenshotWorkflowFileStatusPanel">
      <div className="screenshotWorkflowFileHero">
        <FileCheck2 />
        <div>
          <p className="eyebrow">Phase 10.12</p>
          <h3>Dry-run Workflow File</h3>
          <p>実ファイルとしてdry-run専用workflowを追加しました。まだスクショ撮影・ブラウザ起動・外部実行は行いません。</p>
        </div>
      </div>

      <div className="screenshotWorkflowFileSafetyBox">
        <strong>実行してもdry-runだけ</strong>
        <p>このworkflowはplan_jsonを検証・表示・artifact保存するだけです。dry_run=falseやmanual gateなしは拒否されます。</p>
      </div>

      <div className="screenshotWorkflowFileControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 状態を再表示
        </button>
        <button type="button" className={`screenshotWorkflowFileCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '状態メモをコピー'}
        </button>
        <span>{status.status}</span>
      </div>

      <div className="screenshotWorkflowFileSummaryGrid">
        <section>
          <h4>Path</h4>
          <p>{status.workflowPath}</p>
        </section>
        <section>
          <h4>Name</h4>
          <p>{status.workflowName}</p>
        </section>
        <section>
          <h4>Status</h4>
          <p>{status.status}</p>
        </section>
      </div>

      <div className="screenshotWorkflowFileGrid">
        <section>
          <h4>Inputs</h4>
          {status.dispatchInputs.map((input) => (
            <span key={input.name}>{input.name}{input.defaultValue ? `=${input.defaultValue}` : ''}</span>
          ))}
        </section>
        <section>
          <h4>Dry-run Guards</h4>
          {status.dryRunGuards.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Blocked Actions</h4>
          {status.blockedActions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Next Steps</h4>
          {status.nextSteps.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
