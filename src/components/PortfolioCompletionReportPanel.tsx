import { useEffect, useMemo, useState } from 'react';
import { BarChart2, Check, Copy, RefreshCcw } from 'lucide-react';
import { loadAppRegistry } from '../utils/appRegistry';
import { buildPortfolioDashboard } from '../utils/portfolioDashboard';
import {
  buildPortfolioCompletionReport,
  formatPortfolioCompletionReportMarkdown,
} from '../utils/portfolioCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function PortfolioCompletionReportPanel() {
  const [apps, setApps] = useState(loadAppRegistry());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setApps(loadAppRegistry());
  }, [reloadKey]);

  const dash = useMemo(() => buildPortfolioDashboard(apps), [apps]);
  const report = useMemo(() => buildPortfolioCompletionReport(apps, dash), [apps, dash]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatPortfolioCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase16Panel">
      <div className="phase16Hero">
        <BarChart2 />
        <div>
          <p className="eyebrow">Phase 16.6</p>
          <h3>ポートフォリオ 完成レポート</h3>
          <p>アプリ群全体の状態を1枚で確認します。</p>
        </div>
      </div>

      <div className="phaseSummaryGrid">
        <section><h4>全アプリ</h4><p>{report.totalApps}</p></section>
        <section><h4>開発中</h4><p>{report.developing}</p></section>
        <section><h4>提出準備</h4><p>{report.submissionPrep}</p></section>
        <section><h4>公開済み</h4><p>{report.released}</p></section>
        <section><h4>ブロック</h4><p>{report.blocked}</p></section>
        <section><h4>今日見るべき</h4><p>{report.todayFocusApps.length}</p></section>
      </div>

      {report.blocked > 0 && (
        <div className="phaseBlockersBox">
          <strong>🔴 ブロック中のアプリがあります</strong>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>今月の方針</strong>
        <p style={{ fontWeight: 700, color: '#35513d' }}>{report.monthlyPolicy}</p>
      </div>

      <div className="phaseInfoBox">
        <strong>おすすめ</strong>
        <ul>{report.nextRecommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

      {apps.length === 0 && (
        <div className="phaseInfoBox">
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>アプリが登録されていません。Phase 16.2で登録してください。</p>
        </div>
      )}

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
