import { useMemo, useState } from 'react';
import { Check, ClipboardCheck, Copy, GitPullRequestArrow, RefreshCcw } from 'lucide-react';
import { buildCompletionReport } from '../utils/completionReport';
import { buildExecutionOrchestrationDraft } from '../utils/executionOrchestrationDraft';
import { buildLowRiskPrCandidate, formatLowRiskPrCandidate } from '../utils/lowRiskPrCandidate';
import { loadAutoRunPlan } from '../utils/autoRunPlanStore';
import type { SavedAutoRunPlan } from '../utils/autoRunPlanStore';
import { buildPrCreationPreview } from '../utils/prCreationPreview';
import { classifyRiskList } from '../utils/riskClassifier';
import { buildSavedAutoRunPlanQueue } from '../utils/savedAutoRunPlanQueue';
import { buildSavedQueuePreflight } from '../utils/savedQueuePreflight';

function splitLines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

export function LowRiskPrCandidatePanel() {
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
  const candidate = useMemo(() => buildLowRiskPrCandidate(preview), [preview]);
  const formattedCandidate = useMemo(() => formatLowRiskPrCandidate(candidate), [candidate]);

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
    <div className="lowRiskPrCandidatePanel">
      <div className={`lowRiskHero candidate-${candidate.status}`}>
        <GitPullRequestArrow />
        <div>
          <p className="eyebrow">Phase 9.3</p>
          <h3>{candidate.title}</h3>
          <p>{candidate.message}</p>
        </div>
      </div>

      <div className="lowRiskNoticeBox">
        <ClipboardCheck />
        <div>
          <strong>まだ自動作成はしません</strong>
          <p>この段階は「低リスクならPR作成候補として見える化する」だけです。GitHubへの作成操作は次以降でも明示ゲート付きにします。</p>
        </div>
      </div>

      <div className="lowRiskControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 保存済みPlanを再読み込み
        </button>
        <button type="button" className={`lowRiskCopyButton copy-${copyState}`} onClick={handleCopyCandidate}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '候補判定をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '候補判定をコピー'}
        </button>
        <span>{candidate.nextActionLabel}</span>
      </div>

      <div className="lowRiskStatusGrid">
        <section>
          <h4>Candidate Status</h4>
          <p>{candidate.status}</p>
        </section>
        <section>
          <h4>Can Suggest Auto Creation</h4>
          <p>{candidate.canSuggestAutoCreation ? 'yes / 候補表示OK' : 'no / まだ候補外'}</p>
        </section>
        <section>
          <h4>Suggested Branch</h4>
          <p>{preview.branchName}</p>
        </section>
        <section>
          <h4>Suggested PR Title</h4>
          <p>{preview.suggestedPrTitle}</p>
        </section>
      </div>

      <div className="lowRiskConditionBox">
        <div>
          <strong>Candidate Conditions</strong>
          <span>{candidate.conditions.length} checks</span>
        </div>
        <div className="lowRiskConditionList">
          {candidate.conditions.map((condition) => (
            <article className={`lowRiskConditionItem condition-${condition.status}`} key={condition.id}>
              <div>
                <strong>{condition.label}</strong>
                <span>{condition.status}</span>
              </div>
              <p>{condition.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="lowRiskReasonGrid">
        <section>
          <h4>Blocked Reasons</h4>
          <div>
            {candidate.blockedReasons.length > 0
              ? candidate.blockedReasons.map((item) => <span key={item}>{item}</span>)
              : <span>なし</span>}
          </div>
        </section>
        <section>
          <h4>Caution Reasons</h4>
          <div>
            {candidate.cautionReasons.length > 0
              ? candidate.cautionReasons.map((item) => <span key={item}>{item}</span>)
              : <span>なし</span>}
          </div>
        </section>
      </div>

      <div className="lowRiskChecklistBox">
        <div>
          <strong>次に見るチェックリスト</strong>
          <span>copy-only</span>
        </div>
        <ul>
          {candidate.suggestedChecklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
