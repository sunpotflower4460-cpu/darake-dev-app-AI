import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, ShieldCheck } from 'lucide-react';
import {
  buildUiCheckReadinessGate,
  formatUiCheckReadinessGate,
} from '../utils/uiCheckReadinessGate';

export function UiCheckReadinessGatePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const gate = useMemo(() => buildUiCheckReadinessGate(), [reloadKey]);
  const formattedGate = useMemo(() => formatUiCheckReadinessGate(gate), [gate]);

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
    <div className="uiCheckReadinessGatePanel">
      <div className={`uiCheckReadinessGateHero gate-${gate.status}`}>
        <ShieldCheck />
        <div>
          <p className="eyebrow">Phase 10.27</p>
          <h3>UI Check Readiness Gate</h3>
          <p>{gate.message}</p>
        </div>
      </div>

      <div className="uiCheckReadinessGateSafetyBox">
        <strong>readiness判定のみです</strong>
        <p>複数記録からUIチェックへ進める状態かを判定します。UIチェックの自動実行・画像解析・artifact取得は行いません。</p>
      </div>

      <div className="uiCheckReadinessGateControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 最新記録を再読み込み
        </button>
        <button type="button" className={`uiCheckReadinessGateCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '状態メモをコピー'}
        </button>
        <span>{gate.status}</span>
      </div>

      <div className="uiCheckReadinessGateSummaryGrid">
        <section>
          <h4>Status</h4>
          <p>{gate.status}</p>
        </section>
        <section>
          <h4>Blockers</h4>
          <p>{gate.blockers.length}</p>
        </section>
        <section>
          <h4>Warnings</h4>
          <p>{gate.warnings.length}</p>
        </section>
      </div>

      <div className="uiCheckReadinessGateChecksBox">
        <div>
          <strong>チェック一覧</strong>
          <span>{gate.checks.length}項目</span>
        </div>
        <div className="uiCheckReadinessGateCheckList">
          {gate.checks.map((item) => (
            <article className={`uiCheckReadinessGateCheckItem check-status-${item.status}`} key={item.id}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.status}</span>
              </div>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>

      {gate.blockers.length > 0 && (
        <div className="uiCheckReadinessGateBlockersBox">
          <strong>Blockers</strong>
          <ul>
            {gate.blockers.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      )}

      {gate.warnings.length > 0 && (
        <div className="uiCheckReadinessGateWarningsBox">
          <strong>Warnings</strong>
          <ul>
            {gate.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="uiCheckReadinessGateActionsBox">
        <div>
          <strong>次にやること</strong>
          <span>{gate.readyActions.length}件</span>
        </div>
        <ul>
          {gate.readyActions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
}
