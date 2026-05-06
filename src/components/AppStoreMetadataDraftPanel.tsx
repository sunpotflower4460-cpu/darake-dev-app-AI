import { useEffect, useState } from 'react';
import { Check, ClipboardList, Copy, RotateCcw, Save } from 'lucide-react';
import type { AppStoreMetadataDraft } from '../utils/appStoreMetadataDraft';
import {
  buildInitialAppStoreMetadataDraft,
  clearAppStoreMetadataDraft,
  formatAppStoreMetadataDraft,
  loadAppStoreMetadataDraft,
  saveAppStoreMetadataDraft,
  summarizeAppStoreMetadataDraft,
} from '../utils/appStoreMetadataDraft';

type CopyState = 'idle' | 'copied' | 'failed';

export function AppStoreMetadataDraftPanel() {
  const [draft, setDraft] = useState<AppStoreMetadataDraft>(buildInitialAppStoreMetadataDraft);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    setDraft(loadAppStoreMetadataDraft());
  }, []);

  function handleChange<K extends keyof AppStoreMetadataDraft>(key: K, value: AppStoreMetadataDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveAppStoreMetadataDraft(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    if (!window.confirm('入力内容を初期化しますか？')) return;
    clearAppStoreMetadataDraft();
    setDraft(buildInitialAppStoreMetadataDraft());
    setSaved(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAppStoreMetadataDraft(draft));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const summary = summarizeAppStoreMetadataDraft(draft);
  const readinessStatus = summary.blockers.length > 0
    ? 'blocked'
    : summary.warnings.length > 0
      ? 'needs-review'
      : 'ready-draft';

  return (
    <div className="appStoreMetaDraftPanel">
      <div className={`appStoreMetaDraftHero appStoreMetaDraft-${readinessStatus}`}>
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 12.2</p>
          <h3>App Store 提出準備フォーム</h3>
          <p>メタデータを入力・保存して、Markdownでコピーできます。App Store Connect APIは呼びません。</p>
        </div>
      </div>

      <div className="appStoreMetaDraftSafetyBox">
        <strong>APIキー入力なし・App Store Connect API呼び出しなし</strong>
        <p>入力内容はlocalStorageに保存されます（キー: darake.appStoreMetadataDraft.v1）。最終Submitは人間が行います。</p>
      </div>

      {summary.blockers.length > 0 && (
        <div className="appStoreMetaDraftBlockersBox">
          <strong>🔴 必須項目が未入力です</strong>
          <ul>
            {summary.blockers.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      )}

      {summary.warnings.length > 0 && (
        <div className="appStoreMetaDraftWarningsBox">
          <strong>⚠️ 推奨入力項目</strong>
          <ul>
            {summary.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="appStoreMetaDraftForm">
        <fieldset>
          <legend>基本情報（必須）</legend>
          <label>アプリ名<input value={draft.appName} onChange={(e) => handleChange('appName', e.target.value)} /></label>
          <label>説明文<textarea rows={5} value={draft.description} onChange={(e) => handleChange('description', e.target.value)} /></label>
          <label>サポートURL<input value={draft.supportUrl} onChange={(e) => handleChange('supportUrl', e.target.value)} /></label>
          <label>プライバシーポリシーURL<input value={draft.privacyPolicyUrl} onChange={(e) => handleChange('privacyPolicyUrl', e.target.value)} /></label>
        </fieldset>

        <fieldset>
          <legend>ストア情報（推奨）</legend>
          <label>サブタイトル<input value={draft.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} /></label>
          <label>プロモーション文<input value={draft.promotionalText} onChange={(e) => handleChange('promotionalText', e.target.value)} /></label>
          <label>キーワード<input value={draft.keywords} onChange={(e) => handleChange('keywords', e.target.value)} placeholder="カンマ区切り" /></label>
          <label>カテゴリ（主）<input value={draft.categoryPrimary} onChange={(e) => handleChange('categoryPrimary', e.target.value)} /></label>
          <label>カテゴリ（副）<input value={draft.categorySecondary} onChange={(e) => handleChange('categorySecondary', e.target.value)} /></label>
        </fieldset>

        <fieldset>
          <legend>確認項目（必須）</legend>
          {(['loginRequired', 'hasIap', 'collectsData', 'usesTracking'] as const).map((key) => {
            const labels: Record<string, string> = {
              loginRequired: 'ログイン必要',
              hasIap: '課金（IAP）あり',
              collectsData: 'データ収集あり',
              usesTracking: 'トラッキングあり',
            };
            return (
              <label key={key}>
                {labels[key]}
                <select value={draft[key]} onChange={(e) => handleChange(key, e.target.value as 'unknown' | 'yes' | 'no')}>
                  <option value="unknown">unknown（未確認）</option>
                  <option value="yes">yes</option>
                  <option value="no">no</option>
                </select>
              </label>
            );
          })}
        </fieldset>

        <fieldset>
          <legend>メモ（推奨）</legend>
          <label>審査メモ<textarea rows={3} value={draft.reviewNotes} onChange={(e) => handleChange('reviewNotes', e.target.value)} /></label>
          <label>スクショメモ<input value={draft.screenshotNotes} onChange={(e) => handleChange('screenshotNotes', e.target.value)} /></label>
          <label>アイコンメモ<input value={draft.iconNotes} onChange={(e) => handleChange('iconNotes', e.target.value)} /></label>
          <label>年齢レーティングメモ<input value={draft.ageRatingNotes} onChange={(e) => handleChange('ageRatingNotes', e.target.value)} /></label>
          <label>プライバシーメモ<input value={draft.privacyNotes} onChange={(e) => handleChange('privacyNotes', e.target.value)} /></label>
        </fieldset>
      </div>

      <div className="appStoreMetaDraftControls">
        <button type="button" onClick={handleSave} className={saved ? 'appStoreMetaSaved' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : '保存'}
        </button>
        <button type="button" onClick={handleClear}>
          <RotateCcw size={16} /> 初期化
        </button>
        <button type="button" className={`appStoreMetaCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
        <span className={`appStoreMetaStatusBadge status-${readinessStatus}`}>{readinessStatus}</span>
      </div>
    </div>
  );
}
