import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, SquareCheck } from 'lucide-react';
import {
  buildUiCheckResultBridge,
  formatUiCheckResultBridge,
} from '../utils/uiCheckResultBridge';

export function UiCheckResultBridgePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const bridge = useMemo(() => buildUiCheckResultBridge(), [reloadKey]);
  const formattedBridge = useMemo(() => formatUiCheckResultBridge(bridge), [bridge]);

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
    <div className="uiCheckResultBridgePanel">
      <div className={`uiCheckResultBridgeHero result-bridge-${bridge.status}`}>
        <SquareCheck />
        <div>
          <p className="eyebrow">Phase 10.29</p>
          <h3>UI Check Result Bridge</h3>
          <p>{bridge.message}</p>
        </div>
      </div>

      <div className="uiCheckResultBridgeSafetyBox">
        <strong>転記サポートのみです</strong>
        <p>UI Check Result Recordへの転記候補をまとめます。AIレビュー結果の自動取り込み・自動保存は行いません。</p>
      </div>

      <div className="uiCheckResultBridgeControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 最新記録を再読み込み
        </button>
        <button type="button" className={`uiCheckResultBridgeCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '転記候補をコピー'}
        </button>
        <span>{bridge.status}</span>
      </div>

      <div className="uiCheckResultBridgeSummaryGrid">
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

      <div className="uiCheckResultBridgeSuggestedBox">
        <div>
          <strong>転記候補 (UI Check Result Record へ)</strong>
          <span>{bridge.suggestedUiCheckResult.status}</span>
        </div>
        <div className="uiCheckResultBridgeSuggestedMeta">
          <p>status: {bridge.suggestedUiCheckResult.status}</p>
          <p>notes: {bridge.suggestedUiCheckResult.notes}</p>
        </div>
        {bridge.suggestedUiCheckResult.checkedItems.length > 0 && (
          <div className="uiCheckResultBridgeCheckSection">
            <h5>チェック済み項目 (pass候補)</h5>
            <ul>
              {bridge.suggestedUiCheckResult.checkedItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
        {bridge.suggestedUiCheckResult.remainingItems.length > 0 && (
          <div className="uiCheckResultBridgeCheckSection">
            <h5>未確認項目</h5>
            <ul>
              {bridge.suggestedUiCheckResult.remainingItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>

      {bridge.blockers.length > 0 && (
        <div className="uiCheckResultBridgeBlockersBox">
          <strong>Blockers</strong>
          <ul>
            {bridge.blockers.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      )}

      {bridge.warnings.length > 0 && (
        <div className="uiCheckResultBridgeWarningsBox">
          <strong>Warnings</strong>
          <ul>
            {bridge.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="uiCheckResultBridgeActionsBox">
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
