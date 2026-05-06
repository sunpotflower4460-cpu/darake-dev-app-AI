import { useState } from 'react';
import { ShieldCheck, Check, Copy } from 'lucide-react';
import {
  checkNotificationSafetyGate,
  formatNotificationSafetyGateMarkdown,
} from '../utils/notificationSafetyGate';

type CopyState = 'idle' | 'copied' | 'failed';

export function NotificationSafetyGatePanel() {
  const [text, setText] = useState('');
  const [targetLabel, setTargetLabel] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const gate = checkNotificationSafetyGate(text, targetLabel);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatNotificationSafetyGateMarkdown(gate));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase26Panel">
      <div className="phase26Hero">
        <ShieldCheck />
        <div>
          <p className="eyebrow">Phase 26.3</p>
          <h3>Notification Safety Gate</h3>
          <p>通知文の安全確認を行います。実送信はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部送信なし・secret保存なし・安全ゲートのみ</strong>
      </div>

      <div className="phaseInfoBox">
        <strong>通知文を貼り付けて確認</strong>
        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            送信先ラベル（任意）
            <input
              className="phase26Select"
              value={targetLabel}
              onChange={(e) => setTargetLabel(e.target.value)}
              placeholder="例: Telegram 本番チャット"
              style={{ marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            通知文（ここに貼り付けてください）
            <textarea
              className="phase26Textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="通知文を貼り付けてください..."
              style={{ marginTop: 4 }}
            />
          </label>
        </div>
      </div>

      <div>
        <span className={`phase26StatusBadge ${gate.status}`}>{gate.status}</span>
      </div>

      <div className={gate.status === 'blocked' ? 'phaseBlockersBox' : gate.status === 'needs-review' ? 'phaseWarningsBox' : 'phaseInfoBox'}>
        <strong>{gate.message}</strong>
      </div>

      {gate.passItems.length > 0 && (
        <div className="phaseInfoBox">
          <strong>✅ Pass Items</strong>
          <ul>{gate.passItems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}

      {gate.warnings.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>⚠️ Warnings</strong>
          <ul>{gate.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
      )}

      {gate.blockers.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>🔴 Blockers</strong>
          <ul>{gate.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>人間が確認すること</strong>
        <ul>{gate.requiredHumanChecks.map((c) => <li key={c}>☐ {c}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Safety Memoコピー'}
        </button>
      </div>
    </div>
  );
}
