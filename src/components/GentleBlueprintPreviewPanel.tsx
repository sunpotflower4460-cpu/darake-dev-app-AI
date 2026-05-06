import { useEffect, useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildGentleFormToBlueprintBridge } from '../utils/gentleFormToBlueprintBridge';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function GentleBlueprintPreviewPanel() {
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState<'agent' | 'issue' | null>(null);
  const bridge = useMemo(() => buildGentleFormToBlueprintBridge(), [revision]);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  async function copyText(kind: 'agent' | 'issue', text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  }

  const issueText = `# ${bridge.issueDraftTitle}\n\n${bridge.issueDraftBody}`;

  return (
    <div className="gbpPanel">
      <span className="gbpPhaseTag">Phase 46</span>
      <div className="gbpTitle">これで始められます</div>
      <span className={`gbpStatusBadge ${bridge.status}`}>
        {bridge.status === 'ready' ? '✅ 準備OK' : bridge.status === 'needs-review' ? '🔍 確認を' : '🚫 ブロック中'}
      </span>

      {[...bridge.blockers, ...bridge.warnings].length > 0 && (
        <div className="gbpWarnBox">
          {bridge.blockers.map((b) => <div key={b}>🚫 {b}</div>)}
          {bridge.warnings.map((w) => <div key={w}>⚠️ {w}</div>)}
        </div>
      )}

      {bridge.status !== 'blocked' && (
        <>
          <div className="gbpCard">
            <div className="gbpCardTitle">アプリ</div>
            <div className="gbpCardValue">{bridge.title}</div>
          </div>
          <div className="gbpCard">
            <div className="gbpCardTitle">最初に作るもの</div>
            <ul className="gbpList">{bridge.mvpScope.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
          <div className="gbpCard" style={{ background: '#fff8e1' }}>
            <div className="gbpCardTitle">まだ作らないもの</div>
            <ul className="gbpList">{bridge.doNotBuild.map((d) => <li key={d}>{d}</li>)}</ul>
          </div>
          <div className="gbpCard" style={{ background: '#e8f4fd' }}>
            <div className="gbpCardTitle">技術候補</div>
            <div className="gbpCardValue">{bridge.recommendedTechStack}</div>
          </div>
          <div className="gbpBtnRow">
            <button className="gasBtnPrimary" onClick={() => copyText('agent', bridge.cloudAgentFirstInstruction)}>
              {copied === 'agent' ? <><Check size={16} /> コピー済み</> : 'Cloud Agent指示書をコピー'}
            </button>
            <button className="gasBtnSecondary" onClick={() => copyText('issue', issueText)}>
              {copied === 'issue' ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> Issue下書きをコピー</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
