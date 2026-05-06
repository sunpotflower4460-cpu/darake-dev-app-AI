import { useState } from 'react';
import { Check, Copy, BookOpen } from 'lucide-react';
import {
  GitHubOperationType,
  getOperationTypeLabel,
} from '../utils/githubOperationCandidate';
import {
  buildGitHubManualOperationGuide,
  formatGitHubManualOperationGuideMarkdown,
} from '../utils/githubManualOperationGuide';

type CopyState = 'idle' | 'copied' | 'failed';

const OPERATION_TYPES: GitHubOperationType[] = [
  'create-issue',
  'create-pr',
  'dispatch-workflow',
  'merge-pr',
  'close-issue',
  'create-release',
  'comment',
];

export function GitHubManualOperationGuidePanel() {
  const [opType, setOpType] = useState<GitHubOperationType>('create-issue');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const guide = buildGitHubManualOperationGuide(opType, { title, body, repo, branch });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatGitHubManualOperationGuideMarkdown(guide));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  async function handleCopyTemplate() {
    try {
      await navigator.clipboard.writeText(guide.copyTemplate);
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
        <BookOpen />
        <div>
          <p className="eyebrow">Phase 20.5</p>
          <h3>GitHub手動操作 手順カード</h3>
          <p>GitHub上で手動操作する手順を確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ GitHub API自動実行なし</strong>
        <p>全ての操作はGitHubで手動実行してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>操作タイプ</legend>
          <label>
            操作を選ぶ
            <select value={opType} onChange={(e) => setOpType(e.target.value as GitHubOperationType)}>
              {OPERATION_TYPES.map((t) => (
                <option key={t} value={t}>{getOperationTypeLabel(t)}</option>
              ))}
            </select>
          </label>
          <label>
            タイトル / PR番号 / Issue番号
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: バグ修正のIssue" />
          </label>
          <label>
            対象リポジトリ
            <input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="例: user/my-app" />
          </label>
          {(opType === 'create-pr' || opType === 'merge-pr') && (
            <label>
              ブランチ名
              <input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="例: feature/fix-login" />
            </label>
          )}
          <label>
            本文
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="操作の詳細内容" />
          </label>
        </fieldset>
      </div>

      <div className="phaseInfoBox">
        <strong>{guide.label}</strong>
        <ol>{guide.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </div>

      <div className="phaseInfoBox">
        <strong>コピー用テンプレート</strong>
        <pre className="phase19CodeBox">{guide.copyTemplate}</pre>
      </div>

      <div className="phaseWarningsBox">
        <strong>注意</strong>
        <ul>{guide.warnings.map((w, i) => <li key={i}>⚠️ {w}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopyTemplate}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          テンプレートコピー
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          手順全体コピー
        </button>
      </div>
    </div>
  );
}
