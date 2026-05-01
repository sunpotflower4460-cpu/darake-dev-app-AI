import { GitPullRequest, ScrollText } from 'lucide-react';
import { repoSnapshot } from '../data/repoSnapshot';

export function InfoPanel() {
  return (
    <div className="infoPanel">
      <div className="statusLead">
        <ScrollText />
        <div>
          <p className="eyebrow">Current View</p>
          <h3>現在の開発スナップショット</h3>
          <p>この画面では、今見えている開発状況を一覧で表示しています。</p>
        </div>
      </div>

      <div className="repoSummaryGrid">
        <article><span>名前</span><strong>{repoSnapshot.name}</strong></article>
        <article><span>公開範囲</span><strong>{repoSnapshot.visibility}</strong></article>
        <article><span>基本ブランチ</span><strong>{repoSnapshot.defaultBranch}</strong></article>
        <article><span>Issue</span><strong>{repoSnapshot.issueCount}</strong></article>
      </div>

      <div className="safeReadBox">
        <strong>{repoSnapshot.safetyMode}</strong>
        <p>{repoSnapshot.lastUpdatedLabel}</p>
      </div>

      <div className="prSnapshotList">
        {repoSnapshot.pullRequests.map((item) => (
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
