import { useEffect, useState } from 'react';
import { Check, Copy, MessageSquare, RotateCcw, Save } from 'lucide-react';
import type { PostReleaseFeedback } from '../utils/postReleaseFeedbackRecord';
import {
  buildInitialFeedback,
  loadFeedbacks,
  saveFeedbacks,
  addFeedback,
  updateFeedback,
  formatFeedbackMarkdown,
} from '../utils/postReleaseFeedbackRecord';

type CopyState = 'idle' | 'copied' | 'failed';

export function PostReleaseFeedbackPanel() {
  const [feedbacks, setFeedbacks] = useState<PostReleaseFeedback[]>([]);
  const [draft, setDraft] = useState<PostReleaseFeedback>(buildInitialFeedback);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    setFeedbacks(loadFeedbacks());
  }, []);

  function handleChange<K extends keyof PostReleaseFeedback>(key: K, value: PostReleaseFeedback[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    const isNew = !feedbacks.find((f) => f.id === draft.id);
    const updated = isNew ? addFeedback(feedbacks, draft) : updateFeedback(feedbacks, draft);
    saveFeedbacks(updated);
    setFeedbacks(updated);
    setSaved(true);
    setDraft(buildInitialFeedback());
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleEdit(fb: PostReleaseFeedback) {
    setDraft(fb);
    setSaved(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatFeedbackMarkdown(draft));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const SOURCES = ['self-review', 'user-message', 'store-review', 'testflight', 'sns', 'friend', 'other'] as const;
  const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
  const CATEGORIES = ['bug', 'ui', 'copy', 'performance', 'feature-request', 'store-page', 'crash', 'other'] as const;
  const STATUSES = ['new', 'triaged', 'issue-drafted', 'fixed', 'ignored'] as const;

  return (
    <div className="phase15Panel">
      <div className="phase15Hero">
        <MessageSquare />
        <div>
          <p className="eyebrow">Phase 15.3</p>
          <h3>公開後フィードバック記録</h3>
          <p>ユーザー反応や気づきを記録します。外部APIは呼びません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし</strong>
        <p>localStorageキー: darake.postReleaseFeedback.v1</p>
      </div>

      {feedbacks.length > 0 && (
        <div className="phaseItemList">
          <strong style={{ fontSize: '0.88rem', color: '#35513d' }}>フィードバック一覧 ({feedbacks.length}件)</strong>
          {feedbacks.map((f) => (
            <div key={f.id} className={`phaseItem phaseItem-${f.priority}`}>
              <div className="phaseItemTitle">{f.title || '（タイトルなし）'}</div>
              <div className="phaseItemMeta">
                <span className={`phaseItemBadge phaseItemBadge-${f.priority}`}>{f.priority}</span>
                <span className="phaseItemBadge">{f.category}</span>
                <span className="phaseItemBadge">{f.status}</span>
                <span className="phaseItemBadge">{f.source}</span>
              </div>
              <button
                type="button"
                style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(76,124,85,0.3)', background: 'transparent', cursor: 'pointer', color: '#35513d', width: 'fit-content' }}
                onClick={() => handleEdit(f)}
              >
                編集
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="phaseForm">
        <fieldset>
          <legend>フィードバック入力</legend>
          <label>アプリID<input value={draft.appId} onChange={(e) => handleChange('appId', e.target.value)} placeholder="例: app-nekocalc" /></label>
          <label>タイトル<input value={draft.title} onChange={(e) => handleChange('title', e.target.value)} /></label>
          <label>詳細<textarea rows={4} value={draft.body} onChange={(e) => handleChange('body', e.target.value)} /></label>
          <label>
            ソース
            <select value={draft.source} onChange={(e) => handleChange('source', e.target.value as PostReleaseFeedback['source'])}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            優先度
            <select value={draft.priority} onChange={(e) => handleChange('priority', e.target.value as PostReleaseFeedback['priority'])}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>
            カテゴリ
            <select value={draft.category} onChange={(e) => handleChange('category', e.target.value as PostReleaseFeedback['category'])}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            ステータス
            <select value={draft.status} onChange={(e) => handleChange('status', e.target.value as PostReleaseFeedback['status'])}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </fieldset>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleSave} className={saved ? 'phaseSavedBtn' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : '保存'}
        </button>
        <button type="button" onClick={() => setDraft(buildInitialFeedback())}>
          <RotateCcw size={16} /> 新規
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
