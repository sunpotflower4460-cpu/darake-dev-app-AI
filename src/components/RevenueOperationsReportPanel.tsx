import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, TrendingUp } from 'lucide-react';
import {
  buildRevenueOperationsReport,
  formatRevenueOperationsReportMarkdown,
} from '../utils/revenueOperationsReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function RevenueOperationsReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildRevenueOperationsReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatRevenueOperationsReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase22Panel">
      <div className="phase22Hero">
        <TrendingUp />
        <div>
          <p className="eyebrow">Phase 22.5</p>
          <h3>収益・運用 レポート</h3>
          <p>収益化プラン・コスト・プロモーション状況を確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>📝 収益・運用メモ（投資・金融助言ではありません）</strong>
      </div>

      <div className="phaseSummaryGrid">
        <section>
          <h4>プラン数</h4>
          <p>{report.monetizationPlanCount}</p>
        </section>
        <section>
          <h4>未定項目</h4>
          <p>{report.undecidedItems.length}</p>
        </section>
        <section>
          <h4>Promotion</h4>
          <p>{report.launchPromotionAppCount}件</p>
        </section>
      </div>

      {report.undecidedItems.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>未定項目</strong>
          <ul>{report.undecidedItems.map((i, idx) => <li key={idx}>⚠️ {i}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>収益モデル</strong>
        <p>{report.monetizationModels.join(', ') || '未設定'}</p>
      </div>

      {report.costMemos.length > 0 && (
        <div className="phaseInfoBox">
          <strong>コストメモ</strong>
          <ul>{report.costMemos.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      )}

      {report.revenueMemos.length > 0 && (
        <div className="phaseInfoBox">
          <strong>収益見込みメモ</strong>
          <ul>{report.revenueMemos.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>次のおすすめ</strong>
        <ul>{report.nextRecommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
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
