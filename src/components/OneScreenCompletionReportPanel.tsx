import { useState } from 'react';
import { LayoutPanelTop, Copy, Check } from 'lucide-react';
import { loadOneScreenCommandState } from '../utils/oneScreenCommandState';
import { loadOneScreenSettings } from '../utils/oneScreenSettings';
import {
  buildOneScreenCompletionReport,
  formatOneScreenCompletionReportMarkdown,
} from '../utils/oneScreenCompletionReport';
import { ALL_PANELS } from '../utils/panelRegistry';
import { computeDetailsVisibility } from '../utils/detailsVisibilityPolicy';

type CopyState = 'idle' | 'copied' | 'failed';

function buildReport() {
  const state = loadOneScreenCommandState();
  const settings = loadOneScreenSettings();
  const visiblePanels = ALL_PANELS.filter(
    (p) => computeDetailsVisibility(p.id, p.tags, false).visible
  );
  const humanRequiredPanels = visiblePanels.filter(
    (p) => p.tags.includes('manual-gate') || p.tags.includes('blocked')
  );
  return buildOneScreenCompletionReport(
    state,
    settings,
    ALL_PANELS.length,
    visiblePanels.length,
    humanRequiredPanels.length
  );
}

export function OneScreenCompletionReportPanel() {
  const [report, setReport] = useState(() => buildReport());
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleRefresh() {
    setReport(buildReport());
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatOneScreenCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase38rPanel">
      <div className="phase38rHero">
        <LayoutPanelTop />
        <div>
          <p className="eyebrow">Phase 38.5</p>
          <h3>One Screen 完成レポート</h3>
          <p>1画面化の状態・安全確認・隠しているものを確認できます。</p>
        </div>
      </div>

      <div className="phase38rSection">
        <h4>1画面化状態</h4>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`phase38rStatusBadge ${report.safetyStatus}`}>
            {report.isOneScreenActive ? '✅ 1画面化有効' : '❌ 1画面化していない'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
          <div style={{ textAlign: 'center', background: 'rgba(40,180,140,0.05)', borderRadius: 10, padding: '10px 8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 3 }}>非表示パネル</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0c6a50' }}>{report.hiddenPanelCount}</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(40,180,140,0.05)', borderRadius: 10, padding: '10px 8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 3 }}>人間必須（前面）</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0c6a50' }}>{report.visibleHumanRequiredCount}</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(40,180,140,0.05)', borderRadius: 10, padding: '10px 8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 3 }}>安全状態</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: report.safetyStatus === 'safe' ? '#1a6040' : '#8b2020' }}>
              {report.safetyStatus}
            </div>
          </div>
        </div>
      </div>

      <div className="phase38rSection">
        <h4>安全確認</h4>
        <ul className="phase38rList">
          {report.safetyNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="phase38rSection">
        <h4>次におすすめ</h4>
        <p style={{ margin: 0, fontSize: '0.86rem', color: '#0c6a50' }}>
          {report.recommendation}
        </p>
      </div>

      <div className="phase38rBtnRow">
        <button className="phase38rSmallBtn" onClick={handleRefresh}>
          🔄 更新
        </button>
        <button className={`phase38rSmallBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} Markdownコピー
        </button>
      </div>
    </div>
  );
}
