import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, GitPullRequestArrow, RefreshCcw } from 'lucide-react';
import { loadPrWatchState, type PrWatchState } from '../services/prWatchService';
import { buildPrLaneGroups } from '../utils/prLanes';

const statusLabel = {
  ok: 'OK',
  checking: '確認中',
  manual: '手動確認',
  blocked: '停止中',
};

const actionsUrl = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/update-pr-watch.yml';

export function PrWatchPanel() {
  const [state, setState] = useState<PrWatchState>({
    source: 'loading',
    freshness: {
      level: 'unknown',
      label: '読み込み中',
      message: 'PR一覧を読み込んでいます。',
      shouldUpdate: false,
    },
    items: [],
  });
  const laneGroups = useMemo(() => buildPrLaneGroups(state.items), [state.items]);

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

      <div className={`prFreshnessBox prFreshness-${state.freshness.level}`}>
        <div>
          <strong>{state.freshness.shouldUpdate ? '更新すると安心' : '今はだらけてOK'}</strong>
          <span>{state.freshness.label}</span>
        </div>
        <p>{state.freshness.message}</p>
        {typeof state.freshness.minutesOld === 'number' && <small>約{state.freshness.minutesOld}分前のPR一覧です。</small>}
      </div>

      <div className="prLaneGrid">
        {laneGroups.map((group) => (
          <section className={`prLane lane-${group.lane}`} key={group.lane}>
            <div className="prLaneHead">
              <strong>{group.title}</strong>
              <span>{group.items.length}</span>
            </div>
            <p>{group.lead}</p>
            <div className="prLaneItems">
              {group.items.length === 0 && <small>今はありません。</small>}
              {group.items.map((item) => (
                <article key={item.id}>
                  <strong>{item.label}</strong>
                  <span>{statusLabel[item.status]}</span>
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer">開く</a>}
                </article>
              ))}
            </div>
          </section>
        ))}
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
