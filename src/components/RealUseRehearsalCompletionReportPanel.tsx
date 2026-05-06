import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildRealUseRehearsalCompletionReport } from '../utils/realUseRehearsalCompletionReport';

const report = buildRealUseRehearsalCompletionReport();

const SCORE_LABEL: Record<string, string> = {
  high: '🟢 高い',
  medium: '🟡 やや不足',
  low: '🔴 低い',
};

export function RealUseRehearsalCompletionReportPanel() {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(report.completionMarkdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="phase42Panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <strong style={{ fontSize: '1rem' }}>{report.title}</strong>
        <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 'auto' }}>Phase {report.phase}</span>
      </div>

      <div
        className={`phase42StatusCard ${report.overallDarakeScore === 'high' ? 'darake-success' : report.overallDarakeScore === 'medium' ? 'needs-review' : 'too-much-human-work'}`}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
          だらけ成功度: {SCORE_LABEL[report.overallDarakeScore]}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          {report.scenarioResults.length}シナリオ / 残り手間: {report.frictionRemainingCount}件
        </div>
      </div>

      {report.topPriorityCuts.length > 0 && (
        <>
          <div className="phase42SectionTitle">最優先で削る</div>
          <ul className="phase42List">
            {report.topPriorityCuts.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </>
      )}

      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '10px 12px', marginTop: 12, fontSize: '0.85rem', color: '#444' }}>
        {report.nextRecommendation}
      </div>

      <div className="phase42BtnRow">
        <button className="phase42Btn" onClick={() => setShowDetails((v) => !v)}>
          {showDetails ? '詳細を閉じる' : 'シナリオ別を見る'}
        </button>
        <button className="phase42Btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'レポートをコピー'}
        </button>
      </div>

      {showDetails && (
        <div className="phase42Details">
          {report.scenarioResults.map((r) => (
            <div key={r.scenarioId} style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: '0.85rem' }}>{r.title}</strong>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>状態: {r.status}</div>
              {r.unnecessaryFriction.length > 0 && (
                <ul className="phase42List" style={{ marginTop: 4 }}>
                  {r.unnecessaryFriction.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
