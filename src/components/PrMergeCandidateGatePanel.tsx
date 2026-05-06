import { useState } from 'react';
import { Check, Copy, GitMerge, RefreshCcw } from 'lucide-react';
import {
  PrMergeCandidateGateCheck,
  buildInitialPrMergeCandidateGateCheck,
  evaluatePrMergeCandidateGate,
  loadPrMergeCandidateGateCheck,
  savePrMergeCandidateGateCheck,
  formatPrMergeCandidateGateMarkdown,
  CHECK_LABELS,
} from '../utils/prMergeCandidateGate';

type CopyState = 'idle' | 'copied' | 'failed';

export function PrMergeCandidateGatePanel() {
  const [checks, setChecks] = useState<PrMergeCandidateGateCheck>(loadPrMergeCandidateGateCheck);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  const result = evaluatePrMergeCandidateGate(checks);

  function handleToggle(key: keyof PrMergeCandidateGateCheck) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    savePrMergeCandidateGateCheck(checks);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  function handleReset() {
    const fresh = buildInitialPrMergeCandidateGateCheck();
    setChecks(fresh);
    savePrMergeCandidateGateCheck(fresh);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatPrMergeCandidateGateMarkdown(result));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const verdictClass =
    result.verdict === 'safe-to-merge'
      ? 'phaseStatusBadge-ok'
      : result.verdict === 'blocked'
        ? 'phaseStatusBadge-blocked'
        : 'phaseStatusBadge-warning';

  return (
    <div className="phase20Panel">
      <div className="phase20Hero">
        <GitMerge />
        <div>
          <p className="eyebrow">Phase 20.4</p>
          <h3>PR Merge 候補ゲート</h3>
          <p>PRをmergeしてよいか候補判定します。実際のmergeは行いません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 自動merge実行なし</strong>
        <p>mergeはGitHubで手動実行してください。</p>
      </div>

      <div className="phase20MergeVerdict">
        <span className={`phaseStatusBadge ${verdictClass}`} style={{ fontSize: '1rem', padding: '8px 14px' }}>
          {result.verdict === 'safe-to-merge' ? '✅ merge候補OK' : result.verdict === 'blocked' ? '🔴 ブロック' : '🟡 要確認'}
        </span>
        <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>{result.summary}</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>チェックリスト</legend>
          {(Object.keys(checks) as (keyof PrMergeCandidateGateCheck)[]).map((key) => (
            <label key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={() => handleToggle(key)}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              {checks[key] ? '✅' : '❌'} {CHECK_LABELS[key]}
            </label>
          ))}
        </fieldset>
      </div>

      {result.failedChecks.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>未通過チェック ({result.failedChecks.length}件)</strong>
          <ul>{result.failedChecks.map((f, i) => <li key={i}>{f}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>⛔ 必須: 手動ゲート</strong>
        <p>全チェック通過後もmergeはGitHubで手動実行してください。自動mergeはしません。</p>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '保存'}
        </button>
        <button type="button" onClick={handleReset}>
          <RefreshCcw size={16} /> リセット
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
