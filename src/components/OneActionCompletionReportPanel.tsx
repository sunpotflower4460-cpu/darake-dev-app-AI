import { useState } from 'react';
import { BarChart2, Copy, Check } from 'lucide-react';
import {
  loadOneActionCandidates,
  selectBestOneActionCandidate,
} from '../utils/oneActionCandidate';
import {
  loadOneActionDecisionRecords,
} from '../utils/oneActionDecisionRecord';
import {
  buildOneActionCompletionReport,
  formatOneActionCompletionReportMarkdown,
} from '../utils/oneActionCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function OneActionCompletionReportPanel() {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const candidates = loadOneActionCandidates();
  const decisions = loadOneActionDecisionRecords();
  const best = selectBestOneActionCandidate(candidates);
  const report = buildOneActionCompletionReport(candidates, decisions, best);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatOneActionCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const statusColor = report.status === 'ready'
    ? '#2a6035'
    : report.status === 'needs-review'
      ? '#8a5e12'
      : '#8b2020';

  return (
    <div className="phase30Panel">
      <div className="phase30Hero">
        <BarChart2 />
        <div>
          <p className="eyebrow">Phase 30.4</p>
          <h3>One Action Completion Report</h3>
          <p>候補と判断記録の状態をまとめます。</p>
        </div>
      </div>

      <div className="phase30Section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0 }}>ステータス</h4>
          <span className={`phase30StatusBadge ${report.status}`} style={{ color: statusColor }}>
            {report.status}
          </span>
        </div>
      </div>

      {report.currentCandidate && (
        <div className="phase30Section">
          <h4>今の候補</h4>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            {report.currentCandidate.title}
            <span style={{ fontSize: '0.76rem', color: 'var(--muted)', marginLeft: 8 }}>
              ({report.currentCandidate.kind})
            </span>
          </p>
        </div>
      )}

      <div className="phase30SummaryGrid">
        <section><h4>完了</h4><p>{report.completed.length}</p></section>
        <section><h4>Blockers</h4><p>{report.blockers.length}</p></section>
        <section><h4>Warnings</h4><p>{report.warnings.length}</p></section>
      </div>

      {report.completed.length > 0 && (
        <div className="phase30Section">
          <h4>完了済み</h4>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.82rem', display: 'grid', gap: 4 }}>
            {report.completed.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {report.blockers.length > 0 && (
        <div className="phase30Section">
          <h4>Blockers</h4>
          <ul className="phase30BlockerList">
            {report.blockers.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="phase30Section">
          <h4>Warnings</h4>
          <ul className="phase30WarningList">
            {report.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {report.nextActions.length > 0 && (
        <div className="phase30Section">
          <h4>次のアクション</h4>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.82rem', display: 'grid', gap: 4 }}>
            {report.nextActions.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}

      <div className="phase30BtnRow">
        <button className={`phase30CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} Markdownコピー
        </button>
      </div>
    </div>
  );
}
