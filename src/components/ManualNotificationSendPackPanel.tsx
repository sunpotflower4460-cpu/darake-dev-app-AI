import { useState } from 'react';
import { Send, Check, Copy } from 'lucide-react';
import {
  buildManualNotificationSendPack,
  formatManualNotificationSendPackMarkdown,
} from '../utils/manualNotificationSendPack';
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

export function ManualNotificationSendPackPanel() {
  const [title, setTitle] = useState('だらけ管制室からのお知らせ');
  const [targetType, setTargetType] = useState<NotificationDryRunTargetType>('manual-copy');
  const [messageToCopy, setMessageToCopy] = useState('');
  const [fallbackPlainText, setFallbackPlainText] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const status =
    messageToCopy.trim().length === 0
      ? 'needs-review'
      : (targetType === 'manual-copy' ? 'ready-to-send-manually' : 'needs-review');

  const pack = buildManualNotificationSendPack(
    title,
    targetType,
    messageToCopy,
    fallbackPlainText || messageToCopy,
    status,
  );

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
        <Send />
        <div>
          <p className="eyebrow">Phase 26.4</p>
          <h3>Manual Notification Send Pack</h3>
          <p>手動コピー送信用のパックを作ります。実送信はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部送信なし・webhook URL入力欄なし・secret入力欄なし</strong>
      </div>

      <div className="phaseInfoBox">
        <strong>設定</strong>
        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
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
            送信メッセージ（貼り付けまたは入力）
            <textarea
              className="phase26Textarea"
              value={messageToCopy}
              onChange={(e) => setMessageToCopy(e.target.value)}
              rows={5}
              placeholder="通知文を入力またはPayload Builderからコピーして貼り付けてください"
              style={{ marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Fallback Plain Text（省略可）
            <textarea
              className="phase26Textarea"
              value={fallbackPlainText}
              onChange={(e) => setFallbackPlainText(e.target.value)}
              rows={3}
              placeholder="省略した場合は送信メッセージと同じになります"
              style={{ marginTop: 4 }}
            />
          </label>
        </div>
      </div>

      <div>
        <span className={`phase26StatusBadge ${pack.status}`}>{pack.status}</span>
      </div>

      <div className="phaseInfoBox">
        <strong>送信手順</strong>
        <ol style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          {pack.sendSteps.map((step) => (
            <li key={step} style={{ fontSize: '0.84rem', lineHeight: 1.7 }}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="phaseWarningsBox">
        <strong>⛔ これが当てはまる場合は送らない</strong>
        <ul>
          {pack.stopIf.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>

      <div className="phaseInfoBox">
        <strong>送信後の記録テンプレート</strong>
        <div className="phase26MessageBox">{pack.afterSendRecordTemplate}</div>
      </div>

      <div className="phaseControls">
        <button
          type="button"
          className={`phaseCopyBtn copy-${copyState}`}
          onClick={() => handleCopy(pack.messageToCopy)}
          disabled={!pack.messageToCopy.trim()}
        >
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'メッセージをコピー'}
        </button>
        <button
          type="button"
          className={`phaseCopyBtn copy-${copyState}`}
          onClick={() => handleCopy(formatManualNotificationSendPackMarkdown(pack))}
        >
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
