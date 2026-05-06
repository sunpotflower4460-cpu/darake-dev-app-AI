import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, Trophy } from 'lucide-react';
import {
  buildAiPreparationCompletionReport,
  formatAiPreparationCompletionReportMarkdown,
} from '../utils/aiPreparationCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiPreparationCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildAiPreparationCompletionReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAiPreparationCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <Trophy />
        <div>
          <p className="eyebrow">Phase 25.7</p>
          <h3>AI Preparation Completion Report</h3>
          <p>Phase 25全体の準備状況を1枚で確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ すべて manual copy / draft-only / human confirmation 前提</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`phase24StatusBadge ${report.status === 'ready-for-manual-ai-use' ? 'safe' : report.status}`}>
          {report.status}
        </span>
      </div>

      <div className="phase24SummaryGrid">
        <section>
          <h4>完了</h4>
          <p>{report.completed.length}</p>
        </section>
        <section>
          <h4>注意</h4>
          <p className={report.warnings.length > 0 ? 'warn' : ''}>{report.warnings.length}</p>
        </section>
        <section>
          <h4>Blockers</h4>
          <p className={report.blockers.length > 0 ? 'warn' : ''}>{report.blockers.length}</p>
        </section>
      </div>

      <div className="phaseInfoBox">
        <strong>完了項目</strong>
        <ul>{report.completed.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>

      <div className="phaseWarningsBox">
        <strong>Warnings</strong>
        <ul>{report.warnings.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>

      {report.blockers.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>Blockers</strong>
          <ul>{report.blockers.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>次におすすめ</strong>
        <p>{report.nextRecommendedPhase}</p>
      </div>

      <div className="phaseInfoBox">
        <strong>Next Actions</strong>
        <ul>{report.nextActions.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
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
