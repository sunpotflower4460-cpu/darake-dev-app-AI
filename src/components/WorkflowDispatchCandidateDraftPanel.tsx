import { useState } from 'react';
import { Check, Copy, Workflow } from 'lucide-react';
import {
  loadWorkflowDispatchCandidates,
  formatWorkflowDispatchCandidateMarkdown,
  WorkflowDispatchCandidateDraft,
} from '../utils/workflowDispatchCandidateDraft';

type CopyState = 'idle' | 'copied' | 'failed';

export function WorkflowDispatchCandidateDraftPanel() {
  const [workflows] = useState<WorkflowDispatchCandidateDraft[]>(loadWorkflowDispatchCandidates);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const selected = workflows[selectedIdx];

  async function handleCopy() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(formatWorkflowDispatchCandidateMarkdown(selected));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase20Panel">
      <div className="phase20Hero">
        <Workflow />
        <div>
          <p className="eyebrow">Phase 20.3</p>
          <h3>Workflow Dispatch 候補ドラフト</h3>
          <p>GitHub Actions workflow dispatch の候補を確認します。実行はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ workflow dispatch自動実行なし・GitHub API呼び出しなし</strong>
        <p>全てのworkflowはGitHub Actionsページで手動実行してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>Workflow選択</legend>
          <label>
            対象Workflow
            <select value={selectedIdx} onChange={(e) => setSelectedIdx(Number(e.target.value))}>
              {workflows.map((w, i) => (
                <option key={i} value={i}>{w.workflowName} ({w.status})</option>
              ))}
            </select>
          </label>
        </fieldset>
      </div>

      {selected && (
        <>
          <div className="phaseInfoBox">
            <strong>Workflow情報</strong>
            <p><strong>名前:</strong> {selected.workflowName}</p>
            <p><strong>ファイルパス:</strong> {selected.workflowPath}</p>
            <p>
              <strong>ステータス:</strong>{' '}
              <span className={`phaseStatusBadge phaseStatusBadge-${selected.status === 'blocked' ? 'blocked' : selected.status === 'draft-only' ? 'draft' : 'warning'}`}>
                {selected.status}
              </span>
            </p>
          </div>

          <div className="phaseInfoBox">
            <strong>Inputs（コピー用）</strong>
            <ul>
              {selected.inputs.map((inp, i) => (
                <li key={i}>
                  <code>{inp.name}: {inp.value}</code>
                  {inp.safeToCopy && <span className="phase20SafeBadge"> ✅ コピー可</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="phaseInfoBox">
            <strong>手動実行手順</strong>
            <ol>{selected.manualSteps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>

          {selected.blockedReasons.length > 0 && (
            <div className="phaseBlockersBox">
              <strong>ブロック理由</strong>
              <ul>{selected.blockedReasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
        </>
      )}

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '手順コピー'}
        </button>
      </div>
    </div>
  );
}
