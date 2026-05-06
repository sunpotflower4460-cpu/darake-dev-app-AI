import { useState } from 'react';
import { Bot, Copy, Check, Plus, Trash2 } from 'lucide-react';
import {
  buildCloudAgentJob,
  addCloudAgentJob,
  loadCloudAgentJobs,
  formatCloudAgentJobMarkdown,
} from '../utils/cloudAgentJob';
import type { CloudAgentJobStatus } from '../utils/cloudAgentJob';

type CopyState = 'idle' | 'copied' | 'failed';

const STATUS_OPTIONS: CloudAgentJobStatus[] = [
  'draft', 'copied', 'sent-manually', 'running', 'pr-created', 'merged', 'failed', 'needs-retry', 'done',
];

export function CloudAgentJobBuilderPanel() {
  const [jobs, setJobs] = useState(() => loadCloudAgentJobs());
  const [phaseLabel, setPhaseLabel] = useState('');
  const [title, setTitle] = useState('');
  const [targetRepo, setTargetRepo] = useState('');
  const [instruction, setInstruction] = useState('');
  const [expectedPrTitle, setExpectedPrTitle] = useState('');
  const [doneConditions, setDoneConditions] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleAdd() {
    const job = buildCloudAgentJob({
      phaseLabel: phaseLabel || '(未入力)',
      title: title || '(未入力)',
      targetRepo: targetRepo || '(未入力)',
      instruction,
      expectedPrTitle,
      doneConditions: doneConditions.split('\n').map((l) => l.trim()).filter(Boolean),
    });
    addCloudAgentJob(job);
    setJobs(loadCloudAgentJobs());
    setTitle('');
    setInstruction('');
    setExpectedPrTitle('');
    setDoneConditions('');
  }

  function handleDelete(id: string) {
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    try {
      localStorage.setItem('darake.cloudAgentJobs.v1', JSON.stringify(updated));
    } catch { /* ignore */ }
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
    <div className="phase27Panel">
      <div className="phase27Hero">
        <Bot />
        <div>
          <p className="eyebrow">Phase 28.1 / 28.2</p>
          <h3>Cloud Agent Job Builder</h3>
          <p>Cloud Agentへの作業指示書を作ります。自動送信はしません。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ Cloud Agent への自動送信はしません。指示書をコピーして人間が渡してください。
      </div>

      <div className="phase27SummaryGrid">
        <section><h4>合計</h4><p>{jobs.length}</p></section>
        <section><h4>draft</h4><p>{jobs.filter((j) => j.status === 'draft').length}</p></section>
        <section><h4>running</h4><p>{jobs.filter((j) => j.status === 'running' || j.status === 'sent-manually').length}</p></section>
        <section><h4>done</h4><p>{jobs.filter((j) => j.status === 'merged' || j.status === 'done').length}</p></section>
      </div>

      <div className="phase27Section">
        <h4>新規ジョブ作成</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <input className="phase27Input" placeholder="phaseLabel (例: Phase 27)" value={phaseLabel} onChange={(e) => setPhaseLabel(e.target.value)} />
          <input className="phase27Input" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="phase27Input" placeholder="targetRepo (owner/repo)" value={targetRepo} onChange={(e) => setTargetRepo(e.target.value)} />
          <textarea className="phase27Textarea" rows={5} placeholder="Cloud Agent への指示書（Markdown）" value={instruction} onChange={(e) => setInstruction(e.target.value)} />
          <input className="phase27Input" placeholder="expected PR title" value={expectedPrTitle} onChange={(e) => setExpectedPrTitle(e.target.value)} />
          <textarea className="phase27Textarea" rows={3} placeholder="doneConditions（1行1件）" value={doneConditions} onChange={(e) => setDoneConditions(e.target.value)} />
          <div className="phase27BtnRow">
            <button className="phase27SmallBtn" onClick={handleAdd}><Plus size={14} /> 追加</button>
            {instruction && (
              <button className={`phase27SmallBtn ${copyState}`} onClick={() => void handleCopy(instruction)}>
                {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} 指示書コピー
              </button>
            )}
          </div>
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="phase27Section">
          <h4>ジョブ一覧</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            {jobs.map((j) => (
              <div key={j.id} className="phase27RecordCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ flex: 1, fontSize: '0.88rem' }}>{j.title}</strong>
                  <span className={`phase27StatusBadge ${j.status}`}>{j.status}</span>
                </div>
                <p>{j.phaseLabel} · {j.targetRepo}</p>
                {j.instruction && (
                  <div className="phase27CodeBlock" style={{ maxHeight: 120, overflow: 'auto' }}>{j.instruction}</div>
                )}
                <div className="phase27BtnRow">
                  <button className={`phase27SmallBtn ${copiedId === j.id ? 'copied' : ''}`} onClick={() => void handleCopy(formatCloudAgentJobMarkdown(j), j.id)}>
                    {copiedId === j.id ? <Check size={13} /> : <Copy size={13} />} コピー
                  </button>
                  <button className="phase27SmallBtn" onClick={() => handleDelete(j.id)} style={{ color: '#992020' }}>
                    <Trash2 size={13} /> 削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
