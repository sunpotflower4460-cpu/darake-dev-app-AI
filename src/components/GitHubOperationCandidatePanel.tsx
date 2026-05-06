import { useState } from 'react';
import { Check, Copy, GitBranch, Trash2 } from 'lucide-react';
import {
  GitHubOperationCandidate,
  buildInitialGitHubOperationCandidate,
  loadGitHubOperationCandidates,
  saveGitHubOperationCandidates,
  formatGitHubOperationCandidateMarkdown,
  getRiskLabel,
  getOperationTypeLabel,
} from '../utils/githubOperationCandidate';

type CopyState = { [id: string]: 'idle' | 'copied' | 'failed' };

export function GitHubOperationCandidatePanel() {
  const [candidates, setCandidates] = useState<GitHubOperationCandidate[]>(loadGitHubOperationCandidates);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [saveMsg, setSaveMsg] = useState('');

  function handleChange<K extends keyof GitHubOperationCandidate>(
    id: string,
    key: K,
    value: GitHubOperationCandidate[K],
  ) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
  }

  function handleAdd() {
    setCandidates((prev) => [...prev, buildInitialGitHubOperationCandidate()]);
  }

  function handleDelete(id: string) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSave() {
    saveGitHubOperationCandidates(candidates);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleCopy(candidate: GitHubOperationCandidate) {
    try {
      await navigator.clipboard.writeText(formatGitHubOperationCandidateMarkdown(candidate));
      setCopyStates((prev) => ({ ...prev, [candidate.id]: 'copied' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [candidate.id]: 'idle' })), 1800);
    } catch {
      setCopyStates((prev) => ({ ...prev, [candidate.id]: 'failed' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [candidate.id]: 'idle' })), 2400);
    }
  }

  return (
    <div className="phase20Panel">
      <div className="phase20Hero">
        <GitBranch />
        <div>
          <p className="eyebrow">Phase 20.1-20.2</p>
          <h3>GitHub操作候補</h3>
          <p>GitHub操作の候補を整理します。実行はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ GitHub API自動実行なし・Issue/PR自動作成なし・merge自動実行なし</strong>
        <p>全ての操作はGitHubで手動実行してください。</p>
      </div>

      <div className="phase20CandidateList">
        {candidates.length === 0 && (
          <div className="phaseInfoBox"><p>操作候補がありません。「+ 候補追加」から追加してください。</p></div>
        )}
        {candidates.map((c) => (
          <div key={c.id} className="phase20CandidateItem">
            <div className="phase20CandidateHeader">
              <span className={`phaseStatusBadge phaseStatusBadge-${c.risk === 'safe-draft' ? 'ok' : c.risk === 'blocked' ? 'blocked' : 'warning'}`}>
                {getRiskLabel(c.risk)}
              </span>
              <span className="phase20OperationType">{getOperationTypeLabel(c.type)}</span>
              <button type="button" className="phase19DeleteBtn" onClick={() => handleDelete(c.id)} aria-label="削除">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="phaseForm">
              <label>
                操作タイプ
                <select value={c.type} onChange={(e) => handleChange(c.id, 'type', e.target.value as GitHubOperationCandidate['type'])}>
                  <option value="create-issue">Issue作成</option>
                  <option value="create-pr">PR作成</option>
                  <option value="dispatch-workflow">Workflow Dispatch</option>
                  <option value="merge-pr">PR Merge</option>
                  <option value="close-issue">Issue Close</option>
                  <option value="create-release">Release作成</option>
                  <option value="comment">コメント</option>
                </select>
              </label>
              <label>
                タイトル
                <input value={c.title} onChange={(e) => handleChange(c.id, 'title', e.target.value)} placeholder="例: バグ修正のIssue" />
              </label>
              <label>
                対象リポジトリ
                <input value={c.targetRepo} onChange={(e) => handleChange(c.id, 'targetRepo', e.target.value)} placeholder="例: user/my-app" />
              </label>
              <label>
                リスクレベル
                <select value={c.risk} onChange={(e) => handleChange(c.id, 'risk', e.target.value as GitHubOperationCandidate['risk'])}>
                  <option value="safe-draft">🟢 安全（下書き）</option>
                  <option value="review-needed">🟡 要確認</option>
                  <option value="manual-gate">🔶 手動ゲート</option>
                  <option value="blocked">🔴 ブロック</option>
                </select>
              </label>
              <label>
                本文
                <textarea rows={3} value={c.body} onChange={(e) => handleChange(c.id, 'body', e.target.value)} placeholder="操作の詳細・本文" />
              </label>
              {c.blockedReasons.length > 0 && (
                <div className="phaseBlockersBox">
                  <strong>ブロック理由</strong>
                  <ul>{c.blockedReasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
            </div>
            <div className="phase20CandidateActions">
              <button
                type="button"
                className={`phaseCopyBtn copy-${copyStates[c.id] ?? 'idle'}`}
                onClick={() => handleCopy(c)}
              >
                {copyStates[c.id] === 'copied' ? <Check size={16} /> : <Copy size={16} />}
                コピー
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleAdd}>+ 候補追加</button>
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '保存'}
        </button>
      </div>
    </div>
  );
}
