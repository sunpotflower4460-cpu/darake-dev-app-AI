import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildDarakeFinalFormCompletionReport } from '../utils/darakeFinalFormCompletionReport';

export function DarakeFinalFormCompletionReportPanel() {
  const report = buildDarakeFinalFormCompletionReport('sleep');
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
    <div className="phase41Panel" style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <strong style={{ fontSize: '1rem' }}>{report.title}</strong>
        <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 'auto' }}>Phase {report.phase}</span>
      </div>

      <div
        style={{
          background: report.isFinalFormReady ? '#e8f5e9' : '#fff0f0',
          borderRadius: 16,
          padding: '12px 14px',
          marginBottom: 12,
        }}
      >
        <span style={{ fontWeight: 600 }}>
          {report.isFinalFormReady ? '✅ Final Form 正常動作' : '⚠️ 要確認'}
        </span>
        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 4 }}>ステータス: {report.currentStatus}</div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong style={{ fontSize: '0.85rem' }}>実装済み機能</strong>
        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
          {report.implementedFeatures.map((f, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: '#555' }}>{f}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong style={{ fontSize: '0.85rem' }}>推奨事項</strong>
        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
          {report.recommendations.map((r, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: '#555' }}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="phase41BtnRow">
        <button className="phase41Btn" onClick={handleCopy} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'レポートをコピー'}
        </button>
      </div>
    </div>
  );
}
