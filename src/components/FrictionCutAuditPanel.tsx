import { useState } from 'react';
import { Scissors, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { detectFrictionItems, getFrictionTypeLabel } from '../utils/frictionDetector';
import { buildFrictionCutPlan } from '../utils/frictionCutPlan';

const frictionItems = detectFrictionItems();
const plan = buildFrictionCutPlan(frictionItems);

const SEVERITY_EMOJI: Record<string, string> = {
  high: '🔴',
  medium: '🟠',
  low: '🟢',
};

export function FrictionCutAuditPanel() {
  const [showAll, setShowAll] = useState(false);
  const [showDoNotCut, setShowDoNotCut] = useState(false);
  const [copied, setCopied] = useState(false);

  const visibleItems = showAll ? frictionItems : frictionItems.filter((f) => f.severity === 'high');
  const autoHideItems = frictionItems.filter((f) => f.canAutoHide && !f.mustKeepVisibleForSafety);
  const safetyItems = frictionItems.filter((f) => f.mustKeepVisibleForSafety);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(plan.summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="phase43Panel">
      <div className="phase43Hero">
        <Scissors size={22} color="#555" />
        <div>
          <strong style={{ fontSize: '1rem' }}>手間ゼロ監査</strong>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Phase 43</div>
        </div>
      </div>

      <div className={`phase43SummaryCard ${plan.status}`}>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
          {plan.status === 'ready' ? '✅ 削る準備OK' : '⚠️ 要確認'}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#555' }}>
          まだ人間の手間があります: {frictionItems.length}件
        </div>
        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>
          自動で隠せる: {autoHideItems.length}件 / 安全上残す: {safetyItems.length}件
        </div>
      </div>

      <div className="phase43SectionTitle">
        {showAll ? '手間一覧（全件）' : '一番削るべきもの（high）'}
      </div>
      <ul className="phase43FrictionList">
        {visibleItems.map((item) => (
          <li key={item.id} className={`phase43FrictionItem ${item.severity}`}>
            <div className="phase43FrictionLabel">
              {SEVERITY_EMOJI[item.severity]} {item.label}
              {item.canAutoHide && !item.mustKeepVisibleForSafety && (
                <span className="phase43AutoHideTag" style={{ marginLeft: 6 }}>自動非表示可</span>
              )}
              {item.mustKeepVisibleForSafety && (
                <span className="phase43SafetyTag" style={{ marginLeft: 6 }}>安全上残す</span>
              )}
            </div>
            <div className="phase43FrictionMeta">{getFrictionTypeLabel(item.type)} — {item.where}</div>
            <div className="phase43FrictionCut">おすすめ: {item.suggestedCut}</div>
          </li>
        ))}
      </ul>

      <div className="phase43BtnRow">
        <button className="phase43Btn" onClick={() => setShowAll((v) => !v)}>
          {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showAll ? '高severityのみ表示' : '全件表示'}
        </button>
        <button className="phase43Btn" onClick={() => setShowDoNotCut((v) => !v)}>
          {showDoNotCut ? '安全項目を閉じる' : '安全上残すものを見る'}
        </button>
        <button className="phase43Btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>

      {showDoNotCut && (
        <div style={{ marginTop: 12, background: '#fff0f0', borderRadius: 14, padding: '12px 14px' }}>
          <div className="phase43SectionTitle" style={{ color: '#c62828' }}>削らないもの（安全）</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {plan.doNotCut.map((d, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#c62828' }}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
