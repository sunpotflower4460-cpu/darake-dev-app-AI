import { useState } from 'react';
import { Lightbulb, Copy, Check, RefreshCcw } from 'lucide-react';
import {
  buildNextPhaseRecommendation,
  formatNextPhaseRecommendationMarkdown,
} from '../utils/nextPhaseRecommendationEngine';
import { loadCloudAgentJobs } from '../utils/cloudAgentJob';

type CopyState = 'idle' | 'copied' | 'failed';

export function NextPhaseRecommendationPanel() {
  const [currentPhase, setCurrentPhase] = useState('Phase 29');
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  void reloadKey;
  const jobs = loadCloudAgentJobs();
  const hasBlockedJobs = jobs.some((j) => j.status === 'failed' || j.status === 'needs-retry');
  const hasRunningJobs = jobs.some((j) => j.status === 'running' || j.status === 'sent-manually');
  const hasDraftJobs = jobs.some((j) => j.status === 'draft' || j.status === 'copied');

  const rec = buildNextPhaseRecommendation({
    hasBlockedJobs,
    hasRunningJobs,
    hasDraftJobs,
    currentPhase,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatNextPhaseRecommendationMarkdown(rec));
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
        <Lightbulb />
        <div>
          <p className="eyebrow">Phase 28.6</p>
          <h3>Next Phase Recommendation</h3>
          <p>今の状態から次に何をCloud Agentへ投げるべきか提案します。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ 自動実行はしません。提案をコピーして人間が判断してください。
      </div>

      <div className="phase27Section">
        <h4>現在のPhase</h4>
        <input className="phase27Input" value={currentPhase} onChange={(e) => setCurrentPhase(e.target.value)} />
      </div>

      <div className="phase27SummaryGrid">
        <section>
          <h4>status</h4>
          <span className={`phase27StatusBadge ${rec.status === 'blocked' ? 'blocked' : rec.status === 'ready' ? 'ready-to-copy' : 'needs-review'}`}>{rec.status}</span>
        </section>
        <section><h4>提案数</h4><p>{rec.recommendations.length}</p></section>
        <section><h4>blockers</h4><p>{rec.blockers.length}</p></section>
      </div>

      {rec.blockers.length > 0 && (
        <div className="phase27Section">
          <h4>Blockers</h4>
          <ul className="phase27BlockerList">
            {rec.blockers.map((b, i) => <li key={i}>⛔ {b}</li>)}
          </ul>
        </div>
      )}

      <div className="phase27Section">
        <h4>Next Phase 提案</h4>
        <div style={{ display: 'grid', gap: 12 }}>
          {rec.recommendations.map((r, i) => (
            <div key={i} className="phase27RecordCard">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ flex: 1 }}>{r.phaseLabel}: {r.title}</strong>
                <span className={`phase27RiskBadge ${r.priority === 'high' ? 'manual-gate' : r.priority === 'medium' ? 'review-needed' : 'safe-draft'}`}>{r.priority}</span>
              </div>
              <p style={{ fontSize: '0.82rem' }}>{r.reason}</p>
              <div className="phase27CodeBlock" style={{ maxHeight: 100, overflow: 'auto' }}>{r.suggestedInstruction}</div>
            </div>
          ))}
        </div>
      </div>

      {rec.manualChoices.length > 0 && (
        <div className="phase27Section">
          <h4>Manual Choices</h4>
          <ul className="phase27StepList">
            {rec.manualChoices.map((c, i) => <li key={i}>{c}</li>)}
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
