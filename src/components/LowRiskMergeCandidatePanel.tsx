import { useMemo, useState } from 'react';
import { Check, Copy, GitMerge, RefreshCcw, ShieldCheck } from 'lucide-react';
import { buildCompletionReport } from '../utils/completionReport';
import { buildExecutionOrchestrationDraft } from '../utils/executionOrchestrationDraft';
import { buildLowRiskMergeCandidate, formatLowRiskMergeCandidate } from '../utils/lowRiskMergeCandidate';
import { buildLowRiskPrCandidate } from '../utils/lowRiskPrCandidate';
import { loadAutoRunPlan } from '../utils/autoRunPlanStore';
import type { SavedAutoRunPlan } from '../utils/autoRunPlanStore';
import { buildPrCreationPreview } from '../utils/prCreationPreview';
import { classifyRiskList } from '../utils/riskClassifier';
import { buildSavedAutoRunPlanQueue } from '../utils/savedAutoRunPlanQueue';
import { buildSavedQueuePreflight } from '../utils/savedQueuePreflight';

function splitLines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

export function LowRiskMergeCandidatePanel() {
  const [plan, setPlan] = useState<SavedAutoRunPlan>(() => loadAutoRunPlan());
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const scopeItems = useMemo(() => splitLines(plan.autoScope), [plan.autoScope]);
  const classifications = useMemo(() => classifyRiskList(scopeItems), [scopeItems]);
  const savedQueue = useMemo(() => buildSavedAutoRunPlanQueue(plan), [plan]);
  const preflight = useMemo(() => buildSavedQueuePreflight(savedQueue), [savedQueue]);
  const completionReport = useMemo(() => buildCompletionReport(savedQueue.items, classifications), [savedQueue.items, classifications]);
  const executionDraft = useMemo(() => buildExecutionOrchestrationDraft(savedQueue, preflight, completionReport), [savedQueue, preflight, completionReport]);
  const preview = useMemo(
    () => buildPrCreationPreview(plan.appName, savedQueue, preflight, executionDraft, completionReport),
    [plan.appName, savedQueue, preflight, executionDraft, completionReport],
  );
  const prCandidate = useMemo(() => buildLowRiskPrCandidate(preview), [preview]);
  const mergeCandidate = useMemo(() => buildLowRiskMergeCandidate(prCandidate, preview), [prCandidate, preview]);
  const formattedCandidate = useMemo(() => formatLowRiskMergeCandidate(mergeCandidate), [mergeCandidate]);

  function handleReload() {
    setPlan(loadAutoRunPlan());
    setCopyState('idle');
  }

  async function handleCopyCandidate() {
    try {
      await navigator.clipboard.writeText(formattedCandidate);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="lowRiskMergeCandidatePanel">
      <div className={`mergeCandidateHero merge-${mergeCandidate.status}`}>
        <GitMerge />
        <div>
          <p className="eyebrow">Phase 9.4</p>
          <h3>{mergeCandidate.title}</h3>
          <p>{mergeCandidate.message}</p>
        </div>
      </div>

      <div className="mergeCandidateNoticeBox">
        <ShieldCheck />
        <div>
          <strong>ここでも自動マージはしません</strong>
          <p>この段階は「マージ候補として扱えるか」を判定するだけです。CI、Snapshot、レビュー、ユーザー設定が揃うまでは実行に進みません。</p>
        </div>
      </div>

      <div className="mergeCandidateControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 保存済みPlanを再読み込み
        </button>
        <button type="button" className={`mergeCandidateCopyButton copy-${copyState}`} onClick={handleCopyCandidate}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'マージ候補判定をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'マージ候補判定をコピー'}
        </button>
        <span>{mergeCandidate.nextActionLabel}</span>
      </div>

      <div className="mergeCandidateStatusGrid">
        <section>
          <h4>Merge Candidate Status</h4>
          <p>{mergeCandidate.status}</p>
        </section>
        <section>
          <h4>Can Suggest Auto Merge</h4>
          <p>{mergeCandidate.canSuggestAutoMerge ? 'yes / 候補表示OK' : 'no / まだ候補外'}</p>
        </section>
        <section>
          <h4>PR Candidate Status</h4>
          <p>{prCandidate.status}</p>
        </section>
        <section>
          <h4>PR Preview Status</h4>
          <p>{preview.status}</p>
        </section>
      </div>

      <div className="mergeCandidateConditionBox">
        <div>
          <strong>Merge Conditions</strong>
          <span>{mergeCandidate.conditions.length} checks</span>
        </div>
        <div className="mergeCandidateConditionList">
          {mergeCandidate.conditions.map((condition) => (
            <article className={`mergeCandidateConditionItem condition-${condition.status}`} key={condition.id}>
              <div>
                <strong>{condition.label}</strong>
                <span>{condition.status}</span>
              </div>
              <p>{condition.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mergeRequiredBox">
        <div>
          <strong>Required Before Merge</strong>
          <span>manual gate</span>
        </div>
        <ul>
          {mergeCandidate.requiredBeforeMerge.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className="mergeCandidateReasonGrid">
        <section>
          <h4>Blocked Reasons</h4>
          <div>
            {mergeCandidate.blockedReasons.length > 0
              ? mergeCandidate.blockedReasons.map((item) => <span key={item}>{item}</span>)
              : <span>なし</span>}
          </div>
        </section>
        <section>
          <h4>Caution Reasons</h4>
          <div>
            {mergeCandidate.cautionReasons.length > 0
              ? mergeCandidate.cautionReasons.map((item) => <span key={item}>{item}</span>)
              : <span>なし</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
