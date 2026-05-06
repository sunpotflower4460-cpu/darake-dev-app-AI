import { useState } from 'react';
import { Check, Copy, Calculator } from 'lucide-react';
import {
  OperationCostItem,
  loadOperationCostChecklist,
  saveOperationCostChecklist,
  formatOperationCostChecklistMarkdown,
} from '../utils/operationCostChecklist';

type CopyState = 'idle' | 'copied' | 'failed';

export function OperationCostChecklistPanel() {
  const [items, setItems] = useState<OperationCostItem[]>(loadOperationCostChecklist);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  function handleToggle(id: string) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
  }

  function handleNoteChange(id: string, notes: string) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, notes } : item));
  }

  function handleCostChange(id: string, field: 'monthlyJpy' | 'yearlyJpy', value: string) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function handleSave() {
    saveOperationCostChecklist(items);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatOperationCostChecklistMarkdown(items));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="phase22Panel">
      <div className="phase22Hero">
        <Calculator />
        <div>
          <p className="eyebrow">Phase 22.3</p>
          <h3>運用コスト チェックリスト</h3>
          <p>アプリ運用に必要なコストを整理します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>📝 運用コストメモ（確認済み: {checkedCount}/{items.length}件）</strong>
        <p>このリストは自己管理メモです。自動課金設定は行いません。</p>
      </div>

      <div className="phase22CostList">
        {items.map((item) => (
          <div key={item.id} className={`phase22CostItem ${item.checked ? 'phase22CostItem-checked' : ''}`}>
            <div className="phase22CostItemHeader">
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggle(item.id)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                {item.label}
              </label>
              <span className="phaseStatusBadge phaseStatusBadge-draft">{item.category}</span>
            </div>
            <div className="phase22CostItemBody">
              {item.isFree ? (
                <span className="phaseStatusBadge phaseStatusBadge-ok">無料</span>
              ) : (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    月額 (円)
                    <input
                      type="number"
                      min="0"
                      value={item.monthlyJpy}
                      onChange={(e) => handleCostChange(item.id, 'monthlyJpy', e.target.value)}
                      placeholder="未設定"
                      style={{ width: '90px', padding: '4px 8px', border: '1px solid rgba(76,124,85,0.25)', borderRadius: '8px', fontSize: '0.82rem' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    年額 (円)
                    <input
                      type="number"
                      min="0"
                      value={item.yearlyJpy}
                      onChange={(e) => handleCostChange(item.id, 'yearlyJpy', e.target.value)}
                      placeholder="未設定"
                      style={{ width: '90px', padding: '4px 8px', border: '1px solid rgba(76,124,85,0.25)', borderRadius: '8px', fontSize: '0.82rem' }}
                    />
                  </label>
                </div>
              )}
              <input
                value={item.notes}
                onChange={(e) => handleNoteChange(item.id, e.target.value)}
                placeholder="メモ"
                style={{ padding: '6px 10px', border: '1px solid rgba(76,124,85,0.2)', borderRadius: '10px', fontSize: '0.82rem', width: '100%' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '保存'}
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
