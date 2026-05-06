import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, Github } from 'lucide-react';
import {
  buildGitHubSemiAutomationCompletionReport,
  formatGitHubSemiAutomationCompletionReportMarkdown,
} from '../utils/githubSemiAutomationCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function GitHubSemiAutomationCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildGitHubSemiAutomationCompletionReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatGitHubSemiAutomationCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase20Panel">
      <div className="phase20Hero">
        <Github />
        <div>
          <p className="eyebrow">Phase 20.6</p>
          <h3>GitHub半自動化 完成レポート</h3>
          <p>GitHub操作候補の整備状況を確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ GitHub API自動実行なし・自動merge/dispatch/Issue作成なし</strong>
      </div>

      <div className="phaseSummaryGrid">
        <section>
          <h4>総候補数</h4>
          <p>{report.totalCandidates}</p>
        </section>
        <section>
          <h4>手動ゲート</h4>
          <p>{report.manualGateOperations.length}</p>
        </section>
        <section>
          <h4>ブロック</h4>
          <p>{report.blockedOperations.length}</p>
        </section>
      </div>

      <div className="phaseInfoBox">
        <strong>下書き操作（安全）</strong>
        {report.safeDraftOperations.length > 0 ? (
          <ul>{report.safeDraftOperations.map((o, i) => <li key={i}>✅ {o}</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>手動ゲート操作</strong>
        {report.manualGateOperations.length > 0 ? (
          <ul>{report.manualGateOperations.map((o, i) => <li key={i}>🔶 {o}</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>Workflow ドラフト</strong>
        {report.workflowDrafts.length > 0 ? (
          <ul>{report.workflowDrafts.map((w, i) => <li key={i}>{w}</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      {report.blockedOperations.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>ブロック操作</strong>
          <ul>{report.blockedOperations.map((o, i) => <li key={i}>{o}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>次のおすすめ</strong>
        <ul>{report.nextRecommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
