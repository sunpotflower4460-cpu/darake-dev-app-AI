import { useState } from 'react';
import { Bell, Check, Copy, RefreshCcw, Trash2 } from 'lucide-react';
import {
  ExternalNotificationChannel,
  buildInitialExternalNotificationChannel,
  loadExternalNotificationChannels,
  saveExternalNotificationChannels,
  formatExternalNotificationChannels,
} from '../utils/externalNotificationChannels';

type CopyState = 'idle' | 'copied' | 'failed';

export function ExternalNotificationChannelPanel() {
  const [channels, setChannels] = useState<ExternalNotificationChannel[]>(loadExternalNotificationChannels);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  function handleChange<K extends keyof ExternalNotificationChannel>(
    id: string,
    key: K,
    value: ExternalNotificationChannel[K],
  ) {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
  }

  function handleAdd() {
    setChannels((prev) => [...prev, buildInitialExternalNotificationChannel()]);
  }

  function handleDelete(id: string) {
    setChannels((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSave() {
    saveExternalNotificationChannels(channels);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  function handleReset() {
    const fresh = loadExternalNotificationChannels();
    setChannels(fresh);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatExternalNotificationChannels(channels));
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
        <Bell />
        <div>
          <p className="eyebrow">Phase 19.1-19.2</p>
          <h3>外部通知チャンネル管理</h3>
          <p>通知先候補を整理します。Webhook送信はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ Webhook送信なし・secret保存なし・token入力欄なし</strong>
        <p>このパネルは通知先候補の整理のみを行います。実送信は外部ツールで手動実行してください。</p>
      </div>

      <div className="phase19ChannelList">
        {channels.map((ch) => (
          <div key={ch.id} className="phase19ChannelItem">
            <div className="phase19ChannelHeader">
              <span className={`phaseStatusBadge phaseStatusBadge-${ch.status === 'candidate' ? 'ok' : ch.status === 'blocked' ? 'blocked' : ch.status === 'manual-only' ? 'warning' : 'draft'}`}>
                {ch.status}
              </span>
              <span className="phase19ChannelType">{ch.type}</span>
              <button type="button" className="phase19DeleteBtn" onClick={() => handleDelete(ch.id)} aria-label="削除">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="phaseForm">
              <label>
                ラベル
                <input value={ch.label} onChange={(e) => handleChange(ch.id, 'label', e.target.value)} placeholder="例: Telegram通知" />
              </label>
              <label>
                タイプ
                <select value={ch.type} onChange={(e) => handleChange(ch.id, 'type', e.target.value as ExternalNotificationChannel['type'])}>
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                  <option value="line">LINE</option>
                  <option value="email">Email</option>
                  <option value="slack">Slack</option>
                  <option value="manual-copy">手動コピー</option>
                  <option value="other">その他</option>
                </select>
              </label>
              <label>
                ステータス
                <select value={ch.status} onChange={(e) => handleChange(ch.id, 'status', e.target.value as ExternalNotificationChannel['status'])}>
                  <option value="draft">下書き</option>
                  <option value="manual-only">手動のみ</option>
                  <option value="candidate">候補</option>
                  <option value="blocked">ブロック</option>
                </select>
              </label>
              <label>
                説明
                <textarea rows={2} value={ch.description} onChange={(e) => handleChange(ch.id, 'description', e.target.value)} placeholder="通知先の説明" />
              </label>
              <div className="phase19SecretInfo">
                <span>secret必要: <strong>{ch.requiresSecret ? 'はい' : 'いいえ'}</strong></span>
                {ch.requiresSecret && (
                  <span className="phase19SecretWarning">⛔ 外部secret管理が必要（このアプリには保存しない）</span>
                )}
              </div>
              <label>
                ノート
                <input value={ch.notes} onChange={(e) => handleChange(ch.id, 'notes', e.target.value)} placeholder="メモ" />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleAdd}>
          + チャンネル追加
        </button>
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '保存'}
        </button>
        <button type="button" onClick={handleReset}>
          <RefreshCcw size={16} /> リセット
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
