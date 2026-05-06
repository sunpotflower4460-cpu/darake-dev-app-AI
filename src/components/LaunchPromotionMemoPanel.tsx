import { useState } from 'react';
import { Check, Copy, Megaphone, Trash2 } from 'lucide-react';
import {
  LaunchPromotionMemo,
  buildInitialLaunchPromotionMemo,
  loadLaunchPromotionMemos,
  saveLaunchPromotionMemos,
  addLaunchPromotionMemo,
  updateLaunchPromotionMemo,
  formatLaunchPromotionMemoMarkdown,
} from '../utils/launchPromotionMemo';

type CopyState = { [appId: string]: 'idle' | 'copied' | 'failed' };

export function LaunchPromotionMemoPanel() {
  const [memos, setMemos] = useState<LaunchPromotionMemo[]>(loadLaunchPromotionMemos);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [saveMsg, setSaveMsg] = useState('');

  function handleChange<K extends keyof LaunchPromotionMemo>(
    appId: string,
    key: K,
    value: LaunchPromotionMemo[K],
  ) {
    setMemos((prev) =>
      updateLaunchPromotionMemo(prev, { ...prev.find((m) => m.appId === appId)!, [key]: value }),
    );
  }

  function handleAdd() {
    setMemos((prev) => addLaunchPromotionMemo(prev, buildInitialLaunchPromotionMemo()));
  }

  function handleDelete(appId: string) {
    setMemos((prev) => prev.filter((m) => m.appId !== appId));
  }

  function handleSave() {
    saveLaunchPromotionMemos(memos);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleCopy(memo: LaunchPromotionMemo) {
    try {
      await navigator.clipboard.writeText(formatLaunchPromotionMemoMarkdown(memo));
      setCopyStates((prev) => ({ ...prev, [memo.appId]: 'copied' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [memo.appId]: 'idle' })), 1800);
    } catch {
      setCopyStates((prev) => ({ ...prev, [memo.appId]: 'failed' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [memo.appId]: 'idle' })), 2400);
    }
  }

  return (
    <div className="phase22Panel">
      <div className="phase22Hero">
        <Megaphone />
        <div>
          <p className="eyebrow">Phase 22.4</p>
          <h3>Launch Promotion メモ</h3>
          <p>アプリのプロモーション計画を管理します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>📝 Promotionメモ</strong>
        <p>SNSへの自動投稿はしません。投稿は手動で行ってください。</p>
      </div>

      <div className="phase22MemoList">
        {memos.length === 0 && (
          <div className="phaseInfoBox"><p>メモがありません。「+ メモ追加」から追加してください。</p></div>
        )}
        {memos.map((memo) => (
          <div key={memo.appId} className="phase22MemoItem">
            <div className="phase22MemoHeader">
              <span className="phase22AppName">{memo.appName || '（アプリ名未設定）'}</span>
              <button type="button" className="phase19DeleteBtn" onClick={() => handleDelete(memo.appId)} aria-label="削除">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="phaseForm">
              <label>アプリ名<input value={memo.appName} onChange={(e) => handleChange(memo.appId, 'appName', e.target.value)} placeholder="例: ねこ電卓" /></label>
              <label>SNS投稿案<textarea rows={3} value={memo.snsPost} onChange={(e) => handleChange(memo.appId, 'snsPost', e.target.value)} placeholder="例: 癒しのねこ電卓をリリースしました！..." /></label>
              <label>LP文言案<textarea rows={3} value={memo.lpCopy} onChange={(e) => handleChange(memo.appId, 'lpCopy', e.target.value)} placeholder="例: ねこが計算してくれる、ゆるい電卓アプリ" /></label>
              <label>初回告知文<textarea rows={2} value={memo.initialAnnouncement} onChange={(e) => handleChange(memo.appId, 'initialAnnouncement', e.target.value)} placeholder="例: 本日リリースしました！" /></label>
              <label>友人テスト依頼文<textarea rows={2} value={memo.friendTestRequest} onChange={(e) => handleChange(memo.appId, 'friendTestRequest', e.target.value)} placeholder="例: テスターとして使ってみてほしい！" /></label>
              <label>X（Twitter）プラン<textarea rows={2} value={memo.xPlan} onChange={(e) => handleChange(memo.appId, 'xPlan', e.target.value)} placeholder="例: 毎日1ポスト、開発ログも投稿" /></label>
              <label>Instagram プラン<textarea rows={2} value={memo.instagramPlan} onChange={(e) => handleChange(memo.appId, 'instagramPlan', e.target.value)} placeholder="例: スクリーンショット投稿" /></label>
              <label>YouTube Shorts アイデア<textarea rows={2} value={memo.youtubeShortsIdea} onChange={(e) => handleChange(memo.appId, 'youtubeShortsIdea', e.target.value)} placeholder="例: 30秒の操作デモ動画" /></label>
              <label>TikTok アイデア<textarea rows={2} value={memo.tiktokIdea} onChange={(e) => handleChange(memo.appId, 'tiktokIdea', e.target.value)} placeholder="例: ねこアニメのショート動画" /></label>
              <label>note / ブログ案<textarea rows={2} value={memo.noteBlogIdea} onChange={(e) => handleChange(memo.appId, 'noteBlogIdea', e.target.value)} placeholder="例: 開発ストーリーをnoteに投稿" /></label>
              <label>ノート<textarea rows={2} value={memo.notes} onChange={(e) => handleChange(memo.appId, 'notes', e.target.value)} placeholder="その他メモ" /></label>
            </div>
            <div className="phase20CandidateActions">
              <button type="button" className={`phaseCopyBtn copy-${copyStates[memo.appId] ?? 'idle'}`} onClick={() => handleCopy(memo)}>
                {copyStates[memo.appId] === 'copied' ? <Check size={16} /> : <Copy size={16} />}
                コピー
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleAdd}>+ メモ追加</button>
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '保存'}
        </button>
      </div>
    </div>
  );
}
