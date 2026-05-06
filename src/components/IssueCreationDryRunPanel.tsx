import { useState } from 'react';
import { AlertCircle, Copy, Check } from 'lucide-react';
import {
  buildIssueCreationDryRun,
  formatIssueCreationDryRunMarkdown,
} from '../utils/issueCreationDryRunBuilder';

type CopyState = 'idle' | 'copied' | 'failed';

export function IssueCreationDryRunPanel() {
  const [repo, setRepo] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueBody, setIssueBody] = useState('');
  const [labels, setLabels] = useState('');
  const [milestone, setMilestone] = useState('');
  const [assignees, setAssignees] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [titleCopyState, setTitleCopyState] = useState<CopyState>('idle');
  const [bodyCopyState, setBodyCopyState] = useState<CopyState>('idle');

  const dryRun = buildIssueCreationDryRun({
    repo: repo || '(未入力)',
    issueTitle: issueTitle || '(未入力)',
    issueBody,
    labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
    milestone,
    assignees: assignees.split(',').map((a) => a.trim()).filter(Boolean),
  });

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
        <AlertCircle />
        <div>
          <p className="eyebrow">Phase 27.3</p>
          <h3>Issue Creation Dry-run</h3>
          <p>Issue作成直前の形に整えます。自動作成はしません。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ GitHub Issue の自動作成はしません。コピーして人間が作成してください。
      </div>

      <div className="phase27SummaryGrid">
        <section>
          <h4>status</h4>
          <span className={`phase27StatusBadge ${dryRun.status}`}>{dryRun.status}</span>
        </section>
        <section>
          <h4>risk</h4>
          <span className={`phase27RiskBadge ${dryRun.risk}`}>{dryRun.risk}</span>
        </section>
        <section>
          <h4>blockers</h4>
          <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{dryRun.blockers.length}</p>
        </section>
      </div>

      <div className="phase27Section">
        <h4>repo</h4>
        <input
          className="phase27Input"
          placeholder="owner/repo"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>Issue タイトル</h4>
        <input
          className="phase27Input"
          placeholder="Issue のタイトル"
          value={issueTitle}
          onChange={(e) => setIssueTitle(e.target.value)}
        />
        <div style={{ marginTop: 8 }}>
          <button
            className={`phase27SmallBtn ${titleCopyState}`}
            onClick={() => void copy(issueTitle, setTitleCopyState)}
          >
            {titleCopyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
            タイトルをコピー
          </button>
        </div>
      </div>

      <div className="phase27Section">
        <h4>Issue 本文</h4>
        <textarea
          className="phase27Textarea"
          rows={6}
          placeholder="Issue の本文（Markdown）"
          value={issueBody}
          onChange={(e) => setIssueBody(e.target.value)}
        />
        <div style={{ marginTop: 8 }}>
          <button
            className={`phase27SmallBtn ${bodyCopyState}`}
            onClick={() => void copy(issueBody, setBodyCopyState)}
          >
            {bodyCopyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
            本文をコピー
          </button>
        </div>
      </div>

      <div className="phase27Section">
        <h4>Labels（カンマ区切り）</h4>
        <input
          className="phase27Input"
          placeholder="bug, enhancement"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>Milestone</h4>
        <input
          className="phase27Input"
          placeholder="v1.0"
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>Assignees（カンマ区切り）</h4>
        <input
          className="phase27Input"
          placeholder="username1, username2"
          value={assignees}
          onChange={(e) => setAssignees(e.target.value)}
        />
      </div>

      <div className="phase27Section">
        <h4>GitHubで作成する手順</h4>
        <ol className="phase27StepList">
          {dryRun.manualSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      {dryRun.blockers.length > 0 && (
        <div className="phase27Section">
          <h4>Blockers</h4>
          <ul className="phase27BlockerList">
            {dryRun.blockers.map((b, i) => (
              <li key={i}>⛔ {b}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="phase27BtnRow">
        <button
          className={`phase27CopyBtn ${copyState}`}
          onClick={() => void copy(formatIssueCreationDryRunMarkdown(dryRun), setCopyState)}
        >
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '全体をMarkdownコピー'}
        </button>
      </div>
    </div>
  );
}
