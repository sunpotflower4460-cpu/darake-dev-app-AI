import { useState } from 'react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import {
  MANUAL_GATE_NOTIFICATION_TEMPLATES,
  formatManualGateTemplate,
} from '../utils/manualGateNotificationTemplates';

export function ManualGateNotificationTemplatePanel() {
  const [selectedId, setSelectedId] = useState<string>(MANUAL_GATE_NOTIFICATION_TEMPLATES[0].id);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const selected = MANUAL_GATE_NOTIFICATION_TEMPLATES.find((t) => t.id === selectedId);

  async function handleCopy() {
    if (!selected) return;
    const text = formatManualGateTemplate(selected);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  async function handleCopyShort() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.shortMessage);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="manualGateNotifPanel">
      <div className="manualGateNotifHero">
        <ShieldAlert />
        <div>
          <p className="eyebrow">Phase 11.4</p>
          <h3>手動ゲート通知テンプレート</h3>
          <p>テンプレートを選んで通知文をコピーできます。外部への送信はしません。</p>
        </div>
      </div>

      <div className="manualGateNotifSafetyBox">
        <strong>外部送信なし・APIキー入力なし</strong>
        <p>テンプレート選択と文面のコピーのみです。secret / APIキーは扱いません。</p>
      </div>

      <div className="manualGateNotifSelector">
        <label htmlFor="manualGateTemplateSelect">テンプレートを選ぶ：</label>
        <select
          id="manualGateTemplateSelect"
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setCopyState('idle');
          }}
        >
          {MANUAL_GATE_NOTIFICATION_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className={`manualGateNotifCard manualGateNotifCard-${selected.severity}`}>
          <div className="manualGateNotifCardHeader">
            <strong>{selected.label}</strong>
            <span className={`manualGateSeverityBadge sev-${selected.severity}`}>{selected.severity}</span>
          </div>
          <p className="manualGateNotifShort">{selected.shortMessage}</p>
          <p className="manualGateNotifDetail">{selected.detailedMessage}</p>
          <div className="manualGateNotifMeta">
            <div>
              <span>必要な人間のアクション</span>
              <p>{selected.requiredHumanAction}</p>
            </div>
            <div>
              <span>安全な次のステップ</span>
              <p>{selected.safeNextStep}</p>
            </div>
          </div>
          <div className="manualGateNotifActions">
            <button
              type="button"
              className={`manualGateCopyButton copy-${copyState}`}
              onClick={handleCopyShort}
            >
              {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
              短文コピー
            </button>
            <button
              type="button"
              className={`manualGateCopyButton copy-${copyState}`}
              onClick={handleCopy}
            >
              {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
              Markdown詳細コピー
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
