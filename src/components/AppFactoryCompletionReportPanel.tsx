import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, Rocket } from 'lucide-react';
import {
  buildAppFactoryCompletionReport,
  formatAppFactoryCompletionReportMarkdown,
} from '../utils/appFactoryCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function AppFactoryCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildAppFactoryCompletionReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAppFactoryCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase23Panel">
      <div className="phase23Hero">
        <Rocket />
        <div>
          <p className="eyebrow">Phase 23.5</p>
          <h3>アプリ工房 完成レポート</h3>
          <p>アプリ案の状況と今月の制作ロードマップを確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>📝 アプリ工房サマリー</strong>
      </div>

      <div className="phaseSummaryGrid">
        <section style={{ gridColumn: 'span 3' }}>
          <h4>登録アプリ案数</h4>
          <p style={{ fontSize: '2rem' }}>{report.totalIdeas}</p>
        </section>
      </div>

      <div className="phaseInfoBox">
        <strong>🏆 優先度上位</strong>
        {report.topPriorityApps.length > 0 ? (
          <ol>{report.topPriorityApps.map((a, i) => <li key={i}>{a}</li>)}</ol>
        ) : (
          <p>なし（アプリ案を登録してください）</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>⚡ すぐ作れる案</strong>
        {report.quickBuildApps.length > 0 ? (
          <ul>{report.quickBuildApps.map((a, i) => <li key={i}>{a}</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>💫 夢コア案</strong>
        {report.dreamCoreApps.length > 0 ? (
          <ul>{report.dreamCoreApps.map((a, i) => <li key={i}>{a}</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>💰 収益候補</strong>
        {report.revenueApps.length > 0 ? (
          <ul>{report.revenueApps.map((a, i) => <li key={i}>{a}</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>🚀 次にGitHub化する案</strong>
        <p style={{ fontWeight: 700, fontSize: '1rem' }}>{report.nextGitHubApp}</p>
      </div>

      <div className="phaseInfoBox">
        <strong>📅 今月の制作ロードマップ</strong>
        <ol>{report.thisMonthRoadmap.map((r, i) => <li key={i}>{r}</li>)}</ol>
      </div>

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
