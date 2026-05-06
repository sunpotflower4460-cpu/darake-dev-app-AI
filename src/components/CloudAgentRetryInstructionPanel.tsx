import { useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import {
  buildCloudAgentRetryInstruction,
  formatCloudAgentRetryInstructionMarkdown,
} from '../utils/cloudAgentRetryInstructionGenerator';
import { loadCloudAgentJobs } from '../utils/cloudAgentJob';
import { loadCloudAgentResultRecords } from '../utils/cloudAgentResultRecord';

type CopyState = 'idle' | 'copied' | 'failed';

export function CloudAgentRetryInstructionPanel() {
  const [jobs] = useState(() => loadCloudAgentJobs());
  const [results] = useState(() => loadCloudAgentResultRecords());
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedResultId, setSelectedResultId] = useState('');
  const [failedChecks, setFailedChecks] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const selectedResult = results.find((r) => r.id === selectedResultId);

  const instruction =
    selectedJob && selectedResult
      ? buildCloudAgentRetryInstruction({
          originalJob: selectedJob,
          resultRecord: selectedResult,
          failedChecks: failedChecks.split('\n').map((l) => l.trim()).filter(Boolean),
          codeRabbitNotes: selectedResult.codeRabbitNotes,
          userNotes,
        })
      : null;

  async function handleCopy() {
    if (!instruction) return;
    try {
      await navigator.clipboard.writeText(formatCloudAgentRetryInstructionMarkdown(instruction));
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
        <RefreshCw />
        <div>
          <p className="eyebrow">Phase 28.5</p>
          <h3>Cloud Agent Retry Instruction</h3>
          <p>失敗時の再指示を自動生成します。自動送信はしません。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ Cloud Agent への自動送信はしません。再指示書をコピーして人間が渡してください。
      </div>

      <div className="phase27Section">
        <h4>元ジョブを選択</h4>
        <select className="phase27Select" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
          <option value="">ジョブを選択…</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} ({j.phaseLabel})</option>)}
        </select>
      </div>

      <div className="phase27Section">
        <h4>結果記録を選択</h4>
        <select className="phase27Select" value={selectedResultId} onChange={(e) => setSelectedResultId(e.target.value)}>
          <option value="">結果を選択…</option>
          {results.map((r) => <option key={r.id} value={r.id}>job:{r.jobId} - {r.status} ({r.createdAt.slice(0, 10)})</option>)}
        </select>
      </div>

      <div className="phase27Section">
        <h4>失敗チェック（1行1件）</h4>
        <textarea className="phase27Textarea" rows={3} placeholder="typecheck失敗&#10;build失敗" value={failedChecks} onChange={(e) => setFailedChecks(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>ユーザーメモ</h4>
        <textarea className="phase27Textarea" rows={2} placeholder="追加で修正してほしいこと" value={userNotes} onChange={(e) => setUserNotes(e.target.value)} />
      </div>

      {instruction && (
        <div className="phase27Section">
          <h4>生成された再指示書</h4>
          <div className="phase27CodeBlock">{instruction.retryInstruction}</div>
          <div style={{ marginTop: 8 }}>
            <span className={`phase27StatusBadge ${instruction.status}`}>{instruction.status}</span>
          </div>
        </div>
      )}

      <div className="phase27BtnRow">
        <button
          className={`phase27CopyBtn ${copyState}`}
          disabled={!instruction}
          onClick={() => void handleCopy()}
        >
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '再指示書コピー'}
        </button>
      </div>
    </div>
  );
}
