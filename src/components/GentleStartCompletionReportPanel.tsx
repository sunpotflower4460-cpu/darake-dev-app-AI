import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildGentleStartCompletionReport } from '../utils/gentleStartCompletionReport';

const report = buildGentleStartCompletionReport();

export function GentleStartCompletionReportPanel() {
  const [copied, setCopied] = useState(false);

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
    <div className="gasCrPanel">
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>
        {report.title}
        <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 8 }}>Phase {report.phase}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{
          padding: '4px 10px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
          background: report.isFormFilled ? '#e8f5e9' : '#fff8e1',
          color: report.isFormFilled ? '#2e7d32' : '#e65100',
        }}>
          フォーム: {report.isFormFilled ? '✅' : '⏳'}
        </span>
        <span style={{
          padding: '4px 10px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
          background: report.isBlueprintReady ? '#e8f5e9' : '#fff8e1',
          color: report.isBlueprintReady ? '#2e7d32' : '#e65100',
        }}>
          設計書: {report.isBlueprintReady ? '✅' : '⏳'}
        </span>
      </div>

      {report.missingItems.length > 0 && (
        <div style={{ background: '#fff8e1', borderRadius: 12, padding: '10px 12px', marginBottom: 10 }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e65100', marginBottom: 4 }}>未対応項目</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {report.missingItems.map((m, i) => <li key={i} style={{ fontSize: '0.85rem', color: '#e65100' }}>{m}</li>)}
          </ul>
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#444', marginBottom: 5 }}>次のおすすめ</div>
      <ul style={{ margin: 0, paddingLeft: 16, marginBottom: 12 }}>
        {report.recommendations.map((r, i) => <li key={i} style={{ fontSize: '0.85rem', color: '#555' }}>{r}</li>)}
      </ul>

      <button className="gasBtnSecondary" onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'auto', padding: '10px 16px' }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'コピー済み' : 'レポートをコピー'}
      </button>
    </div>
  );
}
