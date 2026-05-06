import { useEffect, useState } from 'react';
import { Check, Copy, PackageOpen, RotateCcw, Save } from 'lucide-react';
import type { ReleaseRecord } from '../utils/releaseRecord';
import {
  buildInitialReleaseRecord,
  formatReleaseRecordMarkdown,
  loadReleaseRecords,
  saveReleaseRecords,
  addReleaseRecord,
  updateReleaseRecord,
} from '../utils/releaseRecord';

type CopyState = 'idle' | 'copied' | 'failed';

export function ReleaseRecordPanel() {
  const [records, setRecords] = useState<ReleaseRecord[]>([]);
  const [draft, setDraft] = useState<ReleaseRecord>(buildInitialReleaseRecord);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    setRecords(loadReleaseRecords());
  }, []);

  function handleChange<K extends keyof ReleaseRecord>(key: K, value: ReleaseRecord[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleArrayChange(key: 'knownIssues' | 'nextUpdateIdeas', value: string) {
    setDraft((prev) => ({ ...prev, [key]: value.split('\n').filter(Boolean) }));
  }

  function handleSave() {
    const updated =
      editingIndex !== null
        ? updateReleaseRecord(records, draft)
        : addReleaseRecord(records, { ...draft, appId: draft.appId || `app-${Date.now()}` });
    saveReleaseRecords(updated);
    setRecords(updated);
    setSaved(true);
    setEditingIndex(null);
    setDraft(buildInitialReleaseRecord());
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    if (!window.confirm('フォームを初期化しますか？')) return;
    setDraft(buildInitialReleaseRecord());
    setEditingIndex(null);
    setSaved(false);
  }

  function handleEdit(index: number) {
    setDraft(records[index]);
    setEditingIndex(index);
    setSaved(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatReleaseRecordMarkdown(draft));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const STATUSES = ['draft', 'submitted', 'in-review', 'approved', 'released', 'rejected', 'paused', 'needs-update'] as const;
  const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;

  return (
    <div className="phase15Panel">
      <div className="phase15Hero">
        <PackageOpen />
        <div>
          <p className="eyebrow">Phase 15.2</p>
          <h3>リリース記録 / Release Record</h3>
          <p>アプリのリリース情報を記録します。App Store等への操作は自動実行しません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし・本番操作なし</strong>
        <p>localStorageキー: darake.releaseRecords.v1</p>
      </div>

      {records.length > 0 && (
        <div className="phaseItemList">
          <strong style={{ fontSize: '0.88rem', color: '#35513d' }}>保存済みリリース記録 ({records.length}件)</strong>
          {records.map((r, i) => (
            <div key={`${r.appId}-${r.version}`} className="phaseAppCard">
              <div className="phaseAppCardName">{r.appName || '（名称未設定）'} v{r.version}</div>
              <div className="phaseAppCardMeta">
                <span className="phaseItemBadge">{r.platform}</span>
                <span className="phaseItemBadge">{r.status}</span>
                {r.submittedAt && <span style={{ fontSize: '0.78rem' }}>提出: {r.submittedAt}</span>}
              </div>
              <button
                type="button"
                style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(76,124,85,0.3)', background: 'transparent', cursor: 'pointer', color: '#35513d', width: 'fit-content' }}
                onClick={() => handleEdit(i)}
              >
                編集
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="phaseForm">
        <fieldset>
          <legend>基本情報</legend>
          <label>アプリID<input value={draft.appId} onChange={(e) => handleChange('appId', e.target.value)} placeholder="例: app-nekocalc" /></label>
          <label>アプリ名<input value={draft.appName} onChange={(e) => handleChange('appName', e.target.value)} /></label>
          <label>バージョン<input value={draft.version} onChange={(e) => handleChange('version', e.target.value)} /></label>
          <label>ビルド番号<input value={draft.buildNumber} onChange={(e) => handleChange('buildNumber', e.target.value)} /></label>
          <label>
            プラットフォーム
            <select value={draft.platform} onChange={(e) => handleChange('platform', e.target.value as ReleaseRecord['platform'])}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>
            ステータス
            <select value={draft.status} onChange={(e) => handleChange('status', e.target.value as ReleaseRecord['status'])}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>日時・URL</legend>
          <label>提出日時<input value={draft.submittedAt} onChange={(e) => handleChange('submittedAt', e.target.value)} placeholder="YYYY-MM-DD" /></label>
          <label>公開日時<input value={draft.releasedAt} onChange={(e) => handleChange('releasedAt', e.target.value)} placeholder="YYYY-MM-DD" /></label>
          <label>Store URL<input value={draft.storeUrl} onChange={(e) => handleChange('storeUrl', e.target.value)} /></label>
          <label>TestFlight URL<input value={draft.testFlightUrl} onChange={(e) => handleChange('testFlightUrl', e.target.value)} /></label>
        </fieldset>

        <fieldset>
          <legend>メモ・課題</legend>
          <label>メモ<textarea rows={3} value={draft.notes} onChange={(e) => handleChange('notes', e.target.value)} /></label>
          <label>既知の問題（1行1件）<textarea rows={3} value={draft.knownIssues.join('\n')} onChange={(e) => handleArrayChange('knownIssues', e.target.value)} /></label>
          <label>次アップデートアイデア（1行1件）<textarea rows={3} value={draft.nextUpdateIdeas.join('\n')} onChange={(e) => handleArrayChange('nextUpdateIdeas', e.target.value)} /></label>
        </fieldset>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleSave} className={saved ? 'phaseSavedBtn' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : editingIndex !== null ? '更新' : '追加保存'}
        </button>
        <button type="button" onClick={handleClear}>
          <RotateCcw size={16} /> 初期化
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
