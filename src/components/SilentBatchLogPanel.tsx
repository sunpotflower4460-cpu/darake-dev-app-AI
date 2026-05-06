import { useState } from 'react';
import { Eye, Copy, Check, Plus, Trash2 } from 'lucide-react';
import {
  loadSilentBatchLog,
  saveSilentBatchLog,
  buildSilentBatchLogItem,
  formatSilentBatchLogMarkdown,
  CATEGORY_LABELS,
  SEVERITY_ICONS,
} from '../utils/silentBatchLog';
import type { SilentBatchLogItem } from '../utils/silentBatchLog';

type CopyState = 'idle' | 'copied' | 'failed';

const CATEGORIES: SilentBatchLogItem['category'][] = [
  'auto-generated',
  'warning-batched',
  'manual-gate-queued',
  'blocked',
  'report-updated',
  'instruction-generated',
];

const SEVERITIES: SilentBatchLogItem['severity'][] = [
  'info', 'success', 'warning', 'manual-gate', 'blocked',
];

export function SilentBatchLogPanel() {
  const [items, setItems] = useState(() => loadSilentBatchLog());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newCategory, setNewCategory] = useState<SilentBatchLogItem['category']>('auto-generated');
  const [newSeverity, setNewSeverity] = useState<SilentBatchLogItem['severity']>('info');

  function save(updated: SilentBatchLogItem[]) {
    saveSilentBatchLog(updated);
    setItems(updated);
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    const item = buildSilentBatchLogItem({
      category: newCategory,
      title: newTitle.trim(),
      summary: newSummary.trim(),
      severity: newSeverity,
    });
    save([item, ...items]);
    setNewTitle('');
    setNewSummary('');
  }

  function handleDelete(id: string) {
    save(items.filter((i) => i.id !== id));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatSilentBatchLogMarkdown(items));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const blocked = items.filter((i) => i.severity === 'blocked');
  const manualGate = items.filter((i) => i.severity === 'manual-gate');
  const warnings = items.filter((i) => i.severity === 'warning');
  const rest = items.filter(
    (i) => i.severity !== 'blocked' && i.severity !== 'manual-gate' && i.severity !== 'warning'
  );

  return (
    <div className="phase34bPanel">
      <div className="phase34bHero">
        <Eye />
        <div>
          <p className="eyebrow">Phase 34.2</p>
          <h3>Silent Batch Log</h3>
          <p>毎回通知せず、裏で進んだことをまとめて記録します。blockedのみ強調表示。</p>
        </div>
      </div>

      <div className="phase34bSummaryGrid">
        <section><h4>合計</h4><p>{items.length}</p></section>
        <section><h4>blocked</h4><p style={{ color: '#8b2020' }}>{blocked.length}</p></section>
        <section><h4>manual gate</h4><p style={{ color: '#8a5e12' }}>{manualGate.length}</p></section>
        <section><h4>warning</h4><p style={{ color: '#7a6010' }}>{warnings.length}</p></section>
      </div>

      {blocked.length > 0 && (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(220,80,80,0.08)', border: '2px solid rgba(220,80,80,0.3)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: 700, color: '#7a1a1a' }}>🚫 ブロック中</p>
          {blocked.map((item) => (
            <div key={item.id} style={{ fontSize: '0.8rem', marginBottom: 4 }}>
              <strong>{item.title}</strong>: {item.summary}
            </div>
          ))}
        </div>
      )}

      {manualGate.length > 0 && (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(185,130,46,0.07)', border: '1px solid rgba(185,130,46,0.24)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: 700, color: '#8a5e12' }}>🔒 Manual Gateキュー</p>
          {manualGate.map((item) => (
            <div key={item.id} style={{ fontSize: '0.8rem', marginBottom: 4 }}>
              <strong>{item.title}</strong>: {item.summary}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(220,200,40,0.06)', border: '1px solid rgba(220,200,40,0.22)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: 700, color: '#7a6010' }}>⚠️ Warningまとめ</p>
          {warnings.map((item) => (
            <div key={item.id} style={{ fontSize: '0.8rem', marginBottom: 4 }}>
              <strong>{item.title}</strong>: {item.summary}
            </div>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div style={{ display: 'grid', gap: 6 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', margin: 0 }}>今日の裏進行</p>
          {rest.map((item) => (
            <div key={item.id} className={`phase34bLogCard ${item.severity}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span>{SEVERITY_ICONS[item.severity]}</span>
                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{item.title}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', padding: '2px 8px', borderRadius: 8, background: 'rgba(80,40,130,0.07)' }}>
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
              {item.summary && <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{item.summary}</div>}
              <button
                className="phase34bSmallBtn"
                style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#992020', borderColor: 'rgba(220,80,80,0.3)' }}
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 size={10} /> 削除
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(80,40,130,0.04)', border: '1px solid rgba(80,40,130,0.12)' }}>
        <p style={{ margin: '0 0 8px', fontSize: '0.84rem', fontWeight: 700, color: '#4a1a80' }}>ログを追加</p>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            className="phase34bInput"
            placeholder="タイトル *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            className="phase34bInput"
            placeholder="サマリー"
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
          />
          <select
            className="phase34bSelect"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as SilentBatchLogItem['category'])}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
          <select
            className="phase34bSelect"
            value={newSeverity}
            onChange={(e) => setNewSeverity(e.target.value as SilentBatchLogItem['severity'])}
          >
            {SEVERITIES.map((s) => <option key={s} value={s}>{SEVERITY_ICONS[s]} {s}</option>)}
          </select>
          <button className="phase34bSmallBtn" onClick={handleAdd}>
            <Plus size={13} /> 追加
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="phase34bBtnRow">
          <button className={`phase34bCopyBtn ${copyState}`} onClick={() => void handleCopy()}>
            {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} 全MDコピー
          </button>
        </div>
      )}
    </div>
  );
}
