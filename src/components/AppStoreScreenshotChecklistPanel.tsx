import { useEffect, useState } from 'react';
import { Check, Copy, ImageIcon, Save } from 'lucide-react';
import type { AppStoreScreenshotChecklist } from '../utils/appStoreScreenshotChecklist';
import {
  buildInitialAppStoreScreenshotChecklist,
  clearAppStoreScreenshotChecklist,
  formatAppStoreScreenshotChecklist,
  loadAppStoreScreenshotChecklist,
  saveAppStoreScreenshotChecklist,
  summarizeAppStoreScreenshotChecklist,
} from '../utils/appStoreScreenshotChecklist';

type StatusValue = 'success' | 'warn' | 'failed' | 'unchecked';

export function AppStoreScreenshotChecklistPanel() {
  const [checklist, setChecklist] = useState<AppStoreScreenshotChecklist>(buildInitialAppStoreScreenshotChecklist);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    setChecklist(loadAppStoreScreenshotChecklist());
  }, []);

  function handleItemStatus(id: string, status: StatusValue) {
    setChecklist((prev) => ({
      ...prev,
      items: prev.items.map((item) => item.id === id ? { ...item, status } : item),
    }));
    setSaved(false);
  }

  function handleItemNotes(id: string, notes: string) {
    setChecklist((prev) => ({
      ...prev,
      items: prev.items.map((item) => item.id === id ? { ...item, notes } : item),
    }));
    setSaved(false);
  }

  function handleSave() {
    saveAppStoreScreenshotChecklist(checklist);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    if (!window.confirm('スクショチェックを初期化しますか？')) return;
    clearAppStoreScreenshotChecklist();
    setChecklist(buildInitialAppStoreScreenshotChecklist());
    setSaved(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAppStoreScreenshotChecklist(checklist));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const summary = summarizeAppStoreScreenshotChecklist(checklist);
  const STATUS_LABELS: Record<StatusValue, string> = {
    success: '✅',
    warn: '⚠️',
    failed: '🔴',
    unchecked: '❓',
  };

  return (
    <div className="screenshotChecklistPanel">
      <div className={`screenshotChecklistHero screenshotChecklist-${summary.status}`}>
        <ImageIcon />
        <div>
          <p className="eyebrow">Phase 12.5</p>
          <h3>App Store スクショ素材チェック</h3>
          <p>スクショ素材の準備状況を確認します。このPhaseではApp Store Connectへアップロードしません。</p>
        </div>
      </div>

      <div className="screenshotChecklistSafetyBox">
        <strong>アップロードなし・APIなし</strong>
        <p>スクショ素材の準備確認のみです。App Store Connectへのアップロードは人間が行います。</p>
      </div>

      {(summary.failedItems.length > 0 || summary.uncheckedItems.length > 0) && (
        <div className="screenshotChecklistBlockedBox">
          <strong>🔴 未完了の項目があります</strong>
          {summary.failedItems.length > 0 && (
            <ul>{summary.failedItems.map((i) => <li key={i}>🔴 {i}</li>)}</ul>
          )}
          {summary.uncheckedItems.length > 0 && (
            <p>❓ 未確認: {summary.uncheckedItems.length}件</p>
          )}
        </div>
      )}

      <div className="screenshotChecklistItems">
        {checklist.items.map((item) => (
          <div key={item.id} className={`screenshotChecklistItem screenshotChecklistItem-${item.status}`}>
            <span className="screenshotChecklistItemLabel">
              {STATUS_LABELS[item.status]} {item.label}
            </span>
            <div className="screenshotChecklistItemControls">
              {(['success', 'warn', 'failed', 'unchecked'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`screenshotChecklistStatusBtn statusBtn-${s}${item.status === s ? ' active' : ''}`}
                  onClick={() => handleItemStatus(item.id, s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <input
                className="screenshotChecklistNotesInput"
                placeholder="メモ"
                value={item.notes}
                onChange={(e) => handleItemNotes(item.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="screenshotChecklistMeta">
        <label>
          Artifact URL
          <input
            value={checklist.artifactUrl}
            onChange={(e) => setChecklist((prev) => ({ ...prev, artifactUrl: e.target.value }))}
            placeholder="https://..."
          />
        </label>
        <label>
          Screenshot Source
          <input
            value={checklist.screenshotSource}
            onChange={(e) => setChecklist((prev) => ({ ...prev, screenshotSource: e.target.value }))}
            placeholder="キャプチャ元（例: Playwright artifact）"
          />
        </label>
      </div>

      <div className="screenshotChecklistControls">
        <button type="button" onClick={handleSave} className={saved ? 'screenshotChecklistSaved' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : '保存'}
        </button>
        <button type="button" onClick={handleClear}>初期化</button>
        <button type="button" className={`screenshotChecklistCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
        <span className={`screenshotChecklistStatusBadge status-${summary.status}`}>{summary.status}</span>
      </div>
    </div>
  );
}
