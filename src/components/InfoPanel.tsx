import { useEffect, useState } from 'react';
import { GitPullRequest, ScrollText } from 'lucide-react';
import { loadRepoState, type LoadedRepoState } from '../services/repoStateService';

export function InfoPanel() {
  const [state, setState] = useState<LoadedRepoState | null>(null);

  useEffect(() => {
    let active = true;

    loadRepoState().then((nextState) => {
      if (active) {
        setState(nextState);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!state) {
    return (
      <div className="infoPanel">
        <div className="statusLead">
          <ScrollText />
          <div>
            <p className="eyebrow">Current View</p>
            <h3>現在の開発スナップショット</h3>
            <p>状態ファイルを確認しています。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="infoPanel">
      <div className="statusLead">
        <ScrollText />
        <div>
          <p className="eyebrow">Current View</p>
          <h3>現在の開発スナップショット</h3>
          <p>状態ファイルを読める場合はそれを使い、読めない場合は安全な控えデータを表示します。</p>
        </div>
      </div>

      <div className="repoSummaryGrid">
        <article><span>名前</span><strong>{state.name}</strong></article>
        <article><span>公開範囲</span><strong>{state.visibility}</strong></article>
        <article><span>基本ブランチ</span><strong>{state.defaultBranch}</strong></article>
        <article><span>Issue</span><strong>{state.issueCount}</strong></article>
      </div>

      <div className="safeReadBox">
        <strong>{state.safetyMode}</strong>
        <p>更新元: {state.source} / {state.lastUpdatedLabel}</p>
      </div>

      <div className="prSnapshotList">
        {state.pullRequests.map((item) => (
          <article className="prSnapshotItem" key={item.number}>
            <div className="prNumber"><GitPullRequest size={18} /> #{item.number}</div>
            <div>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </div>
            <span>{item.status}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
