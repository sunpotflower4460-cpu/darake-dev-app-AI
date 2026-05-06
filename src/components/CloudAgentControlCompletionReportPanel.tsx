import { useState } from 'react';
import { BarChart2, Copy, Check, RefreshCcw } from 'lucide-react';
import {
  buildCloudAgentControlCompletionReport,
  formatCloudAgentControlCompletionReportMarkdown,
} from '../utils/cloudAgentControlCompletionReport';
import { loadCloudAgentJobs } from '../utils/cloudAgentJob';
import { loadCloudAgentResultRecords } from '../utils/cloudAgentResultRecord';

type CopyState = 'idle' | 'copied' | 'failed';

export function CloudAgentControlCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  void reloadKey;
  const jobs = loadCloudAgentJobs();
  const resultRecords = loadCloudAgentResultRecords();
  const report = buildCloudAgentControlCompletionReport({ jobs, resultRecords });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatCloudAgentControlCompletionReportMarkdown(report));
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
          <p className="eyebrow">Phase 28.7</p>
          <h3>Cloud Agent Control Completion Report</h3>
          <p>Cloud Agent の作業状況をまとめます。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ すべて dry-run / 手動管理です。自動実行はしません。
      </div>

      <div className="phase27SummaryGrid">
        <section><h4>draft</h4><p>{report.draftJobs.length}</p></section>
        <section><h4>running</h4><p>{report.runningJobs.length}</p></section>
        <section><h4>merged</h4><p>{report.mergedJobs.length}</p></section>
        <section><h4>failed</h4><p>{report.failedJobs.length}</p></section>
      </div>

      <div className="phase27Section">
        <h4>🎯 今日やるべき1件</h4>
        {report.todayTopJob ? (
          <div className="phase27RecordCard">
            <strong>{report.todayTopJob.title}</strong>
            <p>{report.todayTopJob.phaseLabel} · <span className={`phase27StatusBadge ${report.todayTopJob.status}`}>{report.todayTopJob.status}</span></p>
          </div>
        ) : (
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>該当なし。新しいジョブを作成してください。</p>
        )}
      </div>

      {report.retryRecommendations.length > 0 && (
        <div className="phase27Section">
          <h4>Retry 候補</h4>
          <ul className="phase27BlockerList">
            {report.retryRecommendations.map((r, i) => <li key={i}>⛔ {r}</li>)}
          </ul>
        </div>
      )}

      <div className="phase27Section">
        <h4>Next Phase 候補</h4>
        <ul className="phase27StepList">
          {report.nextPhaseRecommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

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
