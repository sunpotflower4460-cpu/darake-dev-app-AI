import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  computeDetailsVisibility,
  summarizeDetailsVisibilityDecisions,
} from '../utils/detailsVisibilityPolicy';
import { ALL_PANELS } from '../utils/panelRegistry';

export function DetailsVisibilityPolicyPanel() {
  const [showAllOverride, setShowAllOverride] = useState(false);
  const [userOpenedIds, setUserOpenedIds] = useState<Set<string>>(new Set());

  const decisions = ALL_PANELS.map((p) =>
    computeDetailsVisibility(p.id, p.tags, userOpenedIds.has(p.id) || showAllOverride)
  );

  const hiddenDecisions = decisions.filter((d) => !d.visible);
  const visibleDecisions = decisions.filter((d) => d.visible);

  function togglePanel(id: string) {
    setUserOpenedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const summary = summarizeDetailsVisibilityDecisions(decisions);

  return (
    <div className="phase38vPanel">
      <div className="phase38vHero">
        <EyeOff />
        <div>
          <p className="eyebrow">Phase 38.3</p>
          <h3>Details Visibility Policy</h3>
          <p>詳細パネルを常時表示せず、必要な時だけ見せます。</p>
        </div>
      </div>

      <div className="phase38vSection">
        <h4>現在の状態</h4>
        <p style={{ margin: 0, fontSize: '0.86rem', color: '#2a1a8a' }}>{summary}</p>
      </div>

      <div className="phase38vSection">
        <h4>非表示にしているパネル（{hiddenDecisions.length}件）</h4>
        <div style={{ display: 'grid', gap: 6 }}>
          {hiddenDecisions.slice(0, 10).map((d) => (
            <div key={d.panelId} className="phase38vDecisionCard hidden">
              <span style={{ fontSize: '0.82rem', color: '#555' }}>
                🙈 {d.panelId}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                {d.whenToShow}
              </span>
            </div>
          ))}
          {hiddenDecisions.length > 10 && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
              …他{hiddenDecisions.length - 10}件
            </p>
          )}
          {hiddenDecisions.length === 0 && (
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)' }}>
              （なし）
            </p>
          )}
        </div>
      </div>

      <div className="phase38vSection">
        <h4>表示中のパネル（{visibleDecisions.length}件）</h4>
        <div style={{ display: 'grid', gap: 6 }}>
          {visibleDecisions.slice(0, 6).map((d) => (
            <div key={d.panelId} className="phase38vDecisionCard visible">
              <span style={{ fontSize: '0.82rem', color: '#1a3a8a' }}>
                👁 {d.panelId}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#555' }}>
                {d.reason}
              </span>
            </div>
          ))}
          {visibleDecisions.length > 6 && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
              …他{visibleDecisions.length - 6}件
            </p>
          )}
        </div>
      </div>

      <div className="phase38vBtnRow">
        <button
          className={`phase38vSmallBtn ${showAllOverride ? 'active' : ''}`}
          onClick={() => setShowAllOverride(!showAllOverride)}
        >
          {showAllOverride ? <Eye size={13} /> : <EyeOff size={13} />}
          {showAllOverride ? '通常表示に戻す' : '一時的に全部表示'}
        </button>
      </div>
    </div>
  );
}
