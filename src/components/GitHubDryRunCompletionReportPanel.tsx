import { useState } from 'react';
import { BarChart2, Copy, Check, RefreshCcw } from 'lucide-react';
import {
  buildGitHubDryRunCompletionReport,
  formatGitHubDryRunCompletionReportMarkdown,
} from '../utils/githubDryRunCompletionReport';
import { loadGitHubExecutionRecords } from '../utils/githubExecutionRecord';

type CopyState = 'idle' | 'copied' | 'failed';

export function GitHubDryRunCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  void reloadKey;
  const executedRecords = loadGitHubExecutionRecords();

  const report = buildGitHubDryRunCompletionReport({
    executedRecords,
    issueCandidates: ['Issue Creation Dry-run パネルで準備した Issue'],
    prCandidates: ['PR Creation Dry-run パネルで準備した PR'],
    workflowDispatchCandidates: ['Workflow Dispatch Dry-run パネルで準備した workflow'],
    mergeCandidates: ['Merge Dry-run Gate パネルで確認した PR'],
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatGitHubDryRunCompletionReportMarkdown(report));
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
          <p className="eyebrow">Phase 27.8</p>
          <h3>GitHub Dry-run Completion Report</h3>
          <p>Phase 27 の GitHub dry-run 状況をまとめます。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ すべて dry-run です。GitHub API は実行しません。
      </div>

      <div className="phase27SummaryGrid">
        <section>
          <h4>Issue候補</h4>
          <p>{report.issueCandidates.length}</p>
        </section>
        <section>
          <h4>PR候補</h4>
          <p>{report.prCandidates.length}</p>
        </section>
        <section>
          <h4>Workflow候補</h4>
          <p>{report.workflowDispatchCandidates.length}</p>
        </section>
        <section>
          <h4>実行済み</h4>
          <p>{executedRecords.length}</p>
        </section>
      </div>

      <div className="phase27Section">
        <h4>次におすすめ</h4>
        <ul className="phase27StepList">
          {report.nextRecommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {executedRecords.length > 0 && (
        <div className="phase27Section">
          <h4>実行済み記録</h4>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
            {executedRecords.map((r) => (
              <li key={r.id} style={{ fontSize: '0.82rem' }}>
                <span className={`phase27StatusBadge ${r.status}`} style={{ marginRight: 8 }}>{r.status}</span>
                {r.title} <span style={{ color: 'var(--muted)' }}>({r.operationType})</span>
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
