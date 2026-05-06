import { useMemo, useState } from 'react';
import { Check, Copy, ShieldCheck, RefreshCcw } from 'lucide-react';
import {
  buildSafetyInvariantAudit,
  formatSafetyInvariantAuditMarkdown,
} from '../utils/safetyInvariantAudit';

type CopyState = 'idle' | 'copied' | 'failed';

export function SafetyInvariantAuditPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const audit = useMemo(() => buildSafetyInvariantAudit(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatSafetyInvariantAuditMarkdown(audit));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <ShieldCheck />
        <div>
          <p className="eyebrow">Phase 24.5</p>
          <h3>Safety Invariant Audit</h3>
          <p>Phase 1〜24に危険操作が混ざっていないか確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部API / GitHub API / Webhook / App Store Connect API / secret保存 —— すべてなし</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`phase24StatusBadge ${audit.status}`}>
          {audit.status === 'safe' ? '✅ safe' : audit.status === 'needs-review' ? '⚠️ needs-review' : '🔴 blocked'}
        </span>
      </div>

      <div className="phase24SummaryGrid">
        <section>
          <h4>✅ Pass</h4>
          <p>{audit.passItems.length}</p>
        </section>
        <section>
          <h4>⚠️ Review</h4>
          <p>{audit.reviewItems.length}</p>
        </section>
        <section>
          <h4>🔴 Blocked</h4>
          <p>{audit.blockedItems.length}</p>
        </section>
      </div>

      <div className="phaseInfoBox">
        <strong>固定安全方針（変えてはいけないもの）</strong>
        <ul className="phase24InvariantList">
          {audit.fixedInvariants.map((inv, i) => (
            <li key={i}>✅ {inv}</li>
          ))}
        </ul>
      </div>

      <div className="phaseInfoBox">
        <strong>✅ Pass ({audit.passItems.length}件)</strong>
        <ul>
          {audit.passItems.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.78rem', marginLeft: 6 }}>
                {item.evidence}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {audit.reviewItems.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>⚠️ Manual Gate / Review ({audit.reviewItems.length}件)</strong>
          <ul>
            {audit.reviewItems.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                <span style={{ color: 'var(--muted)', fontSize: '0.78rem', marginLeft: 6 }}>
                  {item.notes}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {audit.blockedItems.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>🔴 Blocked ({audit.blockedItems.length}件)</strong>
          <ul>
            {audit.blockedItems.map((item) => (
              <li key={item.id}>{item.label}: {item.notes}</li>
            ))}
          </ul>
        </div>
      )}

      {audit.warnings.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>Warnings</strong>
          <ul>{audit.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>次のアクション</strong>
        <ul>{audit.nextActions.map((a, i) => <li key={i}>{a}</li>)}</ul>
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
