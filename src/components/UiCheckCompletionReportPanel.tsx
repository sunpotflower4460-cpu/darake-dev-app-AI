import { useMemo, useState } from 'react';
import { Check, ClipboardCheck, Copy, RefreshCcw } from 'lucide-react';
import { buildAutoRunPhaseQueue } from '../utils/autoRunPhaseQueue';
import { loadAutoRunPlan } from '../utils/autoRunPlanStore';
import { buildCompletionReport } from '../utils/completionReport';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { classifyRiskList } from '../utils/riskClassifier';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildUiMachineCheckDraft } from '../utils/uiMachineCheckDraft';
import {
  buildInitialUiCheckResultRecord,
  loadUiCheckResultRecord,
} from '../utils/uiCheckResultRecord';
import {
  buildUiCheckCompletionReport,
  formatUiCheckCompletionReport,
} from '../utils/uiCheckCompletionReport';

function splitLines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

export function UiCheckCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const report = useMemo(() => {
    const autoRunPlan = loadAutoRunPlan();
    const autoItems = splitLines(autoRunPlan.autoScope);
    const classifications = classifyRiskList(autoItems);
    const phaseQueue = buildAutoRunPhaseQueue(classifications);
    const baseReport = buildCompletionReport(phaseQueue, classifications);

    const previewRecord = loadPreviewUrlRecord();
    const screenshotDraft = buildScreenshotJobDraft(previewRecord);
    const machineDraft = buildUiMachineCheckDraft(screenshotDraft);
    const fallbackRecord = buildInitialUiCheckResultRecord(machineDraft);
    const uiRecord = loadUiCheckResultRecord(fallbackRecord);

    return buildUiCheckCompletionReport(baseReport, uiRecord);
  }, [reloadKey]);

  const formattedReport = useMemo(() => formatUiCheckCompletionReport(report), [report]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedReport);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="uiCheckCompletionReportPanel">
      <div className={`uiCheckCompletionHero completion-${report.uiSummary.status}`}>
        <ClipboardCheck />
        <div>
          <p className="eyebrow">Phase 10.5</p>
          <h3>UI Check → Completion Report</h3>
          <p>{report.message}</p>
        </div>
      </div>

      <div className="uiCheckCompletionSafetyBox">
        <strong>統合表示だけを行います</strong>
        <p>UIチェック結果を完成間近レポートへ流す下書きです。実行・スクショ撮影・外部アクセスは行いません。</p>
      </div>

      <div className="uiCheckCompletionControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 最新結果を再読み込み
        </button>
        <button type="button" className={`uiCheckCompletionCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '統合レポートをコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '統合レポートをコピー'}
        </button>
        <span>{report.uiSummary.status}</span>
      </div>

      <div className="uiCheckCompletionSummaryGrid">
        <section>
          <h4>Total</h4>
          <p>{report.uiSummary.total}</p>
        </section>
        <section>
          <h4>Unchecked</h4>
          <p>{report.uiSummary.unchecked}</p>
        </section>
        <section>
          <h4>Pass</h4>
          <p>{report.uiSummary.pass}</p>
        </section>
        <section>
          <h4>Warn</h4>
          <p>{report.uiSummary.warn}</p>
        </section>
        <section>
          <h4>Fail</h4>
          <p>{report.uiSummary.fail}</p>
        </section>
        <section>
          <h4>Done</h4>
          <p>{report.uiSummary.completionRate}%</p>
        </section>
      </div>

      <div className="uiCheckCompletionGrid">
        <section>
          <h4>できたこと候補</h4>
          {report.doneItems.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>最後にまとめる注意点</h4>
          {report.batchedNotes.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>手動項目</h4>
          {report.manualItems.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>途中停止候補</h4>
          {report.hardStopItems.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
