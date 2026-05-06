import { useEffect, useState } from 'react';
import { Check, Copy, RefreshCcw, Save } from 'lucide-react';
import type { ResubmissionChecklist } from '../utils/resubmissionChecklist';
import {
  buildInitialResubmissionChecklist,
  clearResubmissionChecklist,
  formatResubmissionChecklist,
  loadResubmissionChecklist,
  saveResubmissionChecklist,
  summarizeResubmissionChecklist,
} from '../utils/resubmissionChecklist';

type StatusValue = 'success' | 'warn' | 'failed' | 'unchecked';
const STATUS_LABELS: Record<StatusValue, string> = { success: '✅', warn: '⚠️', failed: '🔴', unchecked: '❓' };

export function ResubmissionChecklistPanel() {
  const [checklist, setChecklist] = useState<ResubmissionChecklist>(buildInitialResubmissionChecklist);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    setChecklist(loadResubmissionChecklist());
  }, []);

  function handleStatus(id: string, status: StatusValue) {
    setChecklist((prev) => ({
      ...prev,
      items: prev.items.map((item) => item.id === id ? { ...item, status } : item),
    }));
    setSaved(false);
  }

  function handleNotes(id: string, notes: string) {
    setChecklist((prev) => ({
      ...prev,
      items: prev.items.map((item) => item.id === id ? { ...item, notes } : item),
    }));
    setSaved(false);
  }

  function handleSave() {
    saveResubmissionChecklist(checklist);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    if (!window.confirm('再提出チェックリストを初期化しますか？')) return;
    clearResubmissionChecklist();
    setChecklist(buildInitialResubmissionChecklist());
    setSaved(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatResubmissionChecklist(checklist));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const summary = summarizeResubmissionChecklist(checklist);

  return (
    <div className="resubmissionChecklistPanel">
      <div className={`resubmissionChecklistHero resubmissionChecklist-${summary.status}`}>
        <RefreshCcw />
        <div>
          <p className="eyebrow">Phase 14.5</p>
          <h3>再提出チェックリスト</h3>
          <p>再提出前に必要な全ステップを確認します。再提出は人間が行います。</p>
        </div>
      </div>

      <div className="resubmissionChecklistSafetyBox">
        <strong>再提出は手動</strong>
        <p>このチェックリストはすべての準備が整ったか確認するためのものです。Submit for Reviewは人間がApp Store Connectで行います。</p>
      </div>

      {(summary.failedItems.length > 0 || summary.uncheckedItems.length > 0) && (
        <div className="resubmissionChecklistBlockedBox">
          <strong>🔴 未完了の項目があります</strong>
          {summary.failedItems.length > 0 && <ul>{summary.failedItems.map((i) => <li key={i}>🔴 {i}</li>)}</ul>}
          {summary.uncheckedItems.length > 0 && <p>❓ 未確認: {summary.uncheckedItems.length}件</p>}
        </div>
      )}

      <div className="resubmissionChecklistItems">
        {checklist.items.map((item) => (
          <div key={item.id} className={`resubmissionChecklistItem resubmissionChecklistItem-${item.status}`}>
            <span>{STATUS_LABELS[item.status]} {item.label}</span>
            <div className="resubmissionChecklistItemControls">
              {(['success', 'warn', 'failed', 'unchecked'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`resubmissionStatusBtn statusBtn-${s}${item.status === s ? ' active' : ''}`}
                  onClick={() => handleStatus(item.id, s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <input
                placeholder="メモ"
                value={item.notes}
                onChange={(e) => handleNotes(item.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="resubmissionChecklistControls">
        <button type="button" onClick={handleSave} className={saved ? 'resubmissionSaved' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : '保存'}
        </button>
        <button type="button" onClick={handleClear}>初期化</button>
        <button type="button" className={`resubmissionCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
        <span className={`resubmissionStatusBadge status-${summary.status}`}>{summary.status}</span>
      </div>
    </div>
  );
}
