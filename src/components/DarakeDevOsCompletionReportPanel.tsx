import { useMemo, useState } from 'react';
import { Check, Copy, Cpu, RefreshCcw } from 'lucide-react';
import {
  buildDarakeDevOsCompletionReport,
  formatDarakeDevOsCompletionReportMarkdown,
} from '../utils/darakeDevOsCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function DarakeDevOsCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildDarakeDevOsCompletionReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatDarakeDevOsCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const FEATURE_LABELS: Record<string, string> = {
    create: '✏️ Create（Issue・AutoRun・Phase計画）',
    run: '▶️ Run（CI・PR・Build監視）',
    watch: '👀 Watch（レビュー・承認）',
    screenshot: '📸 Screenshot（スクショ撮影・確認）',
    submit: '📦 Submit（App Store提出準備・管制室）',
    postRelease: '🚀 Post-Release（公開後運用）',
    portfolio: '🗂 Portfolio（複数アプリ管理）',
    templates: '🏭 Templates（テンプレ工場）',
    safety: '🛡 Safety（安全設定）',
  };

  return (
    <div className="phase18Panel">
      <div className="phase18Hero">
        <Cpu />
        <div>
          <p className="eyebrow">Phase 18.7</p>
          <h3>だらけ Dev OS 完成レポート</h3>
          <p>だらけ管制室全体の完成度を確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし</strong>
      </div>

      <div className="phaseSummaryGrid">
        <section style={{ gridColumn: 'span 3' }}>
          <h4>全体完成度</h4>
          <p style={{ fontSize: '2rem' }}>{report.completionPercent}%</p>
        </section>
      </div>

      <div className="phaseItemList">
        {Object.entries(report.features).map(([key, ok]) => (
          <div key={key} className="phaseItem" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>{ok ? '✅' : '❌'}</span>
              <span className="phaseItemTitle" style={{ fontSize: '0.88rem' }}>{FEATURE_LABELS[key] || key}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="phaseInfoBox">
        <strong>残り課題</strong>
        <ul>{report.remainingTasks.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </div>

      <div className="phaseInfoBox">
        <strong>次の大Phase</strong>
        <p style={{ fontWeight: 700, color: '#35513d' }}>{report.nextBigPhase}</p>
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
