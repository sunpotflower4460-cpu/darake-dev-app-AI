import { useState } from 'react';
import { Play, Copy, Check, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  buildAutoProgressSimulation,
  loadAutoProgressSimulations,
  saveAutoProgressSimulations,
  formatAutoProgressSimulationMarkdown,
  summarizeAutoProgressSimulation,
} from '../utils/autoProgressSimulation';
import type {
  AutoProgressSimulation,
  AutoProgressSimulationStep,
  AutoProgressSimulationStepStatus,
} from '../utils/autoProgressSimulation';

type CopyState = 'idle' | 'copied' | 'failed';

const STEP_STATUS_OPTIONS: AutoProgressSimulationStepStatus[] = [
  'would-run', 'would-wait-human', 'would-block', 'would-complete', 'would-record',
];

const STEP_ICON: Record<AutoProgressSimulationStepStatus, string> = {
  'would-run': '▶️',
  'would-wait-human': '⏳',
  'would-block': '🚫',
  'would-complete': '✅',
  'would-record': '📝',
};

export function AutoProgressSimulationPanel() {
  const [sims, setSims] = useState(() => loadAutoProgressSimulations());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // New simulation form
  const [newTitle, setNewTitle] = useState('');
  const [newCandidateId, setNewCandidateId] = useState('');
  const [newSummary, setNewSummary] = useState('');
  // Step form (for expanded sim)
  const [stepLabel, setStepLabel] = useState('');
  const [stepStatus, setStepStatus] = useState<AutoProgressSimulationStepStatus>('would-run');
  const [stepDetail, setStepDetail] = useState('');

  function save(updated: AutoProgressSimulation[]) {
    saveAutoProgressSimulations(updated);
    setSims(updated);
  }

  function handleAddSim() {
    if (!newTitle.trim()) return;
    const sim = buildAutoProgressSimulation({
      title: newTitle.trim(),
      candidateId: newCandidateId.trim() || 'unknown',
      summary: newSummary.trim(),
    });
    save([sim, ...sims]);
    setNewTitle(''); setNewCandidateId(''); setNewSummary('');
  }

  function handleDeleteSim(id: string) {
    save(sims.filter((s) => s.id !== id));
  }

  function handleAddStep(simId: string) {
    if (!stepLabel.trim()) return;
    const step: AutoProgressSimulationStep = {
      id: `step-${crypto.randomUUID()}`,
      label: stepLabel.trim(),
      status: stepStatus,
      detail: stepDetail.trim(),
      expectedOutput: '',
      stopIf: [],
    };
    save(sims.map((s) =>
      s.id === simId ? { ...s, steps: [...s.steps, step] } : s
    ));
    setStepLabel(''); setStepDetail('');
  }

  function handleDeleteStep(simId: string, stepId: string) {
    save(sims.map((s) =>
      s.id === simId
        ? { ...s, steps: s.steps.filter((st) => st.id !== stepId) }
        : s
    ));
  }

  async function handleCopy(text: string, id?: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1800);
      } else {
        setCopyState('copied');
        window.setTimeout(() => setCopyState('idle'), 1800);
      }
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase32Panel">
      <div className="phase32Hero">
        <Play />
        <div>
          <p className="eyebrow">Phase 32.1 / 32.2</p>
          <h3>Auto Progress Simulation</h3>
          <p>OKした場合の流れを事前にシミュレーションします。実行しません。</p>
        </div>
      </div>

      <div className="phase32SafetyBox">
        ⛔ これはシミュレーションです。外部実行・GitHub操作・AI API呼び出しは一切しません。
      </div>

      <div className="phase32Section">
        <h4>新しいシミュレーションを作成</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <input className="phase32Input" placeholder="タイトル *" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <input className="phase32Input" placeholder="candidateId" value={newCandidateId} onChange={(e) => setNewCandidateId(e.target.value)} />
          <textarea className="phase32Textarea" rows={2} placeholder="サマリー" value={newSummary} onChange={(e) => setNewSummary(e.target.value)} />
          <button className="phase32SmallBtn" onClick={handleAddSim}><Plus size={14} /> 作成</button>
        </div>
      </div>

      <div className="phase32SummaryGrid">
        <section><h4>シミュレーション</h4><p>{sims.length}</p></section>
        <section>
          <h4>safe-preview</h4>
          <p>{sims.filter((s) => s.status === 'safe-preview').length}</p>
        </section>
        <section>
          <h4>blocked</h4>
          <p>{sims.filter((s) => s.status === 'blocked').length}</p>
        </section>
      </div>

      {sims.length === 0 && (
        <div className="phase32Section">
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            シミュレーションがありません。上のフォームから作成してください。
          </p>
        </div>
      )}

      {sims.map((sim) => (
        <div key={sim.id} className="phase32SimCard">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4 className="phase32SimTitle">{sim.title}</h4>
            <span className={`phase32StatusBadge ${sim.status}`}>{sim.status}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
            candidateId: {sim.candidateId}
          </p>
          {sim.summary && (
            <p style={{ fontSize: '0.84rem', margin: 0 }}>{sim.summary}</p>
          )}
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
            {summarizeAutoProgressSimulation(sim)}
          </p>

          <div className="phase32BtnRow">
            <button
              className="phase32SmallBtn"
              onClick={() => setExpandedId(expandedId === sim.id ? null : sim.id)}
            >
              {expandedId === sim.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expandedId === sim.id ? '閉じる' : 'ステップを編集'}
            </button>
            <button
              className={`phase32SmallBtn ${copiedId === sim.id ? 'copied' : ''}`}
              onClick={() => void handleCopy(formatAutoProgressSimulationMarkdown(sim), sim.id)}
            >
              {copiedId === sim.id ? <Check size={13} /> : <Copy size={13} />} MDコピー
            </button>
            <button className="phase32SmallBtn" onClick={() => handleDeleteSim(sim.id)} style={{ color: '#992020' }}>
              <Trash2 size={13} /> 削除
            </button>
          </div>

          {expandedId === sim.id && (
            <div style={{ display: 'grid', gap: 12 }}>
              {sim.steps.length > 0 && (
                <ul className="phase32StepList">
                  {sim.steps.map((step, i) => (
                    <li key={step.id} className={`phase32StepItem ${step.status}`}>
                      <span className="phase32StepIcon">{STEP_ICON[step.status]}</span>
                      <div>
                        <p className="phase32StepLabel">{i + 1}. {step.label}</p>
                        {step.detail && (
                          <p className="phase32StepDetail">{step.detail}</p>
                        )}
                        <button
                          className="phase32SmallBtn"
                          style={{ marginTop: 4, fontSize: '0.72rem', padding: '3px 8px', color: '#992020' }}
                          onClick={() => handleDeleteStep(sim.id, step.id)}
                        >
                          <Trash2 size={11} /> 削除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div style={{ display: 'grid', gap: 6 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>ステップを追加</p>
                <input className="phase32Input" placeholder="ラベル *" value={stepLabel} onChange={(e) => setStepLabel(e.target.value)} />
                <select className="phase32Select" value={stepStatus} onChange={(e) => setStepStatus(e.target.value as AutoProgressSimulationStepStatus)}>
                  {STEP_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STEP_ICON[s]} {s}</option>)}
                </select>
                <input className="phase32Input" placeholder="詳細" value={stepDetail} onChange={(e) => setStepDetail(e.target.value)} />
                <button className="phase32SmallBtn" onClick={() => handleAddStep(sim.id)}>
                  <Plus size={13} /> ステップ追加
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {sims.length > 0 && (
        <div className="phase32BtnRow">
          <button
            className={`phase32CopyBtn ${copyState}`}
            onClick={() => void handleCopy(sims.map(formatAutoProgressSimulationMarkdown).join('\n\n---\n\n'))}
          >
            {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} 全MDコピー
          </button>
        </div>
      )}
    </div>
  );
}
