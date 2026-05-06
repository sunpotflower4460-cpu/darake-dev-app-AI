import { useState } from 'react';
import { FileCheck, Copy, Check } from 'lucide-react';
import { buildCompletionGoalMap } from '../utils/completionGoalMap';
import { buildShortestDarakePath } from '../utils/shortestDarakePath';
import {
  buildCompletionFirstReport,
  formatCompletionFirstReportMarkdown,
} from '../utils/completionFirstReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function CompletionFirstReportPanel() {
  const [report, setReport] = useState(() => {
    const goalMap = buildCompletionGoalMap();
    const path = buildShortestDarakePath();
    return buildCompletionFirstReport(goalMap, path);
  });
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleRefresh() {
    const goalMap = buildCompletionGoalMap();
    const path = buildShortestDarakePath();
    setReport(buildCompletionFirstReport(goalMap, path));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatCompletionFirstReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase37rPanel">
      <div className="phase37rHero">
        <FileCheck />
        <div>
          <p className="eyebrow">Phase 37.4</p>
          <h3>Completion-first レポート</h3>
          <p>完成条件・進行状況・最短だらけルートをまとめて確認できます。</p>
        </div>
      </div>

      <div className="phase37rSection">
        <h4>完成条件</h4>
        <ul className="phase37rList">
          {report.completionConditions.map((c) => (
            <li key={c}>☐ {c}</li>
          ))}
        </ul>
      </div>

      {report.doneItems.length > 0 && (
        <div className="phase37rSection">
          <h4>✅ 完了済み ({report.doneItems.length}件)</h4>
          <ul className="phase37rList">
            {report.doneItems.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
      )}

      {report.autoProgressItems.length > 0 && (
        <div className="phase37rSection">
          <h4>⚙️ 自動進行可能 ({report.autoProgressItems.length}件)</h4>
          <ul className="phase37rList">
            {report.autoProgressItems.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
      )}

      {report.needsHumanItems.length > 0 && (
        <div className="phase37rSection">
          <h4>👤 人間待ち ({report.needsHumanItems.length}件)</h4>
          <ul className="phase37rList">
            {report.needsHumanItems.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
      )}

      {report.blockedItems.length > 0 && (
        <div className="phase37rSection" style={{ borderColor: 'rgba(220,80,80,0.28)', background: 'rgba(220,80,80,0.05)' }}>
          <h4>🚫 ブロック ({report.blockedItems.length}件)</h4>
          <ul className="phase37rList">
            {report.blockedItems.map((i) => <li key={i} style={{ color: '#8b2020' }}>{i}</li>)}
          </ul>
        </div>
      )}

      <div className="phase37rSection">
        <h4>最短だらけルート</h4>
        <p style={{ margin: 0, fontSize: '0.86rem', color: '#0a5c38', fontWeight: 600 }}>
          {report.shortestDarakePathSummary}
        </p>
      </div>

      <div className="phase37rSection">
        <h4>次におすすめ</h4>
        <p style={{ margin: 0, fontSize: '0.86rem', color: '#0a5c38' }}>
          {report.recommendation}
        </p>
      </div>

      <div className="phase37rBtnRow">
        <button className="phase37rSmallBtn" onClick={handleRefresh}>
          🔄 更新
        </button>
        <button className={`phase37rSmallBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} Markdownコピー
        </button>
      </div>
    </div>
  );
}
