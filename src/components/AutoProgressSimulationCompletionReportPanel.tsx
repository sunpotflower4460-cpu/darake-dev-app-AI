import { useState } from 'react';
import { Layers, Copy, Check } from 'lucide-react';
import {
  loadAutoProgressSimulations,
} from '../utils/autoProgressSimulation';
import {
  buildStopPointPredictions,
} from '../utils/stopPointPredictor';
import {
  buildAutoProgressSimulationCompletionReport,
  formatAutoProgressSimulationCompletionReportMarkdown,
} from '../utils/autoProgressSimulationCompletionReport';
import type { OneActionCandidateKind } from '../utils/oneActionCandidate';

type CopyState = 'idle' | 'copied' | 'failed';

const KIND_OPTIONS: OneActionCandidateKind[] = [
  'cloud-agent-job',
  'github-issue-dry-run',
  'github-pr-dry-run',
  'workflow-dispatch-dry-run',
  'ai-review-manual',
  'notification-manual',
  'app-store-prep',
  'portfolio-update',
  'template-generate',
  'safety-review',
  'completion-report',
];

export function AutoProgressSimulationCompletionReportPanel() {
  const [kind, setKind] = useState<OneActionCandidateKind>('cloud-agent-job');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const sims = loadAutoProgressSimulations();
  const latestSim = sims[0] ?? null;
  const stopPoints = buildStopPointPredictions(kind);
  const report = buildAutoProgressSimulationCompletionReport(
    latestSim,
    stopPoints,
    null
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        formatAutoProgressSimulationCompletionReportMarkdown(report)
      );
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase32Panel">
      <div className="phase32Hero">
        <Layers />
        <div>
          <p className="eyebrow">Phase 32.5</p>
          <h3>Auto Progress Simulation Completion Report</h3>
          <p>シミュレーション・stop point・forecastの状態をまとめます。</p>
        </div>
      </div>

      <div className="phase32Section">
        <h4>候補の種類（stop point予測用）</h4>
        <select
          className="phase32Select"
          value={kind}
          onChange={(e) => setKind(e.target.value as OneActionCandidateKind)}
        >
          {KIND_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="phase32SummaryGrid">
        <section>
          <h4>simulation</h4>
          <p>{report.isSimulationAvailable ? '✅' : '❌'}</p>
        </section>
        <section>
          <h4>stop points</h4>
          <p>{report.stopPoints.length}</p>
        </section>
        <section>
          <h4>🔴 high</h4>
          <p>{report.stopPoints.filter((s) => s.severity === 'high').length}</p>
        </section>
      </div>

      {latestSim && (
        <div className="phase32Section">
          <h4>最新シミュレーション</h4>
          <p style={{ margin: 0, fontSize: '0.84rem' }}>
            {latestSim.title}
            <span style={{ fontSize: '0.76rem', color: 'var(--muted)', marginLeft: 8 }}>
              ({latestSim.steps.length} ステップ)
            </span>
          </p>
        </div>
      )}

      {report.stopPoints.length > 0 && (
        <div className="phase32Section">
          <h4>予測される止まり場所</h4>
          <div style={{ display: 'grid', gap: 6 }}>
            {report.stopPoints.slice(0, 3).map((sp) => (
              <div key={sp.id} className={`phase32StopPointCard ${sp.severity}`}>
                <strong style={{ fontSize: '0.82rem' }}>{sp.label}</strong>
                <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--muted)' }}>{sp.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.preRunChecklist.length > 0 && (
        <div className="phase32Section">
          <h4>OK前確認チェックリスト</h4>
          <ul className="phase32CheckList">
            {report.preRunChecklist.map((c, i) => <li key={i}>☐ {c}</li>)}
          </ul>
        </div>
      )}

      {report.nextRecommendations.length > 0 && (
        <div className="phase32Section">
          <h4>次のおすすめ</h4>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.82rem', display: 'grid', gap: 4 }}>
            {report.nextRecommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <div className="phase32BtnRow">
        <button className={`phase32CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} Markdownコピー
        </button>
      </div>
    </div>
  );
}
