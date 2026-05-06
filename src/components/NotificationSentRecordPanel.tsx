import { useState } from 'react';
import { ClipboardList, Check, Copy, Plus, Trash2 } from 'lucide-react';
import {
  loadNotificationSentRecords,
  saveNotificationSentRecords,
  addNotificationSentRecord,
  updateNotificationSentRecord,
  clearNotificationSentRecords,
  buildInitialNotificationSentRecord,
  formatNotificationSentRecordMarkdown,
  summarizeNotificationSentRecords,
} from '../utils/notificationSentRecord';
import type { NotificationSentRecord, NotificationSentRecordStatus } from '../utils/notificationSentRecord';
import type { NotificationDryRunTargetType } from '../utils/notificationDryRunTarget';

type CopyState = 'idle' | 'copied' | 'failed';

const STATUSES: NotificationSentRecordStatus[] = [
  'draft',
  'sent-manually',
  'skipped',
  'failed',
  'needs-follow-up',
];

const TARGET_TYPES: NotificationDryRunTargetType[] = [
  'manual-copy',
  'telegram',
  'discord',
  'line',
  'email',
  'slack',
];

export function NotificationSentRecordPanel() {
  const [records, setRecords] = useState<NotificationSentRecord[]>(() => loadNotificationSentRecords());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NotificationSentRecord>(() => buildInitialNotificationSentRecord());
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleNew() {
    const newRecord = buildInitialNotificationSentRecord();
    setDraft(newRecord);
    setEditingId(newRecord.id);
  }

  function handleSave() {
    const updated = addNotificationSentRecord(records, draft);
    setRecords(updated);
    saveNotificationSentRecords(updated);
    setEditingId(null);
  }

  function handleStatusChange(id: string, status: NotificationSentRecordStatus) {
    const updated = updateNotificationSentRecord(records, id, { status });
    setRecords(updated);
    saveNotificationSentRecords(updated);
  }

  function handleClear() {
    if (window.confirm('すべての送信記録を削除しますか？')) {
      setRecords(clearNotificationSentRecords());
    }
  }

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
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 26.5</p>
          <h3>Notification Sent Record</h3>
          <p>手動通知後の送信記録を残します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部送信なし・secret保存なし・人間が手動で送信した記録のみ</strong>
      </div>

      <div className="phase26SummaryGrid">
        <section>
          <h4>合計</h4>
          <p>{records.length}</p>
        </section>
        <section>
          <h4>sent</h4>
          <p>{records.filter((r) => r.status === 'sent-manually').length}</p>
        </section>
        <section>
          <h4>failed</h4>
          <p>{records.filter((r) => r.status === 'failed').length}</p>
        </section>
        <section>
          <h4>follow-up</h4>
          <p>{records.filter((r) => r.followUpNeeded).length}</p>
        </section>
      </div>

      {editingId === draft.id && (
        <div className="phaseInfoBox">
          <strong>新しい記録</strong>
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              タイトル
              <input
                className="phase26Select"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                style={{ marginTop: 4 }}
              />
            </label>
            <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              送信先
              <select
                className="phase26Select"
                value={draft.targetType}
                onChange={(e) => setDraft({ ...draft, targetType: e.target.value as NotificationDryRunTargetType })}
                style={{ marginTop: 4 }}
              >
                {TARGET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              送信先ラベル
              <input
                className="phase26Select"
                value={draft.destinationLabel}
                onChange={(e) => setDraft({ ...draft, destinationLabel: e.target.value })}
                placeholder="例: Telegram 管制室チャット"
                style={{ marginTop: 4 }}
              />
            </label>
            <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              status
              <select
                className="phase26Select"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as NotificationSentRecordStatus })}
                style={{ marginTop: 4 }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              メッセージ概要
              <textarea
                className="phase26Textarea"
                value={draft.messageSummary}
                onChange={(e) => setDraft({ ...draft, messageSummary: e.target.value })}
                rows={2}
                style={{ marginTop: 4 }}
              />
            </label>
            <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={draft.followUpNeeded}
                onChange={(e) => setDraft({ ...draft, followUpNeeded: e.target.checked })}
              />
              フォローアップが必要
            </label>
            {draft.followUpNeeded && (
              <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                フォローアップメモ
                <textarea
                  className="phase26Textarea"
                  value={draft.followUpNotes}
                  onChange={(e) => setDraft({ ...draft, followUpNotes: e.target.value })}
                  rows={2}
                  style={{ marginTop: 4 }}
                />
              </label>
            )}
            <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              メモ
              <textarea
                className="phase26Textarea"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                rows={2}
                style={{ marginTop: 4 }}
              />
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="phaseCopyBtn copy-idle" onClick={handleSave}>
                保存
              </button>
              <button type="button" onClick={() => setEditingId(null)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="phaseInfoBox">
          <p>まだ送信記録がありません。手動で通知を送った後に記録してください。</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {records.map((r) => (
            <div key={r.id} className="phaseInfoBox">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <strong>{r.title || '(無題)'}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                    {r.targetType} → {r.destinationLabel || '(未設定)'} ｜ {r.sentAt.slice(0, 16).replace('T', ' ')}
                  </div>
                  {r.messageSummary && (
                    <div style={{ fontSize: '0.78rem', marginTop: 4 }}>{r.messageSummary}</div>
                  )}
                  {r.followUpNeeded && (
                    <div style={{ fontSize: '0.78rem', color: '#8a5e12', marginTop: 4 }}>
                      ⚠️ フォローアップ必要: {r.followUpNotes || '（詳細なし）'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span className={`phase26StatusBadge ${r.status}`}>{r.status}</span>
                  <button type="button" onClick={() => handleCopy(formatNotificationSentRecordMarkdown(r))} title="コピー">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`phase24GroupBtn ${r.status === s ? 'active' : ''}`}
                    onClick={() => handleStatusChange(r.id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="phaseControls">
        <button type="button" onClick={handleNew}>
          <Plus size={16} /> 新しい記録を追加
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={() => handleCopy(summarizeNotificationSentRecords(records))}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'サマリーコピー'}
        </button>
        {records.length > 0 && (
          <button type="button" onClick={handleClear} style={{ color: '#8b2020' }}>
            <Trash2 size={16} /> 全記録を削除
          </button>
        )}
      </div>
    </div>
  );
}
