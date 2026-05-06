import { useMemo, useState } from 'react';
import { Check, Copy, GitBranch, RefreshCcw } from 'lucide-react';
import {
  buildScreenshotManifestToResultBridge,
  formatScreenshotManifestToResultBridge,
} from '../utils/screenshotManifestToResultBridge';

export function ScreenshotManifestToResultBridgePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const bridge = useMemo(() => buildScreenshotManifestToResultBridge(), [reloadKey]);
  const formattedBridge = useMemo(() => formatScreenshotManifestToResultBridge(bridge), [bridge]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
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
    <div className="manifestToResultBridgePanel">
      <div className={`manifestToResultBridgeHero bridge-status-${bridge.status}`}>
        <GitBranch />
        <div>
          <p className="eyebrow">Phase 10.26</p>
          <h3>Screenshot Manifest → Result Bridge</h3>
          <p>{bridge.message}</p>
        </div>
      </div>

      <div className="manifestToResultBridgeSafetyBox">
        <strong>転記サポートのみです</strong>
        <p>manifest確認記録からScreenshot Result Recordへの転記候補をまとめています。自動保存・artifact取得・画像解析は行いません。</p>
      </div>

      <div className="manifestToResultBridgeControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 最新記録を再読み込み
        </button>
        <button type="button" className={`manifestToResultBridgeCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '転記候補をコピー'}
        </button>
        <span>{bridge.status}</span>
      </div>

      <div className="manifestToResultBridgeSummaryGrid">
        <section>
          <h4>Status</h4>
          <p>{bridge.status}</p>
        </section>
        <section>
          <h4>Blockers</h4>
          <p>{bridge.blockers.length}</p>
        </section>
        <section>
          <h4>Warnings</h4>
          <p>{bridge.warnings.length}</p>
        </section>
      </div>

      <div className="manifestToResultBridgeSourceBox">
        <div>
          <strong>転記元 (Source)</strong>
          <span>manifest record</span>
        </div>
        <ul>
          <li>workflowRunUrl: {bridge.source.workflowRunUrl || '未入力'}</li>
          <li>artifactUrl: {bridge.source.artifactUrl || '未入力'}</li>
          <li>artifactName: {bridge.source.artifactName}</li>
          <li>manifestFileName: {bridge.source.manifestFileName}</li>
          <li>capturedCount: {bridge.source.capturedCount || '未入力'}</li>
          <li>failedCount: {bridge.source.failedCount || '未入力'}</li>
        </ul>
      </div>

      <div className="manifestToResultBridgeSuggestedBox">
        <div>
          <strong>転記候補 (Screenshot Result Record へ)</strong>
          <span>{bridge.suggestedResultRecord.resultStatus}</span>
        </div>
        <ul>
          <li>resultStatus: {bridge.suggestedResultRecord.resultStatus}</li>
          <li>artifactUrl: {bridge.suggestedResultRecord.artifactUrl || '未入力'}</li>
          <li>capturedCount: {bridge.suggestedResultRecord.capturedCount || '未入力'}</li>
          <li>failedCount: {bridge.suggestedResultRecord.failedCount || '未入力'}</li>
          <li>notes: {bridge.suggestedResultRecord.notes || 'なし'}</li>
        </ul>
      </div>

      {bridge.blockers.length > 0 && (
        <div className="manifestToResultBridgeBlockersBox">
          <strong>Blockers</strong>
          <ul>
            {bridge.blockers.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      )}

      {bridge.warnings.length > 0 && (
        <div className="manifestToResultBridgeWarningsBox">
          <strong>Warnings</strong>
          <ul>
            {bridge.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="manifestToResultBridgeActionsBox">
        <div>
          <strong>次にやること</strong>
          <span>{bridge.nextActions.length}件</span>
        </div>
        <ul>
          {bridge.nextActions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
}
