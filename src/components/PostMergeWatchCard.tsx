import { useEffect, useMemo, useState } from 'react';
import { loadPostMergeWatchState } from '../utils/postMergeWatch';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

const STATUS_LABELS: Record<string, string> = {
  idle: '待機中',
  'waiting-deploy': 'デプロイを確認しています...',
  'deploy-success': 'デプロイ成功',
  'deploy-failed': 'デプロイ失敗',
  'preview-checking': 'プレビューを確認しています...',
  'preview-ok': 'プレビュー正常',
  'preview-broken': 'プレビュー異常',
  'needs-human': '確認が必要です',
};

export function PostMergeWatchCard() {
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadPostMergeWatchState(), [revision]);

  if (!state || state.status === 'idle') return null;

  const isFailed = state.status === 'deploy-failed' || state.status === 'preview-broken' || state.status === 'needs-human';

  return (
    <div className={`postMergeWatchCard${isFailed ? ' postMergeWatchCard--failed' : ''}`}>
      <div className="postMergeWatchCard__title">
        マージ後の確認
      </div>
      <div className="postMergeWatchCard__status">
        {STATUS_LABELS[state.status] ?? state.status}
      </div>
      <div className="postMergeWatchCard__message">{state.userMessage}</div>
      <div className="postMergeWatchCard__next">
        今やること：{state.nextActionLabel}
      </div>
    </div>
  );
}
