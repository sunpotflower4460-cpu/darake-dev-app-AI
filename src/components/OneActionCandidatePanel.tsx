import { useState } from 'react';
import { Zap, Copy, Check, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  buildOneActionCandidate,
  loadOneActionCandidates,
  saveOneActionCandidates,
  selectBestOneActionCandidate,
  formatOneActionCandidateMarkdown,
} from '../utils/oneActionCandidate';
import type {
  OneActionCandidate,
  OneActionCandidateKind,
} from '../utils/oneActionCandidate';
import {
  loadOneActionDecisionRecords,
  saveOneActionDecisionRecords,
  addOneActionDecisionRecord,
} from '../utils/oneActionDecisionRecord';

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

export function OneActionCandidatePanel() {
  const [candidates, setCandidates] = useState(() => loadOneActionCandidates());
  const [decisions, setDecisions] = useState(() => loadOneActionDecisionRecords());
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<OneActionCandidateKind>('cloud-agent-job');
  const [reason, setReason] = useState('');
  const [copyText, setCopyText] = useState('');
  const [benefit, setBenefit] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stopReason, setStopReason] = useState('');
  const [activeDecisionId, setActiveDecisionId] = useState<string | null>(null);

  const best = selectBestOneActionCandidate(candidates);

  function saveCandidates(updated: OneActionCandidate[]) {
    saveOneActionCandidates(updated);
    setCandidates(updated);
  }

  function handleAdd() {
    if (!title.trim()) return;
    const c = buildOneActionCandidate({
      title: title.trim(),
      kind,
      reason: reason.trim(),
      expectedBenefit: benefit.trim(),
      primaryCopyText: copyText.trim(),
    });
    saveCandidates([c, ...candidates]);
    setTitle(''); setReason(''); setCopyText(''); setBenefit('');
  }

  function handleDelete(id: string) {
    saveCandidates(candidates.filter((c) => c.id !== id));
  }

  function handleDecision(candidateId: string, decision: 'ok' | 'stop' | 'later') {
    if (decision === 'stop' && !stopReason.trim()) {
      setActiveDecisionId(candidateId);
      return;
    }
    const updated = addOneActionDecisionRecord(decisions, {
      candidateId,
      decision,
      reason: decision === 'stop' ? stopReason : '',
      followUpNeeded: decision === 'later',
      notes: '',
    });
    saveOneActionDecisionRecords(updated);
    setDecisions(updated);
    setStopReason('');
    setActiveDecisionId(null);
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
    <div className="phase30Panel">
      <div className="phase30Hero">
        <Zap />
        <div>
          <p className="eyebrow">Phase 30.1 / 30.2</p>
          <h3>今日の1件 — One Action Candidate</h3>
          <p>次にやるべき1件を選んで OK / Stop / Later で判断します。外部実行はしません。</p>
        </div>
      </div>

      <div className="phase30SafetyBox">
        ⛔ OK / Stop / Later は外部実行しません。localStorageに判断記録を保存するだけです。
      </div>

      {best && (
        <div className="phase30CandidateCard featured">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p className="phase30CandidateTitle">👉 {best.title}</p>
            <span className={`phase30StatusBadge ${best.status}`}>{best.status}</span>
            <span className={`phase30PriorityBadge ${best.priority}`}>{best.priority}</span>
            <span className="phase30EffortBadge">{best.estimatedHumanEffort}</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            {best.reason || 'なぜこれか未記入'}
          </p>
          {best.expectedBenefit && (
            <p style={{ fontSize: '0.8rem', color: '#4a1a8a', margin: 0 }}>
              💡 {best.expectedBenefit}
            </p>
          )}

          {best.blockers.length > 0 && (
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Blockers</p>
              <ul className="phase30BlockerList">
                {best.blockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          {best.warnings.length > 0 && (
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Warnings</p>
              <ul className="phase30WarningList">
                {best.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {best.primaryCopyText && (
            <div className="phase30BtnRow">
              <button
                className={`phase30CopyBtn ${copiedId === best.id ? 'copied' : copyState}`}
                onClick={() => void handleCopy(best.primaryCopyText, best.id)}
              >
                {copiedId === best.id ? <Check size={14} /> : <Copy size={14} />}
                コピーする
              </button>
            </div>
          )}

          {activeDecisionId === best.id && (
            <div style={{ display: 'grid', gap: 6 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>止める理由を入力してください</p>
              <input
                className="phase30Input"
                placeholder="理由"
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
              />
              <button className="phase30StopBtn" onClick={() => handleDecision(best.id, 'stop')}>
                確定して止める
              </button>
            </div>
          )}

          <div className="phase30DecisionRow">
            <button className="phase30OkBtn" onClick={() => handleDecision(best.id, 'ok')}>✅ OK</button>
            <button className="phase30LaterBtn" onClick={() => handleDecision(best.id, 'later')}>⏳ あとで</button>
            <button className="phase30StopBtn" onClick={() => {
              setActiveDecisionId(best.id);
              setStopReason('');
            }}>🚫 止める</button>
          </div>
        </div>
      )}

      {candidates.length === 0 && (
        <div className="phase30Section">
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            候補がありません。下のフォームから追加してください。
          </p>
        </div>
      )}

      <div className="phase30SummaryGrid">
        <section><h4>候補</h4><p>{candidates.length}</p></section>
        <section><h4>OK</h4><p>{decisions.filter((d) => d.decision === 'ok').length}</p></section>
        <section><h4>あとで</h4><p>{decisions.filter((d) => d.decision === 'later').length}</p></section>
        <section><h4>止め</h4><p>{decisions.filter((d) => d.decision === 'stop').length}</p></section>
      </div>

      <div className="phase30Section">
        <h4>新しい候補を追加</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <input className="phase30Input" placeholder="タイトル *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="phase30Select" value={kind} onChange={(e) => setKind(e.target.value as OneActionCandidateKind)}>
            {KIND_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input className="phase30Input" placeholder="なぜこれか（reason）" value={reason} onChange={(e) => setReason(e.target.value)} />
          <input className="phase30Input" placeholder="期待効果（benefit）" value={benefit} onChange={(e) => setBenefit(e.target.value)} />
          <textarea className="phase30Textarea" rows={3} placeholder="コピーするテキスト（primaryCopyText）" value={copyText} onChange={(e) => setCopyText(e.target.value)} />
          <div className="phase30BtnRow">
            <button className="phase30SmallBtn" onClick={handleAdd}><Plus size={14} /> 追加</button>
          </div>
        </div>
      </div>

      {candidates.length > 0 && (
        <div className="phase30Section">
          <h4>全候補 ({candidates.length})</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            {candidates.map((c) => (
              <div key={c.id} className="phase30RecordCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ flex: 1, fontSize: '0.85rem' }}>{c.title}</strong>
                  <span className={`phase30StatusBadge ${c.status}`}>{c.status}</span>
                  <span className={`phase30PriorityBadge ${c.priority}`}>{c.priority}</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--muted)', margin: 0 }}>{c.kind}</p>
                <div className="phase30BtnRow">
                  <button className="phase30SmallBtn" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    {expandedId === c.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {expandedId === c.id ? '閉じる' : '詳細'}
                  </button>
                  {c.primaryCopyText && (
                    <button className={`phase30SmallBtn ${copiedId === c.id ? 'copied' : ''}`} onClick={() => void handleCopy(c.primaryCopyText, c.id)}>
                      {copiedId === c.id ? <Check size={13} /> : <Copy size={13} />} コピー
                    </button>
                  )}
                  <button className="phase30SmallBtn" onClick={() => void handleCopy(formatOneActionCandidateMarkdown(c))}>
                    <Copy size={13} /> MD
                  </button>
                  <button className="phase30SmallBtn" onClick={() => handleDelete(c.id)} style={{ color: '#992020' }}>
                    <Trash2 size={13} /> 削除
                  </button>
                </div>
                {expandedId === c.id && (
                  <div style={{ display: 'grid', gap: 6, fontSize: '0.8rem' }}>
                    {c.reason && <p style={{ margin: 0 }}><strong>理由:</strong> {c.reason}</p>}
                    {c.expectedBenefit && <p style={{ margin: 0 }}><strong>効果:</strong> {c.expectedBenefit}</p>}
                    {c.nextIfOk.length > 0 && (
                      <div>
                        <p style={{ fontWeight: 700, margin: '0 0 3px' }}>OKしたら:</p>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {c.nextIfOk.map((n, i) => <li key={i}>{n}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
