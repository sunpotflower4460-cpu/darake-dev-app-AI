import { useState } from 'react';
import { Inbox, Copy, Check, Plus, Trash2 } from 'lucide-react';
import {
  loadDarakeReviewInbox,
  saveDarakeReviewInbox,
  buildDarakeReviewInboxItem,
  rankDarakeReviewInboxItems,
  summarizeDarakeReviewInbox,
  formatDarakeReviewInboxMarkdown,
  INBOX_TYPE_LABELS,
  PRIORITY_ICONS,
  STATUS_LABELS,
} from '../utils/darakeReviewInbox';
import type {
  DarakeReviewInboxItem,
  DarakeReviewInboxItemType,
} from '../utils/darakeReviewInbox';

type CopyState = 'idle' | 'copied' | 'failed';

const ITEM_TYPES: DarakeReviewInboxItemType[] = [
  'manual-gate',
  'blocked',
  'needs-human-choice',
  'app-store-submit',
  'secret-required',
  'production-risk',
  'failed-check',
  'optional-review',
];

const PRIORITIES: DarakeReviewInboxItem['priority'][] = ['urgent', 'high', 'medium', 'low'];

export function DarakeReviewInboxPanel() {
  const [items, setItems] = useState(() => loadDarakeReviewInbox());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newType, setNewType] = useState<DarakeReviewInboxItemType>('manual-gate');
  const [newPriority, setNewPriority] = useState<DarakeReviewInboxItem['priority']>('medium');
  const [newRecommendedAction, setNewRecommendedAction] = useState('');

  function save(updated: DarakeReviewInboxItem[]) {
    saveDarakeReviewInbox(updated);
    setItems(updated);
  }

  function handleAdd() {
    if (!newTitle.trim() || !newSummary.trim()) return;
    const item = buildDarakeReviewInboxItem({
      type: newType,
      title: newTitle.trim(),
      summary: newSummary.trim(),
      priority: newPriority,
      recommendedAction: newRecommendedAction.trim(),
    });
    save([item, ...items]);
    setNewTitle('');
    setNewSummary('');
    setNewRecommendedAction('');
  }

  function handleUpdateStatus(id: string, status: DarakeReviewInboxItem['status']) {
    save(items.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  function handleDelete(id: string) {
    save(items.filter((i) => i.id !== id));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatDarakeReviewInboxMarkdown(items));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const ranked = rankDarakeReviewInboxItems(items);
  const unread = items.filter((i) => i.status === 'unread');
  const urgent = items.filter((i) => i.priority === 'urgent' && i.status === 'unread');

  return (
    <div className="phase35Panel">
      <div className="phase35Hero">
        <Inbox />
        <div>
          <p className="eyebrow">Phase 35 / 35.1</p>
          <h3>Darake Review Inbox</h3>
          <p>人間が見る必要があるものだけをInboxにまとめます。毎回OKではなく、必要なものだけ後でまとめて見ます。</p>
        </div>
      </div>

      <div className="phase35SafetyBox">
        🔒 ここでの操作はlocalStorage記録のみです。外部実行・API呼び出し・secret保存はしません。
      </div>

      <div className="phase35SummaryGrid">
        <section><h4>合計</h4><p>{items.length}</p></section>
        <section><h4>未読</h4><p>{unread.length}</p></section>
        <section><h4>urgent</h4><p style={{ color: '#8b1010' }}>{urgent.length}</p></section>
        <section>
          <h4>blocked</h4>
          <p style={{ color: '#8b2020' }}>{items.filter((i) => i.type === 'blocked').length}</p>
        </section>
      </div>

      {summarizeDarakeReviewInbox(items) && (
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          {summarizeDarakeReviewInbox(items)}
        </div>
      )}

      {ranked.length === 0 && (
        <div className="phase35Section">
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            Inboxは空です。今は何も見る必要がありません。
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {ranked.map((item) => (
          <div key={item.id} className={`phase35InboxCard priority-${item.priority} status-${item.status}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className={`phase35PriorityBadge ${item.priority}`}>
                {PRIORITY_ICONS[item.priority]} {item.priority}
              </span>
              <span className="phase35StatusBadge">{STATUS_LABELS[item.status]}</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{INBOX_TYPE_LABELS[item.type]}</span>
            </div>
            <p className="phase35InboxTitle">{item.title}</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)' }}>{item.summary}</p>
            {item.recommendedAction && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#4a2e00', fontWeight: 600 }}>
                推奨: {item.recommendedAction}
              </p>
            )}
            <div className="phase35BtnRow">
              {item.status !== 'reviewed' && (
                <button className="phase35SmallBtn" onClick={() => handleUpdateStatus(item.id, 'reviewed')}>
                  確認済
                </button>
              )}
              {item.status !== 'snoozed' && (
                <button className="phase35SmallBtn" onClick={() => handleUpdateStatus(item.id, 'snoozed')}>
                  スヌーズ
                </button>
              )}
              {item.status !== 'resolved' && (
                <button className="phase35SmallBtn" onClick={() => handleUpdateStatus(item.id, 'resolved')}>
                  解決済
                </button>
              )}
              {item.status !== 'ignored' && (
                <button className="phase35SmallBtn" onClick={() => handleUpdateStatus(item.id, 'ignored')}>
                  無視
                </button>
              )}
              <button
                className="phase35SmallBtn"
                style={{ color: '#992020', borderColor: 'rgba(220,80,80,0.3)' }}
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 size={11} /> 削除
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="phase35Section">
        <h4>Inboxに追加</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            className="phase35Input"
            placeholder="タイトル *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            className="phase35Input"
            placeholder="サマリー *"
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
          />
          <select
            className="phase35Select"
            value={newType}
            onChange={(e) => setNewType(e.target.value as DarakeReviewInboxItemType)}
          >
            {ITEM_TYPES.map((t) => <option key={t} value={t}>{INBOX_TYPE_LABELS[t]}</option>)}
          </select>
          <select
            className="phase35Select"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as DarakeReviewInboxItem['priority'])}
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_ICONS[p]} {p}</option>)}
          </select>
          <input
            className="phase35Input"
            placeholder="推奨アクション"
            value={newRecommendedAction}
            onChange={(e) => setNewRecommendedAction(e.target.value)}
          />
          <button className="phase35SmallBtn" onClick={handleAdd}>
            <Plus size={13} /> 追加
          </button>
        </div>
      </div>

      <div className="phase35BtnRow">
        <button className={`phase35CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} まとめてコピー
        </button>
      </div>
    </div>
  );
}
