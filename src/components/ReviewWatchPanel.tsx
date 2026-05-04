import { useEffect, useMemo, useState } from 'react';
import { Activity, ExternalLink, GitPullRequest, ShieldCheck } from 'lucide-react';
import { reviewUpdateSteps, reviewWatchPrinciples } from '../data/reviewWatch';
import type { WatchItem } from '../data/reviewWatch';
import { loadCiWatchState, type CiWatchState } from '../services/ciWatchService';
import { loadPrWatchState, type PrWatchState } from '../services/prWatchService';
import { loadReviewWatchState, type ReviewFreshness } from '../services/reviewWatchService';
import { buildReviewAlert } from '../utils/reviewAlert';
import { buildReviewLaneGroups } from '../utils/reviewLanes';
import { convertCiToReviewWatchItem } from '../utils/ciReviewBridge';
import { convertPrToReviewWatchItem } from '../utils/prReviewBridge';

const statusLabel = {
  ok: 'OK',
  checking: '確認',
  manual: '手動',
  blocked: '停止',
};

const riskLabel = {
  low: '低リスク',
  medium: '中リスク',
  high: '高リスク',
  unknown: '未判定',
};

const actionsUrl = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/update-review-watch.yml';

export function ReviewWatchPanel() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [source, setSource] = useState('loading');
  const [freshness, setFreshness] = useState<ReviewFreshness | null>(null);
  const [prState, setPrState] = useState<PrWatchState | null>(null);
  const [ciState, setCiState] = useState<CiWatchState | null>(null);
  const prReviewItems = useMemo(() => prState?.items.map(convertPrToReviewWatchItem) ?? [], [prState]);
  const ciReviewItems = useMemo(() => ciState?.items.map(convertCiToReviewWatchItem) ?? [], [ciState]);
  const mergedItems = useMemo(() => [...items, ...prReviewItems, ...ciReviewItems], [items, prReviewItems, ciReviewItems]);
  const laneGroups = useMemo(() => buildReviewLaneGroups(mergedItems), [mergedItems]);
  const alert = useMemo(() => buildReviewAlert(mergedItems), [mergedItems]);

  useEffect(() => {
    let active = true;

    Promise.all([loadReviewWatchState(), loadPrWatchState(), loadCiWatchState()]).then(([state, nextPrState, nextCiState]) => {
      if (active) {
        setItems(state.items);
        setSource(state.source);
        setFreshness(state.freshness);
        setPrState(nextPrState);
        setCiState(nextCiState);
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
          <small>更新元: {source} / PR由来: {prReviewItems.length}件 / CI由来: {ciReviewItems.length}件</small>
        </div>
      </div>

      {alert.show && (
        <div className="reviewAlertBox">
          <div>
            <strong>{alert.title}</strong>
            <span>{alert.count}</span>
          </div>
          <p>{alert.message}</p>
          {alert.actionUrl && alert.actionLabel && (
            <a href={alert.actionUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> {alert.actionLabel}</a>
          )}
        </div>
      )}

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

      <div className="reviewPrBridgeNotice">
        <strong>PR Watch読み取り統合</strong>
        <p>Review Watch固定項目 {items.length}件に、PR Watch由来 {prReviewItems.length}件を読み取り専用で合流しています。</p>
        <small>PR由来項目は public/pr-watch.json から読み込みます。書き込み操作や自動マージ判断には使いません。</small>
      </div>

      <div className="reviewCiBridgeNotice">
        <strong>CI Watch読み取り統合</strong>
        <p>Review Watch固定項目 {items.length}件に、CI Watch由来 {ciReviewItems.length}件を読み取り専用で合流しています。</p>
        <small>CI由来項目は public/ci-watch.json から読み込みます。workflow再実行や自動マージ判断には使いません。</small>
      </div>

      <div className="reviewPrinciples">
        {reviewWatchPrinciples.map((item) => <span key={item}>{item}</span>)}
      </div>

      <div className="reviewLaneGrid">
        {laneGroups.map((group) => (
          <section className={`reviewLane lane-${group.lane}`} key={group.lane}>
            <div className="reviewLaneHead">
              <strong>{group.title}</strong>
              <span>{group.items.length}</span>
            </div>
            <p>{group.lead}</p>
            <div className="reviewLaneItems">
              {group.items.length === 0 && <small>今はありません。</small>}
              {group.items.map((item) => (
                <article key={item.id}>
                  <strong>{item.label}</strong>
                  <span>{statusLabel[item.status]}</span>
                  {item.risk && <span className={`riskBadge risk-${item.risk}`}>{riskLabel[item.risk]}</span>}
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer">開く</a>}
                </article>
              ))}
            </div>
          </section>
        ))}
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
        {mergedItems.map((item) => (
          <article className={`reviewWatchCard watch-${item.status}`} key={item.id}>
            <div>
              {item.status === 'ok' ? <ShieldCheck /> : <Activity />}
              <span>{statusLabel[item.status]}</span>
            </div>
            <strong>{item.label}</strong>
            {item.risk && <span className={`riskBadge risk-${item.risk}`}>{riskLabel[item.risk]}</span>}
            <p>{item.message}</p>
            {item.url && <a className="reviewWatchCardLink" href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> 開く</a>}
          </article>
        ))}
      </div>
    </div>
  );
}
