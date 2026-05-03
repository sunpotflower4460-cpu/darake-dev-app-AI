import { useEffect, useState } from 'react';
import { Activity, ExternalLink, GitPullRequest, ShieldCheck } from 'lucide-react';
import { reviewUpdateSteps, reviewWatchPrinciples } from '../data/reviewWatch';
import type { WatchItem } from '../data/reviewWatch';
import { loadReviewWatchState, type ReviewFreshness } from '../services/reviewWatchService';

const statusLabel = {
  ok: 'OK',
  checking: '確認',
  manual: '手動',
  blocked: '停止',
};

const actionsUrl = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/update-review-watch.yml';

export function ReviewWatchPanel() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [source, setSource] = useState('loading');
  const [freshness, setFreshness] = useState<ReviewFreshness | null>(null);

  useEffect(() => {
    let active = true;

    loadReviewWatchState().then((state) => {
      if (active) {
        setItems(state.items);
        setSource(state.source);
        setFreshness(state.freshness);
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

      {freshness && (
        <div className={`reviewFreshnessBox reviewFreshness-${freshness.level}`}>
          <div>
            <strong>{freshness.shouldUpdate ? '更新すると安心' : '今はだらけてOK'}</strong>
            <span>{freshness.label}</span>
          </div>
          <p>{freshness.message}</p>
          {typeof freshness.minutesOld === 'number' && <small>約{freshness.minutesOld}分前の状態です。</small>}
        </div>
      )}

      <div className="reviewPrinciples">
        {reviewWatchPrinciples.map((item) => <span key={item}>{item}</span>)}
      </div>

      <div className="reviewUpdateBox">
        <div className="reviewUpdateHead">
          <strong>状態を更新する時</strong>
          <a href={actionsUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Actionsを開く</a>
        </div>
        <div className="reviewUpdateSteps">
          {reviewUpdateSteps.map((step, index) => (
            <article key={step.id}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </article>
          ))}
        </div>
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
