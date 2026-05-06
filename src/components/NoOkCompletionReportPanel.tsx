import { useState } from 'react';
import { FileText, Copy, Check, RotateCcw } from 'lucide-react';
import {
  buildDefaultPhase33to35CompletionReport,
  formatNoOkCompletionReportMarkdown,
} from '../utils/noOkCompletionReport';
import type { NoOkCompletionReport } from '../utils/noOkCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

const STORAGE_KEY = 'darake.noOkCompletionReport.v1';

function loadReport(): NoOkCompletionReport {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultPhase33to35CompletionReport();
    return JSON.parse(raw) as NoOkCompletionReport;
  } catch {
    return buildDefaultPhase33to35CompletionReport();
  }
}

function saveReport(report: NoOkCompletionReport): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
  } catch {
    // ignore
  }
}

const STATUS_ICON: Record<NoOkCompletionReport['status'], string> = {
  ready: '✅',
  'needs-review': '⚠️',
  blocked: '🚫',
};

export function NoOkCompletionReportPanel() {
  const [report, setReport] = useState(() => loadReport());
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleReset() {
    const fresh = buildDefaultPhase33to35CompletionReport();
    saveReport(fresh);
    setReport(fresh);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatNoOkCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase35rPanel">
      <div className="phase35rHero">
        <FileText />
        <div>
          <p className="eyebrow">Phase 35.3</p>
          <h3>No-OK Completion Report</h3>
          <p>OK不要モード全体の完成状況をまとめます。</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span className={`phase35rStatusBadge ${report.status}`}>
          {STATUS_ICON[report.status]} {report.status}
        </span>
        <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{report.title}</span>
      </div>

      {report.completed.length > 0 && (
        <div className="phase35rSection">
          <h4>✅ 完了済み</h4>
          <ul className="phase35rList">
            {report.completed.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {report.autoProceedEnabled.length > 0 && (
        <div className="phase35rSection">
          <h4>⚡ 自動で進めてよいもの（OK不要）</h4>
          <ul className="phase35rList">
            {report.autoProceedEnabled.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {report.stillRequiresHuman.length > 0 && (
        <div className="phase35rSection">
          <h4>👤 人間確認が必要なもの（固定）</h4>
          <ul className="phase35rList" style={{ listStyle: 'none', padding: 0 }}>
            {report.stillRequiresHuman.map((h, i) => (
              <li key={i} style={{ background: 'rgba(220,80,80,0.05)', borderColor: 'rgba(220,80,80,0.14)', color: '#6a1a1a' }}>
                🔒 {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="phase35rSection">
          <h4>⚠️ Warning</h4>
          <ul className="phase35rList">
            {report.warnings.map((w, i) => <li key={i}>⚠️ {w}</li>)}
          </ul>
        </div>
      )}

      {report.blockers.length > 0 && (
        <div className="phase35rSection">
          <h4>🚫 Blocker</h4>
          <ul className="phase35rList">
            {report.blockers.map((b, i) => <li key={i}>🚫 {b}</li>)}
          </ul>
        </div>
      )}

      {report.nextRecommendedPhase && (
        <div className="phase35rSection">
          <h4>次フェーズ候補</h4>
          <p style={{ margin: 0, fontSize: '0.84rem' }}>{report.nextRecommendedPhase}</p>
        </div>
      )}

      {report.nextActions.length > 0 && (
        <div className="phase35rSection">
          <h4>次のアクション</h4>
          <ul className="phase35rList">
            {report.nextActions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <div className="phase35rBtnRow">
        <button className={`phase35rCopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} MDコピー
        </button>
        <button className="phase35rSmallBtn" onClick={handleReset}>
          <RotateCcw size={13} /> デフォルトに戻す
        </button>
      </div>
    </div>
  );
}
