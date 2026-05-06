import { useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, RefreshCcw } from 'lucide-react';
import {
  buildPhase10ScreenshotUiCompletionReport,
  formatPhase10ScreenshotUiCompletionReport,
} from '../utils/phase10ScreenshotUiCompletionReport';

export function Phase10ScreenshotUiCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const report = useMemo(() => buildPhase10ScreenshotUiCompletionReport(), [reloadKey]);
  const formattedReport = useMemo(() => formatPhase10ScreenshotUiCompletionReport(report), [report]);

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
    <div className="phase10CompletionReportPanel">
      <div className={`phase10CompletionReportHero phase10-${report.status}`}>
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 10.30</p>
          <h3>Phase 10 Screenshot × UI 完成間近レポート</h3>
          <p>{report.message}</p>
        </div>
      </div>

      <div className="phase10CompletionReportSafetyBox">
        <strong>既存記録の集約のみです</strong>
        <p>Phase 10の全記録を読み取り、スクショ〜UIチェック準備の現状を1枚でまとめます。GitHub Actionsの実行・artifact取得・画像解析は行いません。</p>
      </div>

      <div className="phase10CompletionReportControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 最新記録を再読み込み
        </button>
        <button type="button" className={`phase10CompletionReportCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'レポートをコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'レポートをコピー'}
        </button>
        <span>{report.status}</span>
      </div>

      <div className="phase10CompletionReportSummaryGrid">
        <section>
          <h4>Status</h4>
          <p>{report.status}</p>
        </section>
        <section>
          <h4>完了</h4>
          <p>{report.completed.length}件</p>
        </section>
        <section>
          <h4>Blockers</h4>
          <p>{report.blockers.length}</p>
        </section>
        <section>
          <h4>Warnings</h4>
          <p>{report.warnings.length}</p>
        </section>
      </div>

      {report.completed.length > 0 && (
        <div className="phase10CompletionReportListBox phase10CompletionReportCompletedBox">
          <div>
            <strong>完了したこと</strong>
            <span>{report.completed.length}件</span>
          </div>
          <ul>
            {report.completed.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {report.remainingManualActions.length > 0 && (
        <div className="phase10CompletionReportListBox phase10CompletionReportRemainingBox">
          <div>
            <strong>手動確認が必要なこと</strong>
            <span>{report.remainingManualActions.length}件</span>
          </div>
          <ul>
            {report.remainingManualActions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {report.blockers.length > 0 && (
        <div className="phase10CompletionReportBlockersBox">
          <strong>Blockers</strong>
          <ul>
            {report.blockers.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="phase10CompletionReportWarningsBox">
          <strong>Warnings</strong>
          <ul>
            {report.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="phase10CompletionReportNextPhaseBox">
        <strong>次のおすすめPhase</strong>
        <p>{report.nextRecommendedPhase}</p>
      </div>

      <div className="phase10CompletionReportActionsBox">
        <div>
          <strong>次にやること</strong>
          <span>{report.nextActions.length}件</span>
        </div>
        <ul>
          {report.nextActions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
}
