import { useMemo, useState } from 'react';
import { Check, Copy, Trophy, RefreshCcw } from 'lucide-react';
import {
  buildPhase24IntegrationCompletionReport,
  formatPhase24CompletionMarkdown,
} from '../utils/phase24IntegrationCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function Phase24IntegrationCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildPhase24IntegrationCompletionReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatPhase24CompletionMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <Trophy />
        <div>
          <p className="eyebrow">Phase 24.7</p>
          <h3>Phase 24 統合完成レポート</h3>
          <p>統合点検・表示整理・安全監査の結果を一覧します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部API実行なし / GitHub API実行なし / secret保存なし</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`phase24StatusBadge ${report.status}`}>
          {report.status === 'healthy' ? '✅ healthy' : report.status === 'needs-review' ? '⚠️ needs-review' : '🔴 blocked'}
        </span>
      </div>

      <div className="phase24SummaryGrid">
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
        <strong>✅ Phase 24 完了項目</strong>
        <ul>{report.completed.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>

      {report.warnings.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>⚠️ 注意事項</strong>
          <ul>{report.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}

      {report.blockers.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>🔴 Blockers</strong>
          <ul>{report.blockers.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>🚀 次のおすすめPhase</strong>
        <p style={{ fontSize: '0.88rem', marginTop: 6 }}>{report.nextRecommendedPhase}</p>
      </div>

      <div className="phaseInfoBox">
        <strong>確認アクション</strong>
        <ul>{report.nextActions.map((a, i) => <li key={i}>{a}</li>)}</ul>
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
