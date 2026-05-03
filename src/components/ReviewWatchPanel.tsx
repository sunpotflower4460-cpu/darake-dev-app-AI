import { Activity, GitPullRequest, ShieldCheck } from 'lucide-react';
import { reviewWatchItems, reviewWatchPrinciples } from '../data/reviewWatch';

const statusLabel = {
  ok: 'OK',
  checking: '確認',
  manual: '手動',
  blocked: '停止',
};

export function ReviewWatchPanel() {
  return (
    <div className="reviewWatchPanel">
      <div className="reviewWatchHero">
        <GitPullRequest />
        <div>
          <p className="eyebrow">Phase 5</p>
          <h3>PR監視の入口</h3>
          <p>PR、CI、レビュー、マージ判断を一か所で見るための入口です。</p>
        </div>
      </div>

      <div className="reviewPrinciples">
        {reviewWatchPrinciples.map((item) => <span key={item}>{item}</span>)}
      </div>

      <div className="reviewWatchGrid">
        {reviewWatchItems.map((item) => (
          <article className={`reviewWatchCard watch-${item.status}`} key={item.id}>
            <div>
              {item.status === 'ok' ? <ShieldCheck /> : <Activity />}
              <span>{statusLabel[item.status]}</span>
            </div>
            <strong>{item.label}</strong>
            <p>{item.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
