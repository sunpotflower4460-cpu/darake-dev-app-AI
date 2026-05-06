import { useState } from 'react';
import { GitFork, Copy, Check } from 'lucide-react';
import {
  buildGitHubDryRunOperation,
  formatGitHubDryRunOperationMarkdown,
  classifyGitHubDryRunRisk,
} from '../utils/githubDryRunOperation';
import type { GitHubDryRunOperationType } from '../utils/githubDryRunOperation';

type CopyState = 'idle' | 'copied' | 'failed';

const OPERATION_TYPES: { value: GitHubDryRunOperationType; label: string }[] = [
  { value: 'create-issue', label: 'Issue 作成' },
  { value: 'create-pr', label: 'PR 作成' },
  { value: 'dispatch-workflow', label: 'Workflow Dispatch' },
  { value: 'merge-pr', label: 'PR Merge' },
  { value: 'comment-pr', label: 'PR コメント' },
  { value: 'create-branch', label: 'Branch 作成' },
  { value: 'create-release', label: 'Release 作成' },
  { value: 'close-issue', label: 'Issue クローズ' },
];

export function GitHubDryRunOperationPanel() {
  const [opType, setOpType] = useState<GitHubDryRunOperationType>('create-issue');
  const [title, setTitle] = useState('');
  const [targetRepo, setTargetRepo] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [summary, setSummary] = useState('');
  const [reason, setReason] = useState('');
  const [payloadPreview, setPayloadPreview] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const risk = classifyGitHubDryRunRisk(opType);
  const op = buildGitHubDryRunOperation({
    type: opType,
    title: title || '(未入力)',
    targetRepo: targetRepo || '(未入力)',
    targetBranch,
    summary,
    reason,
    payloadPreview,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatGitHubDryRunOperationMarkdown(op));
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
        <GitFork />
        <div>
          <p className="eyebrow">Phase 27.1 / 27.2</p>
          <h3>GitHub Dry-run Operation</h3>
          <p>GitHub操作を実行直前の形に整えます。実行はしません。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ GitHub API は実行しません。Issue / PR / workflow / merge の自動実行はしません。
      </div>

      <div className="phase27Section">
        <h4>操作タイプ</h4>
        <select
          className="phase27Select"
          value={opType}
          onChange={(e) => setOpType(e.target.value as GitHubDryRunOperationType)}
        >
          {OPERATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="phase27Section">
        <h4>risk</h4>
        <span className={`phase27RiskBadge ${risk}`}>{risk}</span>
      </div>

      <div className="phase27Section">
        <h4>タイトル</h4>
        <input
          className="phase27Input"
          placeholder="操作タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>targetRepo</h4>
        <input
          className="phase27Input"
          placeholder="owner/repo"
          value={targetRepo}
          onChange={(e) => setTargetRepo(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>targetBranch</h4>
        <input
          className="phase27Input"
          placeholder="feature/xxx"
          value={targetBranch}
          onChange={(e) => setTargetBranch(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>summary</h4>
        <textarea
          className="phase27Textarea"
          rows={2}
          placeholder="何をする操作か"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>reason</h4>
        <textarea
          className="phase27Textarea"
          rows={2}
          placeholder="なぜ実行してよいか"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>payload preview</h4>
        <textarea
          className="phase27Textarea"
          rows={4}
          placeholder="実際に送るJSONや本文のプレビュー"
          value={payloadPreview}
          onChange={(e) => setPayloadPreview(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>Manual Steps</h4>
        <ul className="phase27StepList">
          {op.manualSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="phase27Section">
        <h4>Stop If</h4>
        <ul className="phase27BlockerList">
          {op.stopIf.map((s, i) => (
            <li key={i}>⛔ {s}</li>
          ))}
        </ul>
      </div>

      <div className="phase27BtnRow">
        <button
          className={`phase27CopyBtn ${copyState}`}
          onClick={() => void handleCopy()}
        >
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdown コピー'}
        </button>
      </div>
    </div>
  );
}
