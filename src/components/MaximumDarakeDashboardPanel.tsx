import { useState } from 'react';
import { LayoutDashboard, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  buildMaximumDarakeDashboard,
  formatMaximumDarakeDashboardMarkdown,
  DASHBOARD_STATUS_ICONS,
  DASHBOARD_STATUS_LABELS,
} from '../utils/maximumDarakeDashboard';
import type { MaximumDarakeDashboard } from '../utils/maximumDarakeDashboard';
import { loadAutoAdvanceQueue } from '../utils/noOkAutoAdvanceQueue';
import { loadSilentBatchLog } from '../utils/silentBatchLog';
import { loadDarakeReviewInbox } from '../utils/darakeReviewInbox';

type CopyState = 'idle' | 'copied' | 'failed';

const STORAGE_KEY = 'darake.maximumDarakeDashboard.v1';

function loadDashboard(): MaximumDarakeDashboard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultDashboard();
    return JSON.parse(raw) as MaximumDarakeDashboard;
  } catch {
    return buildDefaultDashboard();
  }
}

function saveDashboard(dashboard: MaximumDarakeDashboard): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboard));
  } catch {
    // ignore
  }
}

function buildDefaultDashboard(): MaximumDarakeDashboard {
  return buildMaximumDarakeDashboard({ title: 'Maximum Darake Dashboard' });
}

function buildLiveDashboard(): MaximumDarakeDashboard {
  const tasks = loadAutoAdvanceQueue();
  const logItems = loadSilentBatchLog();
  const inboxItems = loadDarakeReviewInbox();

  const autoCompleted = tasks.filter((t) => t.status === 'auto-completed').length;
  const blocked = tasks.filter((t) => t.status === 'blocked').length;
  const warnings = logItems.filter((i) => i.severity === 'warning').length;
  const urgent = inboxItems.filter(
    (i) => i.priority === 'urgent' && i.status === 'unread'
  ).length;
  const unread = inboxItems.filter((i) => i.status === 'unread').length;

  let status: MaximumDarakeDashboard['status'] = 'quiet';
  if (blocked > 0) status = 'blocked';
  else if (urgent > 0) status = 'needs-human-now';
  else if (autoCompleted > 0 || warnings > 0) status = 'running-safely';
  else if (unread > 0) status = 'needs-later-review';

  const urgentItem = inboxItems.find((i) => i.priority === 'urgent' && i.status === 'unread');
  const blockedTask = tasks.find((t) => t.status === 'blocked');

  return buildMaximumDarakeDashboard({
    title: 'Maximum Darake Dashboard',
    status,
    headline: buildHeadline(status, blockedTask, urgentItem, autoCompleted, unread),
    autoCompletedCount: autoCompleted,
    batchedWarningCount: warnings,
    reviewInboxCount: unread,
    urgentCount: urgent,
    oneThingToSee: buildOneThingToSee(
      urgentItem,
      blockedTask,
      inboxItems.find((i) => i.status === 'unread')
    ),
    recommendedHumanAction: buildRecommendedHumanAction(urgentItem, blocked, unread),
  });
}

function buildHeadline(
  status: MaximumDarakeDashboard['status'],
  blockedTask: { title: string } | undefined,
  urgentItem: { title: string } | undefined,
  autoCompleted: number,
  unread: number
): string {
  if (status === 'blocked') return `ブロック中: ${blockedTask?.title ?? '不明'}`;
  if (status === 'needs-human-now') return `urgent: ${urgentItem?.title ?? '不明'}`;
  if (status === 'running-safely') return `だいたい順調（自動: ${autoCompleted}件）`;
  if (status === 'needs-later-review') return `あとで見ればいい（${unread}件）`;
  return '今は何もない';
}

function buildOneThingToSee(
  urgentItem: { title: string } | undefined,
  blockedTask: { title: string } | undefined,
  unreadItem: { title: string } | undefined
): string {
  if (urgentItem) return urgentItem.title;
  if (blockedTask) return blockedTask.title;
  if (unreadItem) return unreadItem.title;
  return '（今は何もない）';
}

function buildRecommendedHumanAction(
  urgentItem: { recommendedAction?: string } | undefined,
  blocked: number,
  unread: number
): string {
  if (urgentItem?.recommendedAction) return urgentItem.recommendedAction;
  if (blocked > 0) return '🚫 blockedタスクを確認してください';
  if (unread > 0) return '📋 Review Inboxを確認してください';
  return '😴 今は何もしなくてよいです';
}


export function MaximumDarakeDashboardPanel() {
  const [dashboard, setDashboard] = useState(() => loadDashboard());
  const [showDetails, setShowDetails] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleRefresh() {
    const live = buildLiveDashboard();
    saveDashboard(live);
    setDashboard(live);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatMaximumDarakeDashboardMarkdown(dashboard));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const icon = DASHBOARD_STATUS_ICONS[dashboard.status];
  const statusLabel = DASHBOARD_STATUS_LABELS[dashboard.status];

  return (
    <div className="phase35dPanel">
      <div className="phase35dHero">
        <LayoutDashboard />
        <div>
          <p className="eyebrow">Phase 35.2</p>
          <h3>Maximum Darake Dashboard</h3>
          <p>最大だらけモード用の最小画面。今見るべき1件だけ表示します。</p>
        </div>
      </div>

      <div className="phase35dStatusCard">
        <h2>{icon} {statusLabel}</h2>
        {dashboard.headline && (
          <p>{dashboard.headline}</p>
        )}
      </div>

      {dashboard.status === 'blocked' && (
        <div className="phase35dBlockedBanner">
          🚫 ブロック中: {dashboard.oneThingToSee}
        </div>
      )}

      <div className="phase35dCountGrid">
        <section><h4>裏で進めたこと</h4><p>{dashboard.autoCompletedCount}件</p></section>
        <section><h4>warningまとめ</h4><p>{dashboard.batchedWarningCount}件</p></section>
        <section><h4>あとで見ればいい</h4><p>{dashboard.reviewInboxCount}件</p></section>
        <section><h4>本当に見る必要</h4><p style={{ color: dashboard.urgentCount > 0 ? '#8b1010' : undefined }}>{dashboard.urgentCount}件</p></section>
      </div>

      {dashboard.oneThingToSee && dashboard.oneThingToSee !== '（今は何もない）' && (
        <div className="phase35dOneThingCard">
          <h4>次に人間が見るべきもの</h4>
          <p>{dashboard.oneThingToSee}</p>
          {dashboard.recommendedHumanAction && (
            <p style={{ marginTop: 6, fontSize: '0.78rem', color: '#7a5000', fontWeight: 600 }}>
              → {dashboard.recommendedHumanAction}
            </p>
          )}
        </div>
      )}

      <div className="phase35dBtnRow">
        <button className="phase35dSmallBtn" onClick={handleRefresh}>
          🔄 今のデータで更新
        </button>
        <button className="phase35dSmallBtn" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showDetails ? '詳細を閉じる' : '詳細を見る'}
        </button>
        <button className="phase35dSmallBtn" onClick={() => setShowDetails(false)}>
          今日は見ない
        </button>
        <button className={`phase35dCopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} 全部まとめてコピー
        </button>
      </div>

      {showDetails && dashboard.detailsMarkdown && (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(30,80,200,0.04)', border: '1px solid rgba(30,80,200,0.12)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
          {dashboard.detailsMarkdown}
        </div>
      )}
    </div>
  );
}
