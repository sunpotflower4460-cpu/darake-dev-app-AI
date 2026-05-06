import { useState } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import {
  buildWebhookPayloadDraft,
  formatWebhookPayloadDraftMarkdown,
} from '../utils/webhookPayloadDraft';
import { ExternalNotificationChannelType } from '../utils/externalNotificationChannels';

type CopyState = 'idle' | 'copied' | 'failed';

const CHANNEL_TYPES: ExternalNotificationChannelType[] = [
  'telegram', 'discord', 'slack', 'line', 'email', 'manual-copy', 'other',
];

export function WebhookPayloadDraftPanel() {
  const [channelType, setChannelType] = useState<ExternalNotificationChannelType>('discord');
  const [message, setMessage] = useState('だらけ管制室からの通知\n\nアプリのフェーズが完了しました。');
  const [title, setTitle] = useState('フェーズ完了通知');
  const [copyJsonState, setCopyJsonState] = useState<CopyState>('idle');
  const [copyMdState, setCopyMdState] = useState<CopyState>('idle');

  const draft = buildWebhookPayloadDraft(channelType, message, title);

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(draft.payloadJson);
      setCopyJsonState('copied');
      window.setTimeout(() => setCopyJsonState('idle'), 1800);
    } catch {
      setCopyJsonState('failed');
      window.setTimeout(() => setCopyJsonState('idle'), 2400);
    }
  }

  async function handleCopyMd() {
    try {
      await navigator.clipboard.writeText(formatWebhookPayloadDraftMarkdown(draft));
      setCopyMdState('copied');
      window.setTimeout(() => setCopyMdState('idle'), 1800);
    } catch {
      setCopyMdState('failed');
      window.setTimeout(() => setCopyMdState('idle'), 2400);
    }
  }

  return (
    <div className="phase19Panel">
      <div className="phase19Hero">
        <Send />
        <div>
          <p className="eyebrow">Phase 19.3</p>
          <h3>Webhook Payload 下書き</h3>
          <p>Webhook用payloadの下書きを作ります。送信はしません。コピーして手動送信してください。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ Webhook自動送信なし・URL入力欄なし・secret保存なし</strong>
        <p>status: draft-only — JSONをコピーして外部ツールで手動送信してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>設定</legend>
          <label>
            通知タイトル
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: フェーズ完了通知" />
          </label>
          <label>
            チャンネルタイプ
            <select value={channelType} onChange={(e) => setChannelType(e.target.value as ExternalNotificationChannelType)}>
              {CHANNEL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            メッセージ
            <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="通知メッセージを入力" />
          </label>
        </fieldset>
      </div>

      <div className="phaseInfoBox">
        <strong>必要な Secret（外部管理）</strong>
        {draft.requiredSecrets.length > 0 ? (
          <ul>{draft.requiredSecrets.map((s, i) => <li key={i}>⛔ {s}（外部secret管理ツールで設定）</li>)}</ul>
        ) : (
          <p>secret不要</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>手動送信手順</strong>
        <ol>{draft.manualGate.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </div>

      <div className="phaseInfoBox">
        <strong>Payload JSON プレビュー（コピー用）</strong>
        <pre className="phase19CodeBox">{draft.payloadJson}</pre>
      </div>

      <div className="phaseInfoBox">
        <strong>Markdown メッセージ</strong>
        <pre className="phase19CodeBox">{draft.markdownMessage}</pre>
      </div>

      <div className="phaseBlockersBox">
        <strong>ブロック理由</strong>
        <ul>{draft.blockedReasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyJsonState}`} onClick={handleCopyJson}>
          {copyJsonState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          JSONコピー
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyMdState}`} onClick={handleCopyMd}>
          {copyMdState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          Markdownコピー
        </button>
      </div>
    </div>
  );
}
