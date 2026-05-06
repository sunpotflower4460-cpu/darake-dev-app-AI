import { useState } from 'react';
import { GitMerge, Copy, Check } from 'lucide-react';
import {
  buildMergeDryRunGate,
  formatMergeDryRunGateMarkdown,
  DEFAULT_MERGE_CHECKS,
} from '../utils/mergeDryRunGate';
import type { MergeCheckStatus } from '../utils/mergeDryRunGate';

type CopyState = 'idle' | 'copied' | 'failed';

const STATUS_OPTIONS: { value: MergeCheckStatus; label: string }[] = [
  { value: 'unchecked', label: '⬜ 未確認' },
  { value: 'pass', label: '✅ pass' },
  { value: 'warn', label: '⚠️ warn' },
  { value: 'fail', label: '❌ fail' },
];

export function MergeDryRunGatePanel() {
  const [prNumber, setPrNumber] = useState('');
  const [targetRepo, setTargetRepo] = useState('');
  const [checkStatuses, setCheckStatuses] = useState<MergeCheckStatus[]>(
    DEFAULT_MERGE_CHECKS.map(() => 'unchecked')
  );
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const checks = DEFAULT_MERGE_CHECKS.map((c, i) => ({
    ...c,
    status: checkStatuses[i],
  }));

  const gate = buildMergeDryRunGate({
    prNumber: prNumber || '(未入力)',
    targetRepo: targetRepo || '(未入力)',
    checks,
  });

  function updateCheckStatus(index: number, status: MergeCheckStatus) {
    setCheckStatuses((prev) => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  }

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
        <GitMerge />
        <div>
          <p className="eyebrow">Phase 27.6</p>
          <h3>Merge Dry-run Gate</h3>
          <p>PRをmergeしてよいかdry-run判定します。自動mergeはしません。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ PR の自動 merge はしません。全チェックが pass になったら人間が手動でmergeしてください。
      </div>

      <div className="phase27SummaryGrid">
        <section>
          <h4>status</h4>
          <span className={`phase27StatusBadge ${gate.status}`}>{gate.status}</span>
        </section>
        <section>
          <h4>blockers</h4>
          <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{gate.blockers.length}</p>
        </section>
        <section>
          <h4>pass</h4>
          <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{checks.filter((c) => c.status === 'pass').length}</p>
        </section>
      </div>

      <div className="phase27Section">
        <h4>repo</h4>
        <input className="phase27Input" placeholder="owner/repo" value={targetRepo} onChange={(e) => setTargetRepo(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>PR 番号</h4>
        <input className="phase27Input" placeholder="123" value={prNumber} onChange={(e) => setPrNumber(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>Checks</h4>
        <ul className="phase27CheckList" style={{ gap: 10 }}>
          {checks.map((c, i) => (
            <li key={i} className={c.status} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <strong style={{ flex: 1 }}>{c.label}</strong>
                <select
                  className="phase27Select"
                  style={{ width: 'auto' }}
                  value={c.status}
                  onChange={(e) => updateCheckStatus(i, e.target.value as MergeCheckStatus)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{c.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {gate.blockers.length > 0 && (
        <div className="phase27Section">
          <h4>Blockers</h4>
          <ul className="phase27BlockerList">
            {gate.blockers.map((b, i) => (
              <li key={i}>⛔ {b}</li>
            ))}
          </ul>
        </div>
      )}

      {gate.warnings.length > 0 && (
        <div className="phase27Section">
          <h4>Warnings</h4>
          <ul className="phase27WarningList">
            {gate.warnings.map((w, i) => (
              <li key={i}>⚠️ {w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="phase27Section">
        <h4>Manual Merge Steps</h4>
        <ol className="phase27StepList">
          {gate.manualMergeSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="phase27BtnRow">
        <button className={`phase27CopyBtn ${copyState}`} onClick={() => void copy(formatMergeDryRunGateMarkdown(gate), setCopyState)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdown コピー'}
        </button>
      </div>
    </div>
  );
}
