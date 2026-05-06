import { useState } from 'react';
import { MonitorDot, Copy, Check } from 'lucide-react';
import {
  buildOneScreenCommandState,
  loadOneScreenCommandState,
  saveOneScreenCommandState,
  STATUS_LABELS,
  STATUS_EMOJI,
  formatOneScreenCommandStateMarkdown,
} from '../utils/oneScreenCommandState';
import { loadAutoAdvanceQueue } from '../utils/noOkAutoAdvanceQueue';
import { loadDarakeReviewInbox } from '../utils/darakeReviewInbox';

type CopyState = 'idle' | 'copied' | 'failed';

function buildLiveState() {
  const tasks = loadAutoAdvanceQueue();
  const inboxItems = loadDarakeReviewInbox();

  const autoProgressCount = tasks.filter((t) => t.status === 'auto-completed').length;
  const blockedCount = tasks.filter((t) => t.status === 'blocked').length;
  const urgentItems = inboxItems.filter((i) => i.priority === 'urgent' && i.status === 'unread');
  const humanNeedCount = urgentItems.length + blockedCount;
  const reviewInboxCount = inboxItems.filter((i) => i.status === 'unread').length;

  const primaryItem = urgentItems[0] ?? inboxItems.find((i) => i.status === 'unread');

  return buildOneScreenCommandState({
    autoProgressCount,
    humanNeedCount,
    blockedCount,
    reviewInboxCount,
    primaryCardTitle: primaryItem ? '次に見るなら' : '今は何もない',
    primaryCardBody: primaryItem
      ? primaryItem.title + (primaryItem.recommendedAction ? `\n→ ${primaryItem.recommendedAction}` : '')
      : 'だらけていて大丈夫です 😴',
    primaryActionLabel: primaryItem ? '詳細を見る' : '完成マップを見る',
    primaryActionType: primaryItem ? 'open-review-inbox' : 'show-completion-map',
  });
}

export function OneScreenCommandCenterPanel() {
  const [state, setState] = useState(() => {
    const saved = loadOneScreenCommandState();
    return saved ?? buildLiveState();
  });
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleRefresh() {
    const live = buildLiveState();
    saveOneScreenCommandState(live);
    setState(live);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatOneScreenCommandStateMarkdown(state));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const emoji = STATUS_EMOJI[state.status];
  const label = STATUS_LABELS[state.status];

  return (
    <div className="phase38Panel">
      <div className="phase38Hero">
        <MonitorDot />
        <div>
          <p className="eyebrow">Phase 38.2 — One Screen</p>
          <h3>だらけ管制室</h3>
          <p>通常はこの1枚だけ見れば十分です。詳細は必要な時だけ開きます。</p>
        </div>
      </div>

      <div className={`phase38StatusCard ${state.status === 'blocked' ? 'blocked' : ''}`}>
        <h2>{emoji} {label}</h2>
        <p className="subline">{state.subline}</p>
      </div>

      {state.status === 'blocked' && (
        <div className="phase38BlockedBanner">
          🚫 {state.blockedSummary}
        </div>
      )}

      <div className="phase38SecondaryGrid">
        {state.secondaryCards.map((card) => (
          <section key={card.label} className={`tone-${card.tone}`}>
            <h4>{card.label}</h4>
            <p>{card.value}</p>
          </section>
        ))}
      </div>

      {state.primaryCard.body !== '（今は何もない）' && (
        <div className="phase38PrimaryCard">
          <h4>{state.primaryCard.title}</h4>
          <p>{state.primaryCard.body}</p>
        </div>
      )}

      <div className="phase38BtnRow">
        <button className="phase38SmallBtn" onClick={handleRefresh}>
          🔄 今のデータで更新
        </button>
        <button className="phase38SmallBtn">
          📋 Review Inbox
        </button>
        <button className="phase38SmallBtn">
          🎯 完成マップ
        </button>
        <button className={`phase38PrimaryBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} 全部コピー
        </button>
      </div>
    </div>
  );
}
