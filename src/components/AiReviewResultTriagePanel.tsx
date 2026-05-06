import { useState } from 'react';
import { Filter, Copy, Check, Plus, Trash2 } from 'lucide-react';
import {
  buildAiReviewTriageItem,
  loadAiReviewTriageItems,
  saveAiReviewTriageItems,
  formatAiReviewTriageMarkdown,
} from '../utils/aiReviewResultTriage';
import type { AiReviewTriageCategory, AiReviewTriageAction } from '../utils/aiReviewResultTriage';
import { loadManualAiReviewSessions } from '../utils/manualAiReviewSession';

type CopyState = 'idle' | 'copied' | 'failed';

const CATEGORIES: AiReviewTriageCategory[] = [
  'blocker', 'warning', 'suggestion', 'copy-improvement', 'ui-fix', 'code-risk', 'store-risk', 'ignore',
];
const ACTIONS: AiReviewTriageAction[] = ['issue', 'manual-fix', 'note', 'ignore'];

export function AiReviewResultTriagePanel() {
  const [items, setItems] = useState(() => loadAiReviewTriageItems());
  const [sessions] = useState(() => loadManualAiReviewSessions());
  const [text, setText] = useState('');
  const [category, setCategory] = useState<AiReviewTriageCategory>('warning');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [action, setAction] = useState<AiReviewTriageAction>('note');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function save(updated: ReturnType<typeof loadAiReviewTriageItems>) {
    saveAiReviewTriageItems(updated);
    setItems(updated);
  }

  function handleAdd() {
    if (!text.trim()) return;
    const item = buildAiReviewTriageItem({ text, category, priority, action });
    save([item, ...items]);
    setText('');
  }

  function handleDelete(id: string) {
    save(items.filter((i) => i.id !== id));
  }

  // Quick-add from session result
  function handleImportFromSession(sessionId: string) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || !session.resultText) return;
    // Split result lines into triage items
    const lines = session.resultText.split('\n').map((l) => l.trim()).filter(Boolean);
    const newItems = lines.map((line) =>
      buildAiReviewTriageItem({ text: line, category: 'suggestion', priority: 'medium', action: 'note' })
    );
    save([...newItems, ...items]);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAiReviewTriageMarkdown(items));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const categoryColor: Record<AiReviewTriageCategory, string> = {
    blocker: 'blocked',
    warning: 'needs-review',
    suggestion: 'safe-draft',
    'copy-improvement': 'safe-draft',
    'ui-fix': 'safe-draft',
    'code-risk': 'blocked',
    'store-risk': 'blocked',
    ignore: 'draft',
  };

  return (
    <div className="phase27Panel">
      <div className="phase27Hero">
        <Filter />
        <div>
          <p className="eyebrow">Phase 29.3</p>
          <h3>AI Review Result Triage</h3>
          <p>AIレビュー結果を分類します。</p>
        </div>
      </div>

      <div className="phase27SummaryGrid">
        <section><h4>合計</h4><p>{items.length}</p></section>
        <section><h4>blocker</h4><p>{items.filter((i) => i.category === 'blocker').length}</p></section>
        <section><h4>issue</h4><p>{items.filter((i) => i.action === 'issue').length}</p></section>
        <section><h4>ignore</h4><p>{items.filter((i) => i.category === 'ignore').length}</p></section>
      </div>

      {sessions.length > 0 && (
        <div className="phase27Section">
          <h4>セッション結果をインポート</h4>
          <select className="phase27Select" defaultValue="" onChange={(e) => { if (e.target.value) handleImportFromSession(e.target.value); }}>
            <option value="">セッションを選択してインポート…</option>
            {sessions.filter((s) => s.resultText).map((s) => (
              <option key={s.id} value={s.id}>{s.title} ({s.status})</option>
            ))}
          </select>
        </div>
      )}

      <div className="phase27Section">
        <h4>手動追加</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <textarea className="phase27Textarea" rows={2} placeholder="指摘内容" value={text} onChange={(e) => setText(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select className="phase27Select" value={category} onChange={(e) => setCategory(e.target.value as AiReviewTriageCategory)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="phase27Select" value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <select className="phase27Select" value={action} onChange={(e) => setAction(e.target.value as AiReviewTriageAction)}>
              {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button className="phase27SmallBtn" onClick={handleAdd} style={{ justifySelf: 'start' }}>
            <Plus size={14} /> 追加
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="phase27Section">
          <h4>Triage 一覧</h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'rgba(30,90,170,0.04)', borderRadius: 10 }}>
                <div style={{ flex: 1 }}>
                  <div className="phase27TagRow" style={{ marginBottom: 4 }}>
                    <span className={`phase27StatusBadge ${categoryColor[item.category]}`}>{item.category}</span>
                    <span className="phase27Tag">{item.priority}</span>
                    <span className="phase27Tag">→ {item.action}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem' }}>{item.text}</p>
                </div>
                <button className="phase27SmallBtn" onClick={() => handleDelete(item.id)} style={{ color: '#992020', flexShrink: 0 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="phase27BtnRow">
        <button className={`phase27CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Triage Markdown コピー'}
        </button>
      </div>
    </div>
  );
}
