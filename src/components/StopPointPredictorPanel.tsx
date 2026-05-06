import { useState } from 'react';
import { AlertTriangle, Copy, Check } from 'lucide-react';
import {
  buildStopPointPredictions,
  formatStopPointPredictionsMarkdown,
} from '../utils/stopPointPredictor';
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

export function StopPointPredictorPanel() {
  const [kind, setKind] = useState<OneActionCandidateKind>('cloud-agent-job');
  const [customLabels, setCustomLabels] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const custom = customLabels
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const stopPoints = buildStopPointPredictions(kind, custom);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatStopPointPredictionsMarkdown(stopPoints));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const sevLabel: Record<string, string> = {
    high: '🔴 high',
    medium: '🟡 medium',
    low: '🟢 low',
  };

  return (
    <div className="phase32Panel">
      <div className="phase32Hero">
        <AlertTriangle />
        <div>
          <p className="eyebrow">Phase 32.3</p>
          <h3>Stop Point Predictor</h3>
          <p>どこで止まりそうかを事前に予測します。実行しません。</p>
        </div>
      </div>

      <div className="phase32SafetyBox">
        ⛔ これは予測だけです。外部APIを呼びません。
      </div>

      <div className="phase32Section">
        <h4>候補の種類を選択</h4>
        <select className="phase32Select" value={kind} onChange={(e) => setKind(e.target.value as OneActionCandidateKind)}>
          {KIND_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="phase32Section">
        <h4>カスタム止まり条件（任意）</h4>
        <textarea
          className="phase32Textarea"
          rows={3}
          placeholder="1行1条件で入力（任意）"
          value={customLabels}
          onChange={(e) => setCustomLabels(e.target.value)}
        />
      </div>

      <div className="phase32SummaryGrid">
        <section>
          <h4>🔴 high</h4>
          <p>{stopPoints.filter((s) => s.severity === 'high').length}</p>
        </section>
        <section>
          <h4>🟡 medium</h4>
          <p>{stopPoints.filter((s) => s.severity === 'medium').length}</p>
        </section>
        <section>
          <h4>🟢 low</h4>
          <p>{stopPoints.filter((s) => s.severity === 'low').length}</p>
        </section>
      </div>

      {stopPoints.length === 0 ? (
        <div className="phase32Section">
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            止まりそうな場所はありません。
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {stopPoints.map((sp) => (
            <div key={sp.id} className={`phase32StopPointCard ${sp.severity}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.85rem' }}>{sp.label}</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{sevLabel[sp.severity]}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{sp.reason}</p>
              <p style={{ margin: 0, fontSize: '0.78rem' }}>
                {sp.canAvoidByPreparation ? '✅' : '⏳'} {sp.preparationAction}
              </p>
            </div>
          ))}
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
