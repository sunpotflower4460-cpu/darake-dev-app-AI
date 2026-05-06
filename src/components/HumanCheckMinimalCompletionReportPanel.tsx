import { useState } from 'react';
import { FileCheck, Copy, Check } from 'lucide-react';
import {
  loadHumanCheckMinimalCards,
  summarizeHumanCheckMinimalMode,
} from '../utils/humanCheckMinimalMode';
import {
  loadHumanCheckMinimalSettings,
} from '../utils/humanCheckMinimalSettings';
import {
  loadOneActionDecisionRecords,
  summarizeOneActionDecisionRecords,
} from '../utils/oneActionDecisionRecord';
import {
  buildHumanCheckMinimalCompletionReport,
  formatHumanCheckMinimalCompletionReportMarkdown,
} from '../utils/humanCheckMinimalCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function HumanCheckMinimalCompletionReportPanel() {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const cards = loadHumanCheckMinimalCards();
  const settings = loadHumanCheckMinimalSettings();
  const decisions = loadOneActionDecisionRecords();
  const decisionSummary = summarizeOneActionDecisionRecords(decisions);
  const cardStats = summarizeHumanCheckMinimalMode(cards);

  const report = buildHumanCheckMinimalCompletionReport(cards, settings, {
    ok: decisionSummary.ok,
    stop: decisionSummary.stop,
    later: decisionSummary.later,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        formatHumanCheckMinimalCompletionReportMarkdown(report)
      );
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase31Panel">
      <div className="phase31Hero">
        <FileCheck />
        <div>
          <p className="eyebrow">Phase 31.5</p>
          <h3>Human Check Minimal Completion Report</h3>
          <p>Minimal Mode の稼働状態を確認します。</p>
        </div>
      </div>

      <div className="phase31SummaryGrid">
        <section><h4>minimal mode</h4><p>{report.isMinimalModeAvailable ? '✅' : '❌'}</p></section>
        <section><h4>今日の1件</h4><p>{report.hasOneActionCandidate ? '✅' : '❌'}</p></section>
        <section><h4>OK</h4><p>{report.okCount}</p></section>
        <section><h4>あとで</h4><p>{report.laterCount}</p></section>
        <section><h4>止め</h4><p>{report.stopCount}</p></section>
        <section><h4>隠し詳細</h4><p>{report.hiddenDetailsCount}</p></section>
      </div>

      <div className="phase31Section">
        <h4>カード統計</h4>
        <div style={{ display: 'grid', gap: 4, fontSize: '0.82rem' }}>
          <p style={{ margin: 0 }}>合計: {cardStats.total}</p>
          <p style={{ margin: 0 }}>ready: {cardStats.ready}</p>
          <p style={{ margin: 0 }}>blocked: {cardStats.blocked}</p>
          <p style={{ margin: 0 }}>manual-gate: {cardStats.manualGate}</p>
        </div>
      </div>

      <div className="phase31Section">
        <h4>安全モード</h4>
        <p style={{ margin: 0, fontSize: '0.84rem' }}>
          🔒 {report.safetyMode}
        </p>
      </div>

      {report.nextRecommendations.length > 0 && (
        <div className="phase31Section">
          <h4>次のおすすめ</h4>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.82rem', display: 'grid', gap: 4 }}>
            {report.nextRecommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <div className="phase31BtnRow">
        <button className={`phase31SmallBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} Markdownコピー
        </button>
      </div>
    </div>
  );
}
