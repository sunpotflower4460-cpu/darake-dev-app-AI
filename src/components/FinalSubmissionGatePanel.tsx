import { useMemo, useState } from 'react';
import { Check, Copy, Lock, RefreshCcw } from 'lucide-react';
import { buildFinalSubmissionGate } from '../utils/finalSubmissionGate';

export function FinalSubmissionGatePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const gate = useMemo(() => buildFinalSubmissionGate(), [reloadKey]);

  function handleReload() {
    setReloadKey((k) => k + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(gate.confirmMemo);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="finalSubmissionGatePanel">
      <div className={`finalSubmissionGateHero finalSubmissionGate-${gate.status}`}>
        <Lock />
        <div>
          <p className="eyebrow">Phase 13.5</p>
          <h3>Submit前 最終ゲート</h3>
          <p>{gate.message}</p>
        </div>
      </div>

      <div className="finalSubmissionGateSafetyBox">
        <strong>🔒 このアプリはSubmit for Reviewを押しません</strong>
        <p>「ここから先は人間」です。最終Submitは必ずApp Store Connect上で人間が行ってください。</p>
      </div>

      <div className="finalSubmissionGateControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`finalSubmissionGateCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '確認メモをコピー'}
        </button>
        <span className={`finalSubmissionGateStatusBadge status-${gate.status}`}>{gate.status}</span>
      </div>

      <div className="finalSubmissionGateSummaryGrid">
        <section><h4>Blockers</h4><p>{gate.blockers.length}</p></section>
        <section><h4>Warnings</h4><p>{gate.warnings.length}</p></section>
        <section><h4>OK項目</h4><p>{gate.readyItems.length}</p></section>
      </div>

      {gate.blockers.length > 0 && (
        <div className="finalSubmissionGateListBox finalSubmissionGateBlockersBox">
          <strong>🔴 Blockers</strong>
          <ul>{gate.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      )}

      {gate.warnings.length > 0 && (
        <div className="finalSubmissionGateListBox finalSubmissionGateWarningsBox">
          <strong>⚠️ Warnings</strong>
          <ul>{gate.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
      )}

      {gate.readyItems.length > 0 && (
        <div className="finalSubmissionGateListBox finalSubmissionGateReadyBox">
          <strong>✅ OK項目</strong>
          <ul>{gate.readyItems.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}

      <div className="finalSubmissionGateManualBox">
        <strong>人間が押すべきもの（このアプリは自動化しません）</strong>
        <ol>
          {gate.manualActions.map((a) => <li key={a}>{a}</li>)}
        </ol>
      </div>
    </div>
  );
}
