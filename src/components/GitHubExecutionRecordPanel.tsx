import { useState } from 'react';
import { ClipboardList, Copy, Check, Plus, Trash2 } from 'lucide-react';
import {
  buildGitHubExecutionRecord,
  addGitHubExecutionRecord,
  loadGitHubExecutionRecords,
  formatGitHubExecutionRecordMarkdown,
} from '../utils/githubExecutionRecord';
import type { GitHubDryRunOperationType } from '../utils/githubDryRunOperation';
import type { GitHubExecutionRecordStatus } from '../utils/githubExecutionRecord';

type CopyState = 'idle' | 'copied' | 'failed';

const OP_TYPES: GitHubDryRunOperationType[] = [
  'create-issue', 'create-pr', 'dispatch-workflow', 'merge-pr',
  'comment-pr', 'create-branch', 'create-release', 'close-issue',
];

const STATUS_OPTIONS: GitHubExecutionRecordStatus[] = [
  'draft', 'executed-manually', 'skipped', 'failed', 'needs-follow-up',
];

export function GitHubExecutionRecordPanel() {
  const [records, setRecords] = useState(() => loadGitHubExecutionRecords());
  const [opType, setOpType] = useState<GitHubDryRunOperationType>('create-issue');
  const [title, setTitle] = useState('');
  const [targetRepo, setTargetRepo] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [status, setStatus] = useState<GitHubExecutionRecordStatus>('executed-manually');
  const [notes, setNotes] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleAdd() {
    const record = buildGitHubExecutionRecord({
      operationType: opType,
      title: title || '(未入力)',
      targetRepo: targetRepo || '(未入力)',
      resultUrl,
      status,
      notes,
    });
    addGitHubExecutionRecord(record);
    setRecords(loadGitHubExecutionRecords());
    setTitle('');
    setResultUrl('');
    setNotes('');
  }

  function handleDelete(id: string) {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    try {
      localStorage.setItem('darake.githubExecutionRecords.v1', JSON.stringify(updated));
    } catch { /* ignore */ }
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
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
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 27.7</p>
          <h3>GitHub Execution Record</h3>
          <p>人間がGitHub操作した結果を記録します。</p>
        </div>
      </div>

      <div className="phase27SummaryGrid">
        <section>
          <h4>合計</h4>
          <p>{records.length}</p>
        </section>
        <section>
          <h4>実行済み</h4>
          <p>{records.filter((r) => r.status === 'executed-manually').length}</p>
        </section>
        <section>
          <h4>要フォロー</h4>
          <p>{records.filter((r) => r.followUpNeeded).length}</p>
        </section>
      </div>

      <div className="phase27Section">
        <h4>新規記録</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <select className="phase27Select" value={opType} onChange={(e) => setOpType(e.target.value as GitHubDryRunOperationType)}>
            {OP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="phase27Input" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="phase27Input" placeholder="repo (owner/repo)" value={targetRepo} onChange={(e) => setTargetRepo(e.target.value)} />
          <input className="phase27Input" placeholder="result URL (issue / PR URL)" value={resultUrl} onChange={(e) => setResultUrl(e.target.value)} />
          <select className="phase27Select" value={status} onChange={(e) => setStatus(e.target.value as GitHubExecutionRecordStatus)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea className="phase27Textarea" rows={2} placeholder="メモ" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="phase27SmallBtn" onClick={handleAdd} style={{ justifySelf: 'start' }}>
            <Plus size={14} /> 追加
          </button>
        </div>
      </div>

      {records.length > 0 && (
        <div className="phase27Section">
          <h4>記録一覧</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            {records.map((r) => (
              <div key={r.id} className="phase27RecordCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ flex: 1, fontSize: '0.88rem' }}>{r.title}</strong>
                  <span className={`phase27StatusBadge ${r.status}`}>{r.status}</span>
                </div>
                <p>{r.operationType} · {r.targetRepo} · {r.executedAt.slice(0, 10)}</p>
                {r.resultUrl && <a href={r.resultUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{r.resultUrl}</a>}
                {r.notes && <p style={{ fontSize: '0.78rem' }}>{r.notes}</p>}
                <div className="phase27BtnRow">
                  <button className={`phase27SmallBtn ${copyState}`} onClick={() => void handleCopy(formatGitHubExecutionRecordMarkdown(r))}>
                    {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} コピー
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
