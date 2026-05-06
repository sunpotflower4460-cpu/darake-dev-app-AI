import { useState } from 'react';
import { ClipboardCheck, Copy, Check } from 'lucide-react';
import {
  loadDarakePreferenceSignals,
  buildDarakePreferenceProfile,
} from '../utils/darakePreferenceMemory';
import {
  buildDarakePreferenceCompletionReport,
  formatDarakePreferenceCompletionReportMarkdown,
} from '../utils/darakePreferenceCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function DarakePreferenceCompletionReportPanel() {
  const [report, setReport] = useState(() => {
    const signals = loadDarakePreferenceSignals();
    const profile = buildDarakePreferenceProfile(signals);
    return buildDarakePreferenceCompletionReport(profile, signals.length);
  });
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleRefresh() {
    const signals = loadDarakePreferenceSignals();
    const profile = buildDarakePreferenceProfile(signals);
    setReport(buildDarakePreferenceCompletionReport(profile, signals.length));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatDarakePreferenceCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase36rPanel">
      <div className="phase36rHero">
        <ClipboardCheck />
        <div>
          <p className="eyebrow">Phase 36.4</p>
          <h3>Preference 学習レポート</h3>
          <p>傾向学習の状態と、自動で隠しているものを確認できます。</p>
        </div>
      </div>

      <div className="phase36rSection">
        <h4>学習状態</h4>
        <span className={`phase36rStatusBadge ${report.learningActive ? 'active' : 'inactive'}`}>
          {report.learningActive ? '✅ 学習有効' : '❌ 未学習'}
        </span>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 8 }}>
          シグナル数: {report.signalCount}件
        </p>
      </div>

      {report.hidingTypes.length > 0 && (
        <div className="phase36rSection">
          <h4>非表示にするようになったもの</h4>
          <ul className="phase36rList">
            {report.hidingTypes.map((t) => (
              <li key={t}>🙈 {t}</li>
            ))}
          </ul>
        </div>
      )}

      {report.surfacingTypes.length > 0 && (
        <div className="phase36rSection">
          <h4>前に出すようになったもの</h4>
          <ul className="phase36rList">
            {report.surfacingTypes.map((t) => (
              <li key={t}>👆 {t}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="phase36rSection">
        <h4>安全上、絶対に隠さないもの</h4>
        <ul className="phase36rList">
          {report.alwaysVisibleTypes.map((t) => (
            <li key={t}>🔒 {t}</li>
          ))}
        </ul>
      </div>

      <div className="phase36rSection">
        <h4>次におすすめ</h4>
        <p style={{ fontSize: '0.86rem', color: '#0c5c2c', margin: 0 }}>
          {report.recommendation}
        </p>
      </div>

      <div className="phase36rBtnRow">
        <button className="phase36rSmallBtn" onClick={handleRefresh}>
          🔄 更新
        </button>
        <button className={`phase36rSmallBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} Markdownコピー
        </button>
      </div>
    </div>
  );
}
