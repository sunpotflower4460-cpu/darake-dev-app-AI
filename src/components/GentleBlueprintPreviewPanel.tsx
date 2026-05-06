import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { buildGentleFormToBlueprintBridge } from '../utils/gentleFormToBlueprintBridge';

export function GentleBlueprintPreviewPanel() {
  const [bridge] = useState(() => buildGentleFormToBlueprintBridge());
  const [showPhases, setShowPhases] = useState(false);
  const [copiedAgent, setCopiedAgent] = useState(false);
  const [copiedIssue, setCopiedIssue] = useState(false);

  async function handleCopyAgent() {
    try {
      await navigator.clipboard.writeText(bridge.cloudAgentFirstInstruction);
      setCopiedAgent(true);
      window.setTimeout(() => setCopiedAgent(false), 1800);
    } catch {
      // ignore
    }
  }

  async function handleCopyIssue() {
    try {
      await navigator.clipboard.writeText(`# ${bridge.issueDraftTitle}\n\n${bridge.issueDraftBody}`);
      setCopiedIssue(true);
      window.setTimeout(() => setCopiedIssue(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="gbpPanel">
      <span className="gbpPhaseTag">Phase 46</span>
      <div className="gbpTitle">これで始められます</div>

      <span className={`gbpStatusBadge ${bridge.status}`}>
        {bridge.status === 'ready' ? '✅ 準備OK' : bridge.status === 'needs-review' ? '🔍 確認を' : '🚫 ブロック中'}
      </span>

      {bridge.blockers.length > 0 && (
        <div className="gbpWarnBox">
          {bridge.blockers.map((b, i) => <div key={i}>🚫 {b}</div>)}
        </div>
      )}

      {bridge.warnings.length > 0 && (
        <div className="gbpWarnBox" style={{ background: '#fff8e1', color: '#e65100' }}>
          {bridge.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
        </div>
      )}

      {bridge.status !== 'blocked' && (
        <>
          <div className="gbpCard">
            <div className="gbpCardTitle">アプリ</div>
            <div className="gbpCardValue">{bridge.title}</div>
          </div>

          <div className="gbpCard">
            <div className="gbpCardTitle">最初に作るもの (MVP)</div>
            <ul className="gbpList">
              {bridge.mvpScope.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>

          <div className="gbpCard" style={{ background: '#fff8e1' }}>
            <div className="gbpCardTitle">まだ作らないもの</div>
            <ul className="gbpList">
              {bridge.doNotBuild.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>

          <div className="gbpCard" style={{ background: '#e8f4fd' }}>
            <div className="gbpCardTitle">技術候補</div>
            <div className="gbpCardValue">{bridge.recommendedTechStack}</div>
          </div>

          <button
            className="gasAdvancedToggle"
            onClick={() => setShowPhases((v) => !v)}
            style={{ marginBottom: 14 }}
          >
            {showPhases ? <><ChevronUp size={14} /> Phase候補を閉じる</> : <><ChevronDown size={14} /> Phase候補を見る</>}
          </button>

          {showPhases && (
            <div className="gbpCard">
              <div className="gbpCardTitle">Phase候補</div>
              {bridge.suggestedPhases.map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#333' }}>{p.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#666', margin: '3px 0' }}>{p.purpose}</div>
                  <ul className="gbpList">
                    {p.doneConditions.map((c, j) => <li key={j}>{c}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="gbpBtnRow">
            <button className="gasBtnPrimary" onClick={handleCopyAgent}>
              {copiedAgent ? <><Check size={16} /> コピー済み</> : 'Cloud Agent指示書をコピー'}
            </button>
            <button className="gasBtnSecondary" onClick={handleCopyIssue}>
              {copiedIssue ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> Issue下書きをコピー</>}
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 12, textAlign: 'center' }}>
            次：Cloud Agentにこの指示書を渡します
          </div>
        </>
      )}
    </div>
  );
}
