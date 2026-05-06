import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildFirstLaunchCompletionReport } from '../utils/firstLaunchCompletionReport';

const report = buildFirstLaunchCompletionReport();

export function FirstLaunchCompletionReportPanel() {
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
    <div className="flcCrSummary">
      <div className="flcCrTitle">
        {report.title}
        <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 8 }}>Phase {report.phase}</span>
      </div>

      <span className={`flcCrStatusBadge ${report.isCompleted ? 'complete' : 'incomplete'}`}>
        {report.isCompleted ? '✅ 完了' : '⏳ 未完了'}
      </span>

      {report.missingItems.length > 0 && (
        <>
          <div className="flcCrSection">未入力項目</div>
          <ul className="flcCrList">
            {report.missingItems.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </>
      )}

      <div className="flcCrSection">次のおすすめ</div>
      <ul className="flcCrList">
        {report.recommendations.map((r, i) => <li key={i}>{r}</li>)}
      </ul>

      <div style={{ marginTop: 14 }}>
        <button className="flcBtnSecondary" onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'レポートをコピー'}
        </button>
      </div>
    </div>
  );
}
