import { useEffect, useState } from 'react';
import { Check, Copy, Save, Shield } from 'lucide-react';
import type { PrivacyAgeRatingDraft } from '../utils/privacyAgeRatingDraft';
import {
  buildInitialPrivacyAgeRatingDraft,
  clearPrivacyAgeRatingDraft,
  formatPrivacyAgeRatingDraft,
  loadPrivacyAgeRatingDraft,
  savePrivacyAgeRatingDraft,
  summarizePrivacyAgeRatingDraft,
} from '../utils/privacyAgeRatingDraft';

type CopyState = 'idle' | 'copied' | 'failed';

export function PrivacyAgeRatingDraftPanel() {
  const [draft, setDraft] = useState<PrivacyAgeRatingDraft>(buildInitialPrivacyAgeRatingDraft);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    setDraft(loadPrivacyAgeRatingDraft());
  }, []);

  function handleItemChange(id: string, field: 'value' | 'notes', value: string) {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
    setSaved(false);
  }

  function handleSave() {
    savePrivacyAgeRatingDraft(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    if (!window.confirm('プライバシー / 年齢レーティングの入力内容を初期化しますか？')) return;
    clearPrivacyAgeRatingDraft();
    setDraft(buildInitialPrivacyAgeRatingDraft());
    setSaved(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatPrivacyAgeRatingDraft(draft));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const summary = summarizePrivacyAgeRatingDraft(draft);
  const status = summary.blocked ? 'blocked' : 'ready';

  return (
    <div className="privacyAgeRatingPanel">
      <div className={`privacyAgeRatingHero privacyAgeRating-${status}`}>
        <Shield />
        <div>
          <p className="eyebrow">Phase 12.4</p>
          <h3>プライバシー / 年齢レーティング確認メモ</h3>
          <p>各項目にYes / No / Unknownを記入します。最終的な法的判断は人間が行います。</p>
        </div>
      </div>

      <div className="privacyAgeRatingSafetyBox">
        <strong>法的判断の自動確定なし・APIなし</strong>
        <p>このパネルは「入力前に確認すべき項目の整理」として扱います。unknownがある場合はblocked表示になります。最終判断は必ず人間が行ってください。</p>
      </div>

      {summary.blocked && (
        <div className="privacyAgeRatingBlockedBox">
          <strong>🔴 unknownが残っています（{summary.unknownItems.length}件）</strong>
          <ul>
            {summary.unknownItems.slice(0, 5).map((i) => <li key={i}>{i}</li>)}
            {summary.unknownItems.length > 5 && <li>他 {summary.unknownItems.length - 5}件...</li>}
          </ul>
        </div>
      )}

      <div className="privacyAgeRatingItemList">
        {draft.items.map((item) => (
          <div key={item.id} className={`privacyAgeRatingItem privacyAgeRatingItem-${item.value}`}>
            <span className="privacyAgeRatingItemLabel">{item.label}</span>
            <div className="privacyAgeRatingItemControls">
              {(['yes', 'no', 'unknown'] as const).map((v) => (
                <label key={v} className={`privacyAgeRatingRadio privacyAgeRatingRadio-${v}`}>
                  <input
                    type="radio"
                    name={item.id}
                    value={v}
                    checked={item.value === v}
                    onChange={() => handleItemChange(item.id, 'value', v)}
                  />
                  {v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '?'}
                </label>
              ))}
              <input
                className="privacyAgeRatingNotesInput"
                placeholder="メモ（任意）"
                value={item.notes}
                onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="privacyAgeRatingControls">
        <button type="button" onClick={handleSave} className={saved ? 'privacyAgeRatingSaved' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : '保存'}
        </button>
        <button type="button" onClick={handleClear}>初期化</button>
        <button type="button" className={`privacyAgeRatingCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
        <span className={`privacyAgeRatingStatusBadge status-${status}`}>{status}</span>
      </div>
    </div>
  );
}
