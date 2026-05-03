import { useEffect, useState } from 'react';
import { ExternalLink, GitPullRequestArrow, RefreshCcw } from 'lucide-react';
import { loadPrWatchState, type PrWatchState } from '../services/prWatchService';

const statusLabel = {
  ok: 'OK',
  checking: '確認中',
  manual: '手動確認',
  blocked: '停止中',
};

const actionsUrl = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/update-pr-watch.yml';

export function PrWatchPanel() {
  const [state, setState] = useState<PrWatchState>({ source: 'loading', items: [] });

  useEffect(() => {
    let active = true;

    loadPrWatchState().then((next) => {
      if (active) {
        setState(next);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="prWatchPanel">
      <div className="prWatchHero">
        <GitPullRequestArrow />
        <div>
          <p className="eyebrow">Phase 6</p>
          <h3>PR Watch</h3>
          <p>GitHubのPR一覧を読むだけで確認する入口です。書き込み操作はしません。</p>
          <small>更新元: {state.source} / PR件数: {state.items.length}</small>
        </div>
      </div>

      <div className="prWatchGuide">
        <div>
          <strong>PR一覧を更新する時</strong>
          <p>Actionsで Update PR Watch File を手動実行すると public/pr-watch.json が更新されます。</p>
        </div>
        <a href={actionsUrl} target="_blank" rel="noreferrer"><RefreshCcw size={16} /> 更新workflowを開く</a>
      </div>

      {state.items.length === 0 ? (
        <div className="prWatchEmpty">
          <strong>今は表示するPRがありません</strong>
          <p>open PRがないか、まだPR Watchを更新していない状態です。</p>
        </div>
      ) : (
        <div className="prWatchGrid">
          {state.items.map((item) => (
            <article className={`prWatchCard pr-${item.status}`} key={item.id}>
              <div className="prWatchCardHead">
                <strong>{item.label}</strong>
                <span>{statusLabel[item.status]}</span>
              </div>
              <p>{item.message}</p>
              {item.meta && (
                <div className="prWatchMeta">
                  {item.meta.head && item.meta.base && <span>{item.meta.head} → {item.meta.base}</span>}
                  {item.meta.updatedAt && <span>更新: {item.meta.updatedAt}</span>}
                </div>
              )}
              {item.url && <a className="prWatchLink" href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> PRを開く</a>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
