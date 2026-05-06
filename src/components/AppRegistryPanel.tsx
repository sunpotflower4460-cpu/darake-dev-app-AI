import { useEffect, useState } from 'react';
import { Check, Copy, FolderOpen, RotateCcw, Save, Trash2 } from 'lucide-react';
import type { RegisteredApp } from '../utils/appRegistry';
import {
  buildInitialApp,
  loadAppRegistry,
  saveAppRegistry,
  addApp,
  updateApp,
  deleteApp,
} from '../utils/appRegistry';

type CopyState = 'idle' | 'copied' | 'failed';

export function AppRegistryPanel() {
  const [apps, setApps] = useState<RegisteredApp[]>([]);
  const [draft, setDraft] = useState<RegisteredApp>(buildInitialApp);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    setApps(loadAppRegistry());
  }, []);

  function handleChange<K extends keyof RegisteredApp>(key: K, value: RegisteredApp[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    const updated =
      editingId !== null ? updateApp(apps, { ...draft, lastUpdatedAt: new Date().toISOString() }) : addApp(apps, draft);
    saveAppRegistry(updated);
    setApps(updated);
    setSaved(true);
    setEditingId(null);
    setDraft(buildInitialApp());
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleEdit(app: RegisteredApp) {
    setDraft(app);
    setEditingId(app.id);
    setSaved(false);
  }

  function handleDelete(id: string) {
    if (!window.confirm('削除しますか？')) return;
    const updated = deleteApp(apps, id);
    saveAppRegistry(updated);
    setApps(updated);
  }

  async function handleCopy() {
    const text = apps
      .map((a) => `- ${a.name} (${a.lifecycleStage} / ${a.priority}) ${a.nextAction}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(`# アプリ登録一覧\n\n${text}`);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const STAGES = ['idea', 'planning', 'development', 'testing', 'submission-prep', 'in-review', 'released', 'post-release', 'paused', 'archived'] as const;
  const PRIORITIES = ['low', 'medium', 'high', 'dream-core'] as const;
  const RISK_LEVELS = ['safe', 'review-needed', 'manual-gate', 'blocked'] as const;

  return (
    <div className="phase16Panel">
      <div className="phase16Hero">
        <FolderOpen />
        <div>
          <p className="eyebrow">Phase 16.2</p>
          <h3>アプリ登録 / App Registry</h3>
          <p>複数アプリを登録・管理します。外部API連携なし。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし</strong>
        <p>localStorageキー: darake.appRegistry.v1</p>
      </div>

      {apps.length > 0 && (
        <div className="phaseItemList">
          <strong style={{ fontSize: '0.88rem', color: '#35513d' }}>登録アプリ ({apps.length}件)</strong>
          {apps.map((app) => (
            <div key={app.id} className={`phaseAppCard phaseAppCard-${app.riskLevel}`}>
              <div className="phaseAppCardName">{app.name || '（名称未設定）'}</div>
              <div className="phaseAppCardMeta">
                <span className="phaseItemBadge">{app.lifecycleStage}</span>
                <span className={`phaseItemBadge phaseItemBadge-${app.priority === 'dream-core' ? 'medium' : app.priority}`}>{app.priority}</span>
                {app.riskLevel !== 'safe' && <span className="phaseItemBadge phaseItemBadge-critical">{app.riskLevel}</span>}
              </div>
              {app.nextAction && <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)' }}>次: {app.nextAction}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(76,124,85,0.3)', background: 'transparent', cursor: 'pointer', color: '#35513d' }}
                  onClick={() => handleEdit(app)}
                >
                  編集
                </button>
                <button
                  type="button"
                  style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(180,91,93,0.3)', background: 'transparent', cursor: 'pointer', color: '#7e3436' }}
                  onClick={() => handleDelete(app.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="phaseForm">
        <fieldset>
          <legend>{editingId ? '編集中' : '新規登録'}</legend>
          <label>アプリ名<input value={draft.name} onChange={(e) => handleChange('name', e.target.value)} /></label>
          <label>リポジトリURL<input value={draft.repoUrl} onChange={(e) => handleChange('repoUrl', e.target.value)} /></label>
          <label>
            ライフサイクル
            <select value={draft.lifecycleStage} onChange={(e) => handleChange('lifecycleStage', e.target.value as RegisteredApp['lifecycleStage'])}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            優先度
            <select value={draft.priority} onChange={(e) => handleChange('priority', e.target.value as RegisteredApp['priority'])}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>
            リスクレベル
            <select value={draft.riskLevel} onChange={(e) => handleChange('riskLevel', e.target.value as RegisteredApp['riskLevel'])}>
              {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label>現在のフェーズ<input value={draft.currentPhase} onChange={(e) => handleChange('currentPhase', e.target.value)} /></label>
          <label>次のアクション<input value={draft.nextAction} onChange={(e) => handleChange('nextAction', e.target.value)} /></label>
          <label>メモ<textarea rows={3} value={draft.notes} onChange={(e) => handleChange('notes', e.target.value)} /></label>
        </fieldset>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleSave} className={saved ? 'phaseSavedBtn' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : editingId ? '更新' : '登録'}
        </button>
        <button type="button" onClick={() => { setDraft(buildInitialApp()); setEditingId(null); }}>
          <RotateCcw size={16} /> 新規
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '一覧コピー'}
        </button>
      </div>
    </div>
  );
}
