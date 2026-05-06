import { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import {
  buildWorkflowDispatchDryRun,
  formatWorkflowDispatchDryRunMarkdown,
} from '../utils/workflowDispatchDryRunBuilder';

type CopyState = 'idle' | 'copied' | 'failed';

export function WorkflowDispatchDryRunPanel() {
  const [targetRepo, setTargetRepo] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [ref, setRef] = useState('main');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const dryRun = buildWorkflowDispatchDryRun({
    workflowName: workflowName || '(未入力)',
    targetRepo: targetRepo || '(未入力)',
    ref,
    inputs: [],
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
        <Play />
        <div>
          <p className="eyebrow">Phase 27.5</p>
          <h3>Workflow Dispatch Dry-run</h3>
          <p>GitHub Actions workflow dispatch 直前の形に整えます。dispatch はしません。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ workflow dispatch は実行しません。入力値をコピーして人間が実行してください。secret 系の入力があれば blocked になります。
      </div>

      <div className="phase27SummaryGrid">
        <section>
          <h4>status</h4>
          <span className={`phase27StatusBadge ${dryRun.status}`}>{dryRun.status}</span>
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
        <h4>Workflow 名</h4>
        <input className="phase27Input" placeholder="playwright-setup-dry-run" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>ref（branch / tag）</h4>
        <input className="phase27Input" placeholder="main" value={ref} onChange={(e) => setRef(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>Workflow Path</h4>
        <code style={{ fontSize: '0.82rem' }}>{dryRun.workflowPath}</code>
      </div>

      <div className="phase27Section">
        <h4>Manual Steps</h4>
        <ol className="phase27StepList">
          {dryRun.manualSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="phase27Section">
        <h4>Stop If</h4>
        <ul className="phase27BlockerList">
          {dryRun.stopIf.map((s, i) => (
            <li key={i}>⛔ {s}</li>
          ))}
        </ul>
      </div>

      <div className="phase27Section">
        <h4>After Run Checks</h4>
        <ul className="phase27CheckList">
          {dryRun.afterRunChecks.map((c, i) => (
            <li key={i} className="unchecked">⬜ {c}</li>
          ))}
        </ul>
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
        <button className={`phase27CopyBtn ${copyState}`} onClick={() => void copy(formatWorkflowDispatchDryRunMarkdown(dryRun), setCopyState)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdown コピー'}
        </button>
      </div>
    </div>
  );
}
