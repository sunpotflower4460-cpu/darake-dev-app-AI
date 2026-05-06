import { useEffect, useState } from 'react';
import { Check, Copy, Plane, Save } from 'lucide-react';
import type { TestFlightPrepChecklist } from '../utils/testFlightPrepChecklist';
import {
  buildInitialTestFlightPrepChecklist,
  clearTestFlightPrepChecklist,
  formatTestFlightPrepChecklist,
  loadTestFlightPrepChecklist,
  saveTestFlightPrepChecklist,
  summarizeTestFlightPrepChecklist,
} from '../utils/testFlightPrepChecklist';

type StatusValue = 'success' | 'warn' | 'failed' | 'unchecked';
const STATUS_LABELS: Record<StatusValue, string> = { success: '✅', warn: '⚠️', failed: '🔴', unchecked: '❓' };

export function TestFlightPrepChecklistPanel() {
  const [checklist, setChecklist] = useState<TestFlightPrepChecklist>(buildInitialTestFlightPrepChecklist);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    setChecklist(loadTestFlightPrepChecklist());
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
    saveTestFlightPrepChecklist(checklist);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    if (!window.confirm('TestFlight準備チェックを初期化しますか？')) return;
    clearTestFlightPrepChecklist();
    setChecklist(buildInitialTestFlightPrepChecklist());
    setSaved(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatTestFlightPrepChecklist(checklist));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const summary = summarizeTestFlightPrepChecklist(checklist);

  return (
    <div className="testFlightChecklistPanel">
      <div className={`testFlightChecklistHero testFlightChecklist-${summary.status}`}>
        <Plane />
        <div>
          <p className="eyebrow">Phase 13.4</p>
          <h3>TestFlight 準備チェック</h3>
          <p>TestFlight配布前に確認すべき項目をチェックします。</p>
        </div>
      </div>

      <div className="testFlightChecklistSafetyBox">
        <strong>アップロードなし・自動実行なし</strong>
        <p>TestFlightへのアップロードはXcodeまたはCIで人間が行います。</p>
      </div>

      {(summary.failedItems.length > 0 || summary.uncheckedItems.length > 0) && (
        <div className="testFlightChecklistBlockedBox">
          <strong>🔴 未完了の項目があります</strong>
          {summary.failedItems.length > 0 && <ul>{summary.failedItems.map((i) => <li key={i}>🔴 {i}</li>)}</ul>}
          {summary.uncheckedItems.length > 0 && <p>❓ 未確認: {summary.uncheckedItems.length}件</p>}
        </div>
      )}

      <div className="testFlightChecklistItems">
        {checklist.items.map((item) => (
          <div key={item.id} className={`testFlightChecklistItem testFlightChecklistItem-${item.status}`}>
            <span>{STATUS_LABELS[item.status]} {item.label}</span>
            <div className="testFlightChecklistItemControls">
              {(['success', 'warn', 'failed', 'unchecked'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`testFlightStatusBtn statusBtn-${s}${item.status === s ? ' active' : ''}`}
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

      <div className="testFlightChecklistControls">
        <button type="button" onClick={handleSave} className={saved ? 'testFlightSaved' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : '保存'}
        </button>
        <button type="button" onClick={handleClear}>初期化</button>
        <button type="button" className={`testFlightCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
        <span className={`testFlightStatusBadge status-${summary.status}`}>{summary.status}</span>
      </div>
    </div>
  );
}
