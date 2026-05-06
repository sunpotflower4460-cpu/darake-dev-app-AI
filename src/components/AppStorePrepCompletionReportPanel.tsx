import { useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, RefreshCcw } from 'lucide-react';
import {
  buildAppStorePrepCompletionReport,
  formatAppStorePrepCompletionReport,
} from '../utils/appStorePrepCompletionReport';

export function AppStorePrepCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const report = useMemo(() => buildAppStorePrepCompletionReport(), [reloadKey]);
  const formattedReport = useMemo(() => formatAppStorePrepCompletionReport(report), [report]);

  function handleReload() {
    setReloadKey((k) => k + 1);
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
    <div className="appStorePrepReportPanel">
      <div className={`appStorePrepReportHero appStorePrepReport-${report.status}`}>
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 12.6</p>
          <h3>App Store 提出準備 完成レポート</h3>
          <p>Phase 12の準備状況を1枚にまとめます。App Store Connect APIは呼びません。</p>
        </div>
      </div>

      <div className="appStorePrepReportControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`appStorePrepReportCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'レポートコピー'}
        </button>
        <span className={`appStorePrepReportStatusBadge status-${report.status}`}>{report.status}</span>
      </div>

      <div className="appStorePrepReportSummaryGrid">
        <section><h4>完了</h4><p>{report.completed.length}件</p></section>
        <section><h4>未完了</h4><p>{report.missing.length}件</p></section>
        <section><h4>警告</h4><p>{report.warnings.length}件</p></section>
        <section><h4>手動ゲート</h4><p>{report.manualGates.length}件</p></section>
      </div>

      {report.completed.length > 0 && (
        <div className="appStorePrepReportListBox appStorePrepReportCompletedBox">
          <strong>✅ 完了</strong>
          <ul>{report.completed.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      )}

      {report.missing.length > 0 && (
        <div className="appStorePrepReportListBox appStorePrepReportBlockersBox">
          <strong>🔴 未完了 / Blockers</strong>
          <ul>{report.missing.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="appStorePrepReportListBox appStorePrepReportWarningsBox">
          <strong>⚠️ Warnings</strong>
          <ul>{report.warnings.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      )}

      <div className="appStorePrepReportListBox appStorePrepReportManualBox">
        <strong>🔒 手動ゲート</strong>
        <ul>{report.manualGates.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>

      <div className="appStorePrepReportListBox appStorePrepReportActionsBox">
        <strong>次のアクション</strong>
        <ul>{report.nextActions.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
    </div>
  );
}
