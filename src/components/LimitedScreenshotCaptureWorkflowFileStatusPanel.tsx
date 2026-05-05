import { useMemo, useState } from 'react';
import { Camera, Check, Copy, RefreshCcw } from 'lucide-react';
import {
  buildLimitedScreenshotCaptureWorkflowFileStatus,
  formatLimitedScreenshotCaptureWorkflowFileStatus,
} from '../utils/limitedScreenshotCaptureWorkflowFileStatus';

export function LimitedScreenshotCaptureWorkflowFileStatusPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const status = useMemo(() => buildLimitedScreenshotCaptureWorkflowFileStatus(), [reloadKey]);
  const formattedStatus = useMemo(() => formatLimitedScreenshotCaptureWorkflowFileStatus(status), [status]);

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
    <div className="limitedCaptureFilePanel">
      <div className="limitedCaptureFileHero">
        <Camera />
        <div>
          <p className="eyebrow">Phase 10.23</p>
          <h3>Limited Capture Workflow File</h3>
          <p>少数targetだけを手動ゲート付きで撮影するworkflow実ファイルを追加しました。アプリからの自動実行はまだありません。</p>
        </div>
      </div>

      <div className="limitedCaptureFileSafetyBox">
        <strong>手動実行専用です</strong>
        <p>初回はmax_targets=1推奨です。artifactにはスクショ画像が入るため、共有前に必ず中身を確認します。</p>
      </div>

      <div className="limitedCaptureFileControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 状態を再表示
        </button>
        <button type="button" className={`limitedCaptureFileCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '状態メモをコピー'}
        </button>
        <span>{status.status}</span>
      </div>

      <div className="limitedCaptureFileSummaryGrid">
        <section>
          <h4>Workflow</h4>
          <p>{status.workflowPath}</p>
        </section>
        <section>
          <h4>Script</h4>
          <p>{status.scriptPath}</p>
        </section>
        <section>
          <h4>Name</h4>
          <p>{status.workflowName}</p>
        </section>
      </div>

      <div className="limitedCaptureFileGrid">
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
          <h4>Artifacts</h4>
          {status.artifacts.map((artifact) => (
            <span key={artifact.name}>{artifact.name}: {artifact.path}</span>
          ))}
        </section>
        <section>
          <h4>Next Steps</h4>
          {status.nextSteps.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Safety Notes</h4>
          {status.safetyNotes.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
