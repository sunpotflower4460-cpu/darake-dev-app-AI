import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildDarakeV1CompletionReport } from '../utils/darakeV1CompletionReport';

const report = buildDarakeV1CompletionReport();

const STATUS_LABEL: Record<string, string> = {
  complete: '✅ ほぼ完成',
  'nearly-complete': '🟡 もう少し',
  'needs-work': '⚠️ 要作業',
};

const STATUS_BG: Record<string, string> = {
  complete: '#f0f9e8',
  'nearly-complete': '#fff8e1',
  'needs-work': '#fff0f0',
};

export function DarakeV1CompletionReportPanel() {
  const [showDetails, setShowDetails] = useState(false);
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
    <div className="phase44Panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <strong style={{ fontSize: '1rem' }}>{report.title}</strong>
        <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 'auto' }}>Phase {report.phase}</span>
      </div>

      <div style={{ background: STATUS_BG[report.overallStatus], borderRadius: 16, padding: '16px', marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
          だらけ管制室 v1 — {STATUS_LABEL[report.overallStatus]}
        </div>
      </div>

      <div style={{ background: '#f0f9e8', borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>できること</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {report.whatCanDo.map((w, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: '#444', marginBottom: 3 }}>{w}</li>
          ))}
        </ul>
      </div>

      {report.remainingItems.length > 0 && (
        <div style={{ background: '#fff8e1', borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6, color: '#e65100' }}>残りの項目</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {report.remainingItems.map((r, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#e65100' }}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="phase44BtnRow">
        <button className="phase44Btn" onClick={() => setShowDetails((v) => !v)}>
          {showDetails ? '閉じる' : 'まだやらないことを見る'}
        </button>
        <button className="phase44Btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'レポートをコピー'}
        </button>
      </div>

      {showDetails && (
        <div style={{ marginTop: 10, background: '#fafafa', borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>まだやらないこと</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {report.whatWontDo.map((w, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#888' }}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
