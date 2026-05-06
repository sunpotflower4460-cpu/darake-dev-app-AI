import { useState } from 'react';
import { Navigation, Copy, Check } from 'lucide-react';
import { buildShortestDarakePath, formatShortestDarakePathMarkdown } from '../utils/shortestDarakePath';
import type { ShortestDarakePathStep } from '../utils/shortestDarakePath';

type CopyState = 'idle' | 'copied' | 'failed';

const TYPE_EMOJI: Record<ShortestDarakePathStep['type'], string> = {
  'auto-local': '⚙️',
  batch: '📦',
  'manual-copy': '📋',
  'manual-gate': '🔑',
  blocked: '🚫',
};

const EFFORT_LABEL: Record<ShortestDarakePathStep['humanEffort'], string> = {
  none: 'なし',
  'almost-none': 'ほぼなし',
  'copy-paste': 'コピペだけ',
  'quick-check': 'さっと確認',
  'manual-gate': '要確認',
};

export function ShortestDarakePathPanel() {
  const [path, setPath] = useState(() => buildShortestDarakePath());
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleRefresh() {
    setPath(buildShortestDarakePath());
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatShortestDarakePathMarkdown(path));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const statusEmoji = path.status === 'clear' ? '😴' : path.status === 'blocked' ? '🚫' : '👤';

  return (
    <div className="phase37Panel">
      <div className="phase37Hero">
        <Navigation />
        <div>
          <p className="eyebrow">Phase 37.3</p>
          <h3>最短だらけルート</h3>
          <p>完成までの最短ルートを表示します。</p>
        </div>
      </div>

      <div className="phase37CountGrid">
        <section>
          <h4>自動でよい</h4>
          <p>{path.autoCanDoCount}</p>
        </section>
        <section>
          <h4>人間が必要</h4>
          <p style={{ color: path.humanMustDoCount > 0 ? '#8a5e12' : undefined }}>
            {path.humanMustDoCount}
          </p>
        </section>
      </div>

      <div className="phase37PathCard">
        <h4>だらけ結論 {statusEmoji}</h4>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#4a2e00', fontWeight: 600 }}>
          {path.canBeLazySummary}
        </p>
      </div>

      <div className="phase37Section">
        <h4>ステップ一覧</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          {path.steps.map((step, i) => (
            <div key={step.id} className="phase37PathStep" style={{ borderBottom: i < path.steps.length - 1 ? '1px solid rgba(185,130,46,0.12)' : 'none' }}>
              <span className="phase37PathStepNum">{i + 1}.</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0c3a8a' }}>
                  {TYPE_EMOJI[step.type]} {step.label}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: 2 }}>
                  人間の手間: {EFFORT_LABEL[step.humanEffort]}
                  {step.canSkipForNow && ' · 今スキップ可'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="phase37Section">
        <h4>今は見なくてよいもの</h4>
        <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)' }}>
          {path.steps.filter((s) => s.canSkipForNow).length > 0
            ? path.steps.filter((s) => s.canSkipForNow).map((s) => s.label).join(', ')
            : '（今スキップできるものはありません）'}
        </p>
      </div>

      <div className="phase37BtnRow">
        <button className="phase37SmallBtn" onClick={handleRefresh}>
          🔄 更新
        </button>
        <button className={`phase37CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} コピー
        </button>
      </div>
    </div>
  );
}
