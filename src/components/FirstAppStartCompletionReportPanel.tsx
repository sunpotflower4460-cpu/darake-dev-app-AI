import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildFirstAppStartCompletionReport } from '../utils/firstAppStartCompletionReport';

const report = buildFirstAppStartCompletionReport();

const CHECK_ITEMS: Array<{ key: keyof typeof report; label: string }> = [
  { key: 'onboardingComplete', label: '初回オンボーディング完了' },
  { key: 'formCanStart', label: 'フォーム入力完了' },
  { key: 'ponPackReady', label: 'ぽん開始パック準備OK' },
  { key: 'beginnerFlowReady', label: '初心者導線全体が整っている' },
];

export function FirstAppStartCompletionReportPanel() {
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

      <div style={{ background: report.beginnerFlowReady ? '#e8f5e9' : '#fff8e1', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: report.beginnerFlowReady ? '#2e7d32' : '#e65100' }}>
          {report.beginnerFlowReady ? '✅ 初心者導線が整いました' : '⏳ もう少しです'}
        </div>
      </div>

      {CHECK_ITEMS.map(({ key, label }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#555', padding: '4px 0' }}>
          <span>{(report[key] as boolean) ? '✅' : '⬜'}</span>
          <span>{label}</span>
        </div>
      ))}

      {report.missingItems.length > 0 && (
        <div style={{ background: '#fff8e1', borderRadius: 12, padding: '10px 12px', marginTop: 12 }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e65100', marginBottom: 5 }}>未対応</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {report.missingItems.map((m, i) => <li key={i} style={{ fontSize: '0.85rem', color: '#e65100' }}>{m}</li>)}
          </ul>
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#444', margin: '12px 0 5px' }}>次のおすすめ</div>
      <ul style={{ margin: 0, paddingLeft: 16, marginBottom: 14 }}>
        {report.recommendations.map((r, i) => <li key={i} style={{ fontSize: '0.85rem', color: '#555' }}>{r}</li>)}
      </ul>

      <button className="gasBtnSecondary" onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'auto', padding: '10px 16px' }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'コピー済み' : 'レポートをコピー'}
      </button>
    </div>
  );
}
