import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, LayoutDashboard, RefreshCcw } from 'lucide-react';
import { loadAppRegistry } from '../utils/appRegistry';
import {
  buildPortfolioDashboard,
  formatPortfolioDashboardMarkdown,
} from '../utils/portfolioDashboard';

type CopyState = 'idle' | 'copied' | 'failed';

export function PortfolioDashboardPanel() {
  const [apps, setApps] = useState(loadAppRegistry());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setApps(loadAppRegistry());
  }, [reloadKey]);

  const dash = useMemo(() => buildPortfolioDashboard(apps), [apps]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatPortfolioDashboardMarkdown(dash));
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
        <LayoutDashboard />
        <div>
          <p className="eyebrow">Phase 16.3</p>
          <h3>ポートフォリオ ダッシュボード</h3>
          <p>複数アプリの状況を一目で確認します。</p>
        </div>
      </div>

      <div className="phaseSummaryGrid">
        <section><h4>全アプリ</h4><p>{dash.totalApps}</p></section>
        <section><h4>アイデア</h4><p>{dash.ideaCount}</p></section>
        <section><h4>開発中</h4><p>{dash.developmentCount}</p></section>
        <section><h4>提出準備</h4><p>{dash.submissionPrepCount}</p></section>
        <section><h4>公開済み</h4><p>{dash.releasedCount}</p></section>
        <section><h4>ブロック</h4><p>{dash.blockedCount}</p></section>
      </div>

      {dash.todayApps.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>🔴 今日見るべきもの ({dash.todayApps.length}件)</strong>
          <ul>{dash.todayApps.map((a) => <li key={a.id}>{a.name}: {a.riskLevel}</li>)}</ul>
        </div>
      )}

      {dash.staleApps.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>💤 放置気味のアプリ ({dash.staleApps.length}件)</strong>
          <ul>{dash.staleApps.map((a) => <li key={a.id}>{a.name}</li>)}</ul>
        </div>
      )}

      {dash.nextProgressApps.length > 0 && (
        <div className="phaseInfoBox">
          <strong>🚀 次に進めると良いアプリ</strong>
          <ul>
            {dash.nextProgressApps.map((a) => (
              <li key={a.id}>{a.name}: {a.nextAction || '要確認'}</li>
            ))}
          </ul>
        </div>
      )}

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
