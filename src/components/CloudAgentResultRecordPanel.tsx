import { useState } from 'react';
import { FileCheck, Copy, Check, Plus, Trash2 } from 'lucide-react';
import {
  buildCloudAgentResultRecord,
  addCloudAgentResultRecord,
  loadCloudAgentResultRecords,
  formatCloudAgentResultRecordMarkdown,
} from '../utils/cloudAgentResultRecord';
import type { CloudAgentResultRecord } from '../utils/cloudAgentResultRecord';
import { loadCloudAgentJobs } from '../utils/cloudAgentJob';

type CopyState = 'idle' | 'copied' | 'failed';

const STATUS_OPTIONS: CloudAgentResultRecord['status'][] = [
  'pr-created', 'ci-passed', 'ci-failed', 'merged', 'failed', 'needs-review',
];

export function CloudAgentResultRecordPanel() {
  const [records, setRecords] = useState(() => loadCloudAgentResultRecords());
  const [jobs] = useState(() => loadCloudAgentJobs());
  const [jobId, setJobId] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [branchName, setBranchName] = useState('');
  const [status, setStatus] = useState<CloudAgentResultRecord['status']>('pr-created');
  const [summary, setSummary] = useState('');
  const [ciNotes, setCiNotes] = useState('');
  const [codeRabbitNotes, setCodeRabbitNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleAdd() {
    const record = buildCloudAgentResultRecord({
      jobId: jobId || '(未入力)',
      prUrl,
      prNumber,
      branchName,
      status,
      summary,
      ciNotes,
      codeRabbitNotes,
      nextAction,
    });
    addCloudAgentResultRecord(record);
    setRecords(loadCloudAgentResultRecords());
    setPrUrl(''); setPrNumber(''); setBranchName(''); setSummary('');
    setCiNotes(''); setCodeRabbitNotes(''); setNextAction('');
  }

  function handleDelete(id: string) {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    try {
      localStorage.setItem('darake.cloudAgentResultRecords.v1', JSON.stringify(updated));
    } catch { /* ignore */ }
  }

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch { /* ignore */ }
  }

  return (
    <div className="phase27Panel">
      <div className="phase27Hero">
        <FileCheck />
        <div>
          <p className="eyebrow">Phase 28.4</p>
          <h3>Cloud Agent Result Record</h3>
          <p>Cloud Agent実行後の結果を記録します。</p>
        </div>
      </div>

      <div className="phase27SummaryGrid">
        <section><h4>合計</h4><p>{records.length}</p></section>
        <section><h4>merged</h4><p>{records.filter((r) => r.status === 'merged').length}</p></section>
        <section><h4>failed</h4><p>{records.filter((r) => r.status === 'failed' || r.status === 'ci-failed').length}</p></section>
      </div>

      <div className="phase27Section">
        <h4>新規結果記録</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <select className="phase27Select" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            <option value="">ジョブを選択…</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} ({j.phaseLabel})</option>)}
          </select>
          {!jobId && <input className="phase27Input" placeholder="job ID（手入力）" value={jobId} onChange={(e) => setJobId(e.target.value)} />}
          <input className="phase27Input" placeholder="PR URL" value={prUrl} onChange={(e) => setPrUrl(e.target.value)} />
          <input className="phase27Input" placeholder="PR 番号" value={prNumber} onChange={(e) => setPrNumber(e.target.value)} />
          <input className="phase27Input" placeholder="branch 名" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
          <select className="phase27Select" value={status} onChange={(e) => setStatus(e.target.value as CloudAgentResultRecord['status'])}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea className="phase27Textarea" rows={2} placeholder="summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <textarea className="phase27Textarea" rows={2} placeholder="CI notes" value={ciNotes} onChange={(e) => setCiNotes(e.target.value)} />
          <textarea className="phase27Textarea" rows={2} placeholder="CodeRabbit notes" value={codeRabbitNotes} onChange={(e) => setCodeRabbitNotes(e.target.value)} />
          <input className="phase27Input" placeholder="next action" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
          <button className="phase27SmallBtn" onClick={handleAdd} style={{ justifySelf: 'start' }}>
            <Plus size={14} /> 追加
          </button>
        </div>
      </div>

      {records.length > 0 && (
        <div className="phase27Section">
          <h4>結果一覧</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            {records.map((r) => (
              <div key={r.id} className="phase27RecordCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ flex: 1, fontSize: '0.88rem' }}>job: {r.jobId}</strong>
                  <span className={`phase27StatusBadge ${r.status}`}>{r.status}</span>
                </div>
                {r.prUrl && <a href={r.prUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{r.prUrl}</a>}
                {r.summary && <p style={{ fontSize: '0.8rem' }}>{r.summary}</p>}
                {r.nextAction && <p style={{ fontSize: '0.8rem', color: '#1e5aaa' }}>→ {r.nextAction}</p>}
                <div className="phase27BtnRow">
                  <button className={`phase27SmallBtn ${copiedId === r.id ? 'copied' : ''}`} onClick={() => void handleCopy(formatCloudAgentResultRecordMarkdown(r), r.id)}>
                    {copiedId === r.id ? <Check size={13} /> : <Copy size={13} />} コピー
                  </button>
                  <button className="phase27SmallBtn" onClick={() => handleDelete(r.id)} style={{ color: '#992020' }}>
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
