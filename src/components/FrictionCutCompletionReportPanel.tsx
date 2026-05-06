import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildFrictionCutCompletionReport } from '../utils/frictionCutCompletionReport';

const report = buildFrictionCutCompletionReport();

const LEVEL_LABEL: Record<string, string> = {
  high: '🟢 大幅改善',
  medium: '🟡 やや不足',
  low: '🔴 まだ手間あり',
};

export function FrictionCutCompletionReportPanel() {
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
    <div className="phase43Panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <strong style={{ fontSize: '1rem' }}>{report.title}</strong>
        <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 'auto' }}>Phase {report.phase}</span>
      </div>

      <div
        className={`phase43SummaryCard ${report.darakeImprovementLevel === 'high' ? 'ready' : 'needs-review'}`}
      >
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
          だらけ改善度: {LEVEL_LABEL[report.darakeImprovementLevel]}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#555' }}>
          削った手間: {report.cutCount}件 / 安全上残す: {report.safetyKeptCount}件
        </div>
        {report.remainingCount > 0 && (
          <div style={{ fontSize: '0.8rem', color: '#e65100', marginTop: 2 }}>
            まだ高severity手間: {report.remainingCount}件残り
          </div>
        )}
      </div>

      {report.topRemainingFriction.length > 0 && (
        <>
          <div className="phase43SectionTitle">まだ残る手間</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {report.topRemainingFriction.map((f, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#e65100' }}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {report.nextCutCandidates.length > 0 && (
        <>
          <div className="phase43SectionTitle">次に削る候補</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {report.nextCutCandidates.map((c, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#1976d2' }}>{c}</li>
            ))}
          </ul>
        </>
      )}

      <div className="phase43BtnRow">
        <button className="phase43Btn" onClick={() => setShowDetails((v) => !v)}>
          {showDetails ? '閉じる' : '安全上残すものを見る'}
        </button>
        <button className="phase43Btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'レポートをコピー'}
        </button>
      </div>

      {showDetails && (
        <div style={{ marginTop: 10, background: '#fff0f0', borderRadius: 12, padding: '10px 12px' }}>
          <div className="phase43SectionTitle" style={{ color: '#c62828' }}>安全上残す手間</div>
          <pre style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {report.completionMarkdown}
          </pre>
        </div>
      )}
    </div>
  );
}
