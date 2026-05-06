import { useState } from 'react';
import { Package, Check, Copy } from 'lucide-react';
import {
  buildNotificationPayloadDryRun,
  formatNotificationPayloadDryRunMarkdown,
} from '../utils/notificationPayloadDryRunBuilder';
import type { NotificationPayloadDryRunInput } from '../utils/notificationPayloadDryRunBuilder';
import type { NotificationDryRunTargetType } from '../utils/notificationDryRunTarget';

type CopyState = 'idle' | 'copied' | 'failed';

const TARGET_TYPES: NotificationDryRunTargetType[] = [
  'manual-copy',
  'telegram',
  'discord',
  'line',
  'email',
  'slack',
];

const SEVERITIES: NonNullable<NotificationPayloadDryRunInput['severity']>[] = [
  'info',
  'success',
  'warning',
  'manual-gate',
  'blocked',
];

export function NotificationPayloadDryRunBuilderPanel() {
  const [targetType, setTargetType] = useState<NotificationDryRunTargetType>('manual-copy');
  const [severity, setSeverity] = useState<NotificationPayloadDryRunInput['severity']>('info');
  const [title, setTitle] = useState('だらけ管制室からのお知らせ');
  const [appName, setAppName] = useState('ぷに相撲');
  const [phase, setPhase] = useState('Phase 26');
  const [action, setAction] = useState('内容を確認してください。');
  const [activeTab, setActiveTab] = useState<'short' | 'markdown' | 'plain' | 'json'>('short');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const payload = buildNotificationPayloadDryRun({ title, appName, phase, action, severity, targetType });

  const tabContent = {
    short: payload.shortMessage,
    markdown: payload.markdownMessage,
    plain: payload.plainTextMessage,
    json: payload.jsonPayload,
  };

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
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
        <Package />
        <div>
          <p className="eyebrow">Phase 26.2</p>
          <h3>Notification Payload Dry-run Builder</h3>
          <p>通知payloadを送信前に生成・確認できます。実送信はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ fetchしない・webhook送信しない・URL入力欄なし・secret入力欄なし</strong>
      </div>

      <div className="phaseInfoBox">
        <strong>設定</strong>
        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            送信先 (targetType)
            <select
              className="phase26Select"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as NotificationDryRunTargetType)}
              style={{ marginTop: 4 }}
            >
              {TARGET_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            severity
            <select
              className="phase26Select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as NotificationPayloadDryRunInput['severity'])}
              style={{ marginTop: 4 }}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            タイトル
            <input
              className="phase26Select"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            アプリ名
            <input
              className="phase26Select"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Phase
            <input
              className="phase26Select"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Action（指示文）
            <textarea
              className="phase26Textarea"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              rows={2}
              style={{ marginTop: 4 }}
            />
          </label>
        </div>
      </div>

      <div>
        <span className={`phase26StatusBadge ${payload.status}`}>{payload.status}</span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(['short', 'markdown', 'plain', 'json'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`phase24GroupBtn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        <div className="phase26MessageBox">{tabContent[activeTab]}</div>
      </div>

      {payload.requiredSecrets.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>⛔ 必要なsecret（外部管理 — アプリ内保存禁止）</strong>
          <ul>
            {payload.requiredSecrets.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      )}

      {payload.warnings.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>⚠️ Warnings</strong>
          <ul>
            {payload.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>Manual Checklist</strong>
        <ul>
          {payload.manualChecklist.map((c) => <li key={c}>☐ {c}</li>)}
        </ul>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={() => handleCopy(tabContent[activeTab])}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : `${activeTab}をコピー`}
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={() => handleCopy(formatNotificationPayloadDryRunMarkdown(payload))}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
