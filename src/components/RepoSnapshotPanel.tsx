import { GitPullRequest, ScrollText } from 'lucide-react';
import { repoSnapshot } from '../data/repoSnapshot';

export function RepoSnapshotPanel() {
  return (
    <div className="repoSnapshotPanel">
      <div className="statusLead">
        <ScrollText />
        <div>
          <p className="eyebrow">Read View</p>
          <h3>このリポジトリの現在スナップショット</h3>
          <p>まずは安全に、今見えている開発状況だけを表示しています。</p>
        </div>
      </div>

      <div className="repoSummaryGrid">
        <article><span>Repository</span><strong>{repoSnapshot.fullName}</strong></article>
        <article><span>Visibility</span><strong>{repoSnapshot.visibility}</strong></article>
        <article><span>Default Branch</span><strong>{repoSnapshot.defaultBranch}</strong></article>
        <article><span>Issues</span><strong>{repoSnapshot.issueCount}</strong></article>
      </div>

      <div className="safeReadBox">
        <strong>{repoSnapshot.safetyMode}</strong>
        <p>{repoSnapshot.lastUpdatedLabel}</p>
      </div>

      <div className="prSnapshotList">
        {repoSnapshot.pullRequests.map((pr) => (
          <article className="prSnapshotItem" key={pr.number}>
            <div className="prNumber"><GitPullRequest size={18} /> #{pr.number}</div>
            <div>
              <strong>{pr.title}</strong>
              <p>{pr.summary}</p>
            </div>
            <span>{pr.status}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
