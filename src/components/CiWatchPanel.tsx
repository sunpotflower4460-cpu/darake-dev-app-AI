import { useEffect, useState } from 'react';
import { Activity, ExternalLink, RefreshCcw } from 'lucide-react';
import { loadCiWatchState, type CiWatchState } from '../services/ciWatchService';

const statusLabel = {
  ok: 'OK',
  checking: '確認中',
  manual: '手動確認',
  blocked: '停止中',
};

const riskLabel = {
  low: '低リスク',
  medium: '中リスク',
  high: '高リスク',
  unknown: '未判定',
};

const actionsUrl = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/update-ci-watch.yml';

export function CiWatchPanel() {
  const [state, setState] = useState<CiWatchState>({ source: 'loading', items: [] });

  useEffect(() => {
    let active = true;

    loadCiWatchState().then((next) => {
      if (active) {
        setState(next);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ciWatchPanel">
      <div className="ciWatchHero">
        <Activity />
        <div>
          <p className="eyebrow">Phase 6</p>
          <h3>CI Watch</h3>
          <p>GitHub Actionsの実行状態を読むだけで確認する入口です。再実行や変更操作はしません。</p>
          <small>更新元: {state.source} / CI件数: {state.items.length}</small>
        </div>
      </div>

      <div className="ciWatchGuide">
        <div>
          <strong>CI状態を更新する時</strong>
          <p>Actionsで Update CI Watch File を手動実行すると public/ci-watch.json が更新されます。</p>
        </div>
        <a href={actionsUrl} target="_blank" rel="noreferrer"><RefreshCcw size={16} /> 更新workflowを開く</a>
      </div>

      {state.items.length === 0 ? (
        <div className="ciWatchEmpty">
          <strong>今は表示するCI状態がありません</strong>
          <p>まだCI Watchを更新していないか、表示対象のworkflow runがない状態です。</p>
        </div>
      ) : (
        <div className="ciWatchGrid">
          {state.items.map((item) => (
            <article className={`ciWatchCard ci-${item.status}`} key={item.id}>
              <div className="ciWatchCardHead">
                <strong>{item.label}</strong>
                <span>{statusLabel[item.status]}</span>
              </div>
              {item.risk && <span className={`ciRiskBadge risk-${item.risk}`}>{riskLabel[item.risk]}</span>}
              <p>{item.message}</p>
              {item.meta && (
                <div className="ciWatchMeta">
                  {item.meta.branch && <span>branch: {item.meta.branch}</span>}
                  {item.meta.conclusion && <span>result: {item.meta.conclusion}</span>}
                  {item.meta.updatedAt && <span>更新: {item.meta.updatedAt}</span>}
                </div>
              )}
              {item.url && <a className="ciWatchLink" href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Runを開く</a>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
