import { useEffect, useState } from 'react';
import { Activity, GitPullRequest, ShieldCheck } from 'lucide-react';
import { reviewWatchPrinciples } from '../data/reviewWatch';
import type { WatchItem } from '../data/reviewWatch';
import { loadReviewWatchState } from '../services/reviewWatchService';

const statusLabel = {
  ok: 'OK',
  checking: '確認',
  manual: '手動',
  blocked: '停止',
};

export function ReviewWatchPanel() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [source, setSource] = useState('loading');

  useEffect(() => {
    let active = true;

    loadReviewWatchState().then((state) => {
      if (active) {
        setItems(state.items);
        setSource(state.source);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="reviewWatchPanel">
      <div className="reviewWatchHero">
        <GitPullRequest />
        <div>
          <p className="eyebrow">Phase 5</p>
          <h3>PR監視の入口</h3>
          <p>PR、CI、レビュー、マージ判断を一か所で見るための入口です。</p>
          <small>更新元: {source}</small>
        </div>
      </div>

      <div className="reviewPrinciples">
        {reviewWatchPrinciples.map((item) => <span key={item}>{item}</span>)}
      </div>

      <div className="reviewWatchGrid">
        {items.map((item) => (
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
