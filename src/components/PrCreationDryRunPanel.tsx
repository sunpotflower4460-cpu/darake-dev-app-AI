import { useState } from 'react';
import { GitPullRequest, Copy, Check } from 'lucide-react';
import {
  buildPrCreationDryRun,
  formatPrCreationDryRunMarkdown,
} from '../utils/prCreationDryRunBuilder';

type CopyState = 'idle' | 'copied' | 'failed';

export function PrCreationDryRunPanel() {
  const [targetRepo, setTargetRepo] = useState('');
  const [headBranch, setHeadBranch] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');
  const [prTitle, setPrTitle] = useState('');
  const [prBody, setPrBody] = useState('');
  const [linkedIssues, setLinkedIssues] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [titleCopyState, setTitleCopyState] = useState<CopyState>('idle');
  const [bodyCopyState, setBodyCopyState] = useState<CopyState>('idle');

  const dryRun = buildPrCreationDryRun({
    targetRepo: targetRepo || '(未入力)',
    headBranch: headBranch || '(未入力)',
    baseBranch: baseBranch || 'main',
    prTitle: prTitle || '(未入力)',
    prBody,
    linkedIssues: linkedIssues.split(',').map((l) => l.trim()).filter(Boolean),
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
        <GitPullRequest />
        <div>
          <p className="eyebrow">Phase 27.4</p>
          <h3>PR Creation Dry-run</h3>
          <p>PR作成直前の形に整えます。自動作成はしません。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ GitHub PR の自動作成はしません。コピーして人間が作成してください。
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
        <input className="phase27Input" placeholder="owner/repo" value={targetRepo} onChange={(e) => setTargetRepo(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>head branch</h4>
        <input className="phase27Input" placeholder="feature/xxx" value={headBranch} onChange={(e) => setHeadBranch(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>base branch</h4>
        <input className="phase27Input" placeholder="main" value={baseBranch} onChange={(e) => setBaseBranch(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>PR タイトル</h4>
        <input className="phase27Input" placeholder="PR のタイトル" value={prTitle} onChange={(e) => setPrTitle(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button className={`phase27SmallBtn ${titleCopyState}`} onClick={() => void copy(prTitle, setTitleCopyState)}>
            {titleCopyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
            タイトルをコピー
          </button>
        </div>
      </div>

      <div className="phase27Section">
        <h4>PR 本文</h4>
        <textarea className="phase27Textarea" rows={6} placeholder="PR の本文（Markdown）" value={prBody} onChange={(e) => setPrBody(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button className={`phase27SmallBtn ${bodyCopyState}`} onClick={() => void copy(prBody, setBodyCopyState)}>
            {bodyCopyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
            本文をコピー
          </button>
        </div>
      </div>

      <div className="phase27Section">
        <h4>Linked Issues（カンマ区切り）</h4>
        <input className="phase27Input" placeholder="#123, #456" value={linkedIssues} onChange={(e) => setLinkedIssues(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>Checklist</h4>
        <ul className="phase27CheckList">
          {dryRun.checklist.map((c, i) => (
            <li key={i} className="unchecked">⬜ {c}</li>
          ))}
        </ul>
      </div>

      <div className="phase27Section">
        <h4>Manual Steps</h4>
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
        <button className={`phase27CopyBtn ${copyState}`} onClick={() => void copy(formatPrCreationDryRunMarkdown(dryRun), setCopyState)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '全体をMarkdownコピー'}
        </button>
      </div>
    </div>
  );
}
