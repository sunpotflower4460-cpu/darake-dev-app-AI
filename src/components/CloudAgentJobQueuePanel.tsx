import { useState } from 'react';
import { ListOrdered, Copy, Check, RefreshCcw } from 'lucide-react';
import { loadCloudAgentJobs } from '../utils/cloudAgentJob';
import { buildCloudAgentJobQueue, formatCloudAgentJobQueueMarkdown } from '../utils/cloudAgentJobQueue';
import { formatCloudAgentJobMarkdown } from '../utils/cloudAgentJob';

type CopyState = 'idle' | 'copied' | 'failed';

export function CloudAgentJobQueuePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [nextCopyState, setNextCopyState] = useState<CopyState>('idle');

  void reloadKey;
  const jobs = loadCloudAgentJobs();
  const queue = buildCloudAgentJobQueue(jobs);

  async function copy(text: string, setter: (s: CopyState) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setter('copied');
      window.setTimeout(() => setter('idle'), 1800);
    } catch {
      setter('failed');
      window.setTimeout(() => setter('idle'), 2400);
    }
  }

  return (
    <div className="phase27Panel">
      <div className="phase27Hero">
        <ListOrdered />
        <div>
          <p className="eyebrow">Phase 28.3</p>
          <h3>Cloud Agent Job Queue</h3>
          <p>Cloud Agentへ渡す作業をキュー管理します。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ Cloud Agent への自動送信はしません。次のジョブをコピーして人間が渡してください。
      </div>

      <div className="phase27SummaryGrid">
        <section>
          <h4>queue status</h4>
          <span className={`phase27StatusBadge ${queue.status === 'needs-attention' ? 'blocked' : queue.status === 'has-running' ? 'review-needed' : 'ready-to-copy'}`}>
            {queue.status}
          </span>
        </section>
        <section><h4>合計</h4><p>{queue.jobs.length}</p></section>
        <section><h4>blocked</h4><p>{queue.blockedJobs.length}</p></section>
      </div>

      <div className="phase27Section">
        <h4>🎯 今日やるべき次のジョブ</h4>
        {queue.nextJob ? (
          <div className="phase27RecordCard">
            <strong>{queue.nextJob.title}</strong>
            <p>{queue.nextJob.phaseLabel} · {queue.nextJob.targetRepo}</p>
            <button className={`phase27SmallBtn ${nextCopyState}`} onClick={() => void copy(formatCloudAgentJobMarkdown(queue.nextJob!), setNextCopyState)}>
              {nextCopyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
              指示書コピー
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>次のジョブはありません。新しいジョブを作成してください。</p>
        )}
      </div>

      <div className="phase27Section">
        <h4>Next Actions</h4>
        <ul className="phase27StepList">
          {queue.nextActions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      {queue.blockedJobs.length > 0 && (
        <div className="phase27Section">
          <h4>Blocked Jobs</h4>
          <ul className="phase27BlockerList">
            {queue.blockedJobs.map((j) => (
              <li key={j.id}>⛔ {j.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="phase27Section">
        <h4>全ジョブ</h4>
        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 5 }}>
          {queue.jobs.map((j) => (
            <li key={j.id} style={{ fontSize: '0.82rem', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`phase27StatusBadge ${j.status}`}>{j.status}</span>
              <span>{j.title}</span>
              <span style={{ color: 'var(--muted)' }}>({j.phaseLabel})</span>
            </li>
          ))}
          {queue.jobs.length === 0 && <li style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>(なし)</li>}
        </ul>
      </div>

      <div className="phase27BtnRow">
        <button className={`phase27CopyBtn ${copyState}`} onClick={() => void copy(formatCloudAgentJobQueueMarkdown(queue), setCopyState)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Queue Markdown コピー'}
        </button>
        <button className="phase27SmallBtn" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={14} /> 更新
        </button>
      </div>
    </div>
  );
}
