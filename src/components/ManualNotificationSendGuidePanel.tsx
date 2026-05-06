import { useState } from 'react';
import { Check, Copy, MessageSquare } from 'lucide-react';
import {
  ManualSendTarget,
  buildManualNotificationSendGuide,
  formatManualNotificationSendGuideMarkdown,
} from '../utils/manualNotificationSendGuide';

type CopyState = 'idle' | 'copied' | 'failed';

const TARGETS: { value: ManualSendTarget; label: string }[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
  { value: 'line', label: 'LINE' },
  { value: 'email', label: 'Email' },
  { value: 'slack', label: 'Slack' },
  { value: 'other', label: 'その他' },
];

export function ManualNotificationSendGuidePanel() {
  const [target, setTarget] = useState<ManualSendTarget>('telegram');
  const [message, setMessage] = useState('だらけ管制室からのお知らせ\n\nフェーズが完了しました。確認してください。');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const guide = buildManualNotificationSendGuide(target, message);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatManualNotificationSendGuideMarkdown(guide));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(guide.copyText);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase19Panel">
      <div className="phase19Hero">
        <MessageSquare />
        <div>
          <p className="eyebrow">Phase 19.4</p>
          <h3>手動通知 送信ガイド</h3>
          <p>通知文を手動で送るためのガイドです。自動送信はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 自動送信なし・外部API呼び出しなし</strong>
        <p>メッセージをコピーして各アプリで手動送信してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>設定</legend>
          <label>
            送信先
            <select value={target} onChange={(e) => setTarget(e.target.value as ManualSendTarget)}>
              {TARGETS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label>
            送信メッセージ
            <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="送信するメッセージを入力" />
          </label>
        </fieldset>
      </div>

      <div className="phaseInfoBox">
        <strong>{guide.label}</strong>
        <ol>{guide.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </div>

      <div className="phaseInfoBox">
        <strong>コピー用メッセージ</strong>
        <pre className="phase19CodeBox">{guide.copyText}</pre>
      </div>

      <div className="phaseWarningsBox">
        <strong>注意</strong>
        <ul>{guide.warnings.map((w, i) => <li key={i}>⚠️ {w}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopyMessage}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          メッセージコピー
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          手順全体コピー
        </button>
      </div>
    </div>
  );
}
