import { useState } from 'react';
import { BarChart2, Copy, Check, RefreshCcw } from 'lucide-react';
import {
  buildAiReviewLoopCompletionReport,
  formatAiReviewLoopCompletionReportMarkdown,
} from '../utils/aiReviewLoopCompletionReport';
import { loadManualAiReviewSessions } from '../utils/manualAiReviewSession';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiReviewLoopCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  void reloadKey;
  const sessions = loadManualAiReviewSessions();
  const report = buildAiReviewLoopCompletionReport(sessions);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAiReviewLoopCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase27Panel">
      <div className="phase27Hero">
        <BarChart2 />
        <div>
          <p className="eyebrow">Phase 29.5</p>
          <h3>AI Review Loop Completion Report</h3>
          <p>AIレビュー手動ループの状況をまとめます。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ AI API は呼びません。すべて手動コピペのレビューループです。
      </div>

      <div className="phase27SummaryGrid">
        <section><h4>合計</h4><p>{report.sessions.length}</p></section>
        <section><h4>待機中</h4><p>{report.waitingResult.length}</p></section>
        <section><h4>triage済み</h4><p>{report.triaged.length}</p></section>
        <section><h4>CA準備完了</h4><p>{report.cloudAgentReady.length}</p></section>
      </div>

      {report.blockers.length > 0 && (
        <div className="phase27Section">
          <h4>Blockers</h4>
          <ul className="phase27BlockerList">
            {report.blockers.map((b, i) => <li key={i}>⛔ {b}</li>)}
          </ul>
        </div>
      )}

      <div className="phase27Section">
        <h4>Next Actions</h4>
        <ul className="phase27StepList">
          {report.nextActions.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      {report.sessions.length > 0 && (
        <div className="phase27Section">
          <h4>セッション一覧</h4>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 5 }}>
            {report.sessions.map((s) => (
              <li key={s.id} style={{ fontSize: '0.82rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`phase27StatusBadge ${s.status === 'done' ? 'ready-to-copy' : s.status === 'draft' ? 'draft' : 'needs-review'}`}>{s.status}</span>
                <span>{s.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="phase27BtnRow">
        <button className={`phase27CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdown コピー'}
        </button>
        <button className="phase27SmallBtn" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={14} /> 更新
        </button>
      </div>
    </div>
  );
}
