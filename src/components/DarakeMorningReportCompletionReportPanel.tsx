import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildDarakeMorningReportCompletionReport } from '../utils/darakeMorningReportCompletionReport';

export function DarakeMorningReportCompletionReportPanel() {
  const report = buildDarakeMorningReportCompletionReport('nothing-needed');
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
    <div className="phase40Panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <strong style={{ fontSize: '1rem' }}>{report.title}</strong>
        <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 'auto' }}>Phase {report.phase}</span>
      </div>

      <div
        style={{
          background: report.isMorningReportWorking ? '#e3f2fd' : '#fff0f0',
          borderRadius: 14,
          padding: '12px 14px',
          marginBottom: 12,
        }}
      >
        <span style={{ fontWeight: 600 }}>
          {report.isMorningReportWorking ? '✅ モーニングレポート正常動作' : '⚠️ 要確認'}
        </span>
        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 4 }}>ステータス: {report.currentStatus}</div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong style={{ fontSize: '0.85rem' }}>主な機能</strong>
        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
          {report.keyFeatures.map((f, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: '#555' }}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="phase40BtnRow">
        <button className="phase40Btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'レポートをコピー'}
        </button>
      </div>
    </div>
  );
}
