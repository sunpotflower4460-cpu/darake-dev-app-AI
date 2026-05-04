import { useMemo, useState } from 'react';
import { Check, Copy, GitPullRequest, RefreshCcw, ShieldCheck } from 'lucide-react';
import { buildCompletionReport } from '../utils/completionReport';
import { buildExecutionOrchestrationDraft } from '../utils/executionOrchestrationDraft';
import { loadAutoRunPlan } from '../utils/autoRunPlanStore';
import type { SavedAutoRunPlan } from '../utils/autoRunPlanStore';
import { buildPrCreationPreview, formatPrCreationPreview } from '../utils/prCreationPreview';
import { classifyRiskList } from '../utils/riskClassifier';
import { buildSavedAutoRunPlanQueue } from '../utils/savedAutoRunPlanQueue';
import { buildSavedQueuePreflight } from '../utils/savedQueuePreflight';

function splitLines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

function formatSavedAt(value?: string): string {
  if (!value) return '未保存';

  try {
    return new Intl.DateTimeFormat('ja-JP', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function PrCreationPreviewPanel() {
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
  const formattedPreview = useMemo(() => formatPrCreationPreview(preview), [preview]);

  function handleReload() {
    setPlan(loadAutoRunPlan());
    setCopyState('idle');
  }

  async function handleCopyPreview() {
    try {
      await navigator.clipboard.writeText(formattedPreview);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="prCreationPreviewPanel">
      <div className={`prPreviewHero preview-${preview.status}`}>
        <GitPullRequest />
        <div>
          <p className="eyebrow">Phase 9.2</p>
          <h3>{preview.title}</h3>
          <p>{preview.message}</p>
        </div>
      </div>

      <div className="prPreviewSafetyBox">
        <ShieldCheck />
        <div>
          <strong>この段階ではPRを作りません</strong>
          <p>ブランチ名、PRタイトル、本文、ラベル、確認項目を作るだけです。作成・マージ・本番公開はまだ手動ゲートです。</p>
        </div>
      </div>

      <div className="prPreviewControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 保存済みPlanを再読み込み
        </button>
        <button type="button" className={`prPreviewCopyButton copy-${copyState}`} onClick={handleCopyPreview}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'PRプレビューをコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'PRプレビューをコピー'}
        </button>
        <span>保存時刻: {formatSavedAt(plan.savedAt)}</span>
      </div>

      <div className="prPreviewMetaGrid">
        <section>
          <h4>Base Branch</h4>
          <p>{preview.baseBranch}</p>
        </section>
        <section>
          <h4>Suggested Branch</h4>
          <p>{preview.branchName}</p>
        </section>
        <section>
          <h4>PR Title</h4>
          <p>{preview.suggestedPrTitle}</p>
        </section>
        <section>
          <h4>Status</h4>
          <p>{preview.status}</p>
        </section>
      </div>

      <div className="prPreviewChecks">
        <section>
          <h4>Labels</h4>
          <div>{preview.labels.map((label) => <span key={label}>{label}</span>)}</div>
        </section>
        <section>
          <h4>Checks</h4>
          <div>{preview.checks.map((check) => <span key={check}>{check}</span>)}</div>
        </section>
      </div>

      <div className="prPreviewFilePlan">
        <div>
          <strong>File / Work Plan</strong>
          <span>{preview.filePlan.length} items</span>
        </div>
        <div className="prPreviewFileList">
          {preview.filePlan.map((item) => (
            <article className={`prPreviewFileItem risk-${item.risk}`} key={`${item.path}-${item.changeType}`}>
              <div>
                <strong>{item.path}</strong>
                <span>{item.changeType}</span>
              </div>
              <p>{item.reason}</p>
              <small>{item.risk}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="prPreviewBodyBox">
        <div>
          <strong>Suggested PR Body</strong>
          <span>copy-only</span>
        </div>
        <pre>{preview.suggestedPrBody}</pre>
      </div>
    </div>
  );
}
