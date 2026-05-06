import { useMemo, useState } from 'react';
import { Trophy, Check, Copy, RefreshCcw } from 'lucide-react';
import {
  buildExternalNotificationDryRunCompletionReport,
  formatExternalNotificationDryRunCompletionReportMarkdown,
} from '../utils/externalNotificationDryRunCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function ExternalNotificationDryRunCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildExternalNotificationDryRunCompletionReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatExternalNotificationDryRunCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase26Panel">
      <div className="phase26Hero">
        <Trophy />
        <div>
          <p className="eyebrow">Phase 26.6</p>
          <h3>External Notification Dry-run Completion Report</h3>
          <p>Phase 26全体の通知dry-run準備状況を1枚で確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ すべてmanual copy / dry-run / 外部送信なし・secret保存なし</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`phase26StatusBadge ${report.status}`}>{report.status}</span>
      </div>

      <div className="phase26SummaryGrid">
        <section>
          <h4>完了</h4>
          <p>{report.completed.length}</p>
        </section>
        <section>
          <h4>注意</h4>
          <p className={report.warnings.length > 0 ? 'warn' : ''}>{report.warnings.length}</p>
        </section>
        <section>
          <h4>Blockers</h4>
          <p className={report.blockers.length > 0 ? 'warn' : ''}>{report.blockers.length}</p>
        </section>
      </div>

      <div className="phaseInfoBox">
        <strong>完了項目</strong>
        <ul>{report.completed.map((item) => <li key={item}>✅ {item}</li>)}</ul>
      </div>

      {report.warnings.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>⚠️ Warnings</strong>
          <ul>{report.warnings.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}

      {report.blockers.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>🔴 Blockers</strong>
          <ul>{report.blockers.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>次におすすめ</strong>
        <p>{report.nextRecommendedPhase}</p>
      </div>

      <div className="phaseInfoBox">
        <strong>Next Actions</strong>
        <ul>{report.nextActions.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
