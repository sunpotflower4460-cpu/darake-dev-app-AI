import { useMemo, useState } from 'react';
import { Bell, Check, Copy } from 'lucide-react';
import type { NotificationEvent } from '../utils/notificationEventModel';
import {
  buildNotificationEvent,
  formatNotificationEventMarkdown,
  shouldNotifyImmediately,
} from '../utils/notificationEventModel';
import { severityLabel } from '../utils/notificationDigest';

const SAMPLE_EVENTS: NotificationEvent[] = [
  buildNotificationEvent({
    id: 'sample-submit-ready',
    type: 'app-store-submit-ready',
    severity: 'manual-gate',
    appName: 'だらけアプリ',
    phaseLabel: 'Phase 13',
    title: 'App Store提出前確認',
    summary: 'Submit for Review前の手動ゲートです。',
    reason: '提出の最終確認は人間が行います。',
    actionRequired: 'App Store Connectを開き、全セクションを確認してSubmit for Reviewを押してください。',
    urls: [{ label: 'App Store Connect', value: 'https://appstoreconnect.apple.com' }],
  }),
  buildNotificationEvent({
    id: 'sample-completion-near',
    type: 'completion-near',
    severity: 'info',
    appName: 'だらけアプリ',
    phaseLabel: 'Phase 10',
    title: '完成間近',
    summary: 'スクショ準備の軽微なwarningがあります。',
    reason: '後で直せる改善候補です。',
    actionRequired: '完成レポートで確認してください。',
    urls: [],
  }),
];

type CopyState = 'idle' | 'copied' | 'failed';

export function NotificationDraftPanel() {
  const [copyStates, setCopyStates] = useState<Record<string, CopyState>>({});
  const events = useMemo(() => SAMPLE_EVENTS, []);

  async function handleCopy(event: NotificationEvent, type: 'short' | 'markdown') {
    const text =
      type === 'short'
        ? `【${event.severity}】${event.title}\n${event.summary}\n対応: ${event.actionRequired}`
        : formatNotificationEventMarkdown(event);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates((prev) => ({ ...prev, [`${event.id}-${type}`]: 'copied' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [`${event.id}-${type}`]: 'idle' })), 1800);
    } catch {
      setCopyStates((prev) => ({ ...prev, [`${event.id}-${type}`]: 'failed' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [`${event.id}-${type}`]: 'idle' })), 2400);
    }
  }

  const immediate = events.filter((e) => e.shouldNotifyNow);
  const batched = events.filter((e) => e.canBatchUntilCompletionReport);

  return (
    <div className="notificationDraftPanel">
      <div className="notificationDraftHero">
        <Bell />
        <div>
          <p className="eyebrow">Phase 11.2</p>
          <h3>通知候補一覧</h3>
          <p>今すぐ通知 / 完成レポート行きを分類し、文面をコピーできます。外部への送信はしません。</p>
        </div>
      </div>

      <div className="notificationDraftSafetyBox">
        <strong>外部送信なし</strong>
        <p>このパネルは通知文の生成とコピーのみです。Telegram・Slack・メール等への送信は行いません。</p>
      </div>

      {immediate.length > 0 && (
        <div className="notificationDraftSection notificationDraftImmediate">
          <h4>🔔 今すぐ確認（{immediate.length}件）</h4>
          {immediate.map((event) => (
            <NotificationCard
              key={event.id}
              event={event}
              copyStates={copyStates}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {batched.length > 0 && (
        <div className="notificationDraftSection notificationDraftBatched">
          <h4>📋 完成レポート行き（{batched.length}件）</h4>
          {batched.map((event) => (
            <NotificationCard
              key={event.id}
              event={event}
              copyStates={copyStates}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {events.length === 0 && (
        <div className="notificationDraftEmpty">
          <p>通知候補はありません。</p>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  event,
  copyStates,
  onCopy,
}: {
  event: NotificationEvent;
  copyStates: Record<string, CopyState>;
  onCopy: (event: NotificationEvent, type: 'short' | 'markdown') => void;
}) {
  const immediate = shouldNotifyImmediately(event);
  return (
    <div className={`notificationCard notificationCard-${event.severity}`}>
      <div className="notificationCardHeader">
        <span className="notificationCardSeverity">{severityLabel(event.severity)}</span>
        <span className="notificationCardBadge">{immediate ? '今すぐ通知' : '完成レポート行き'}</span>
      </div>
      <p className="notificationCardTitle">{event.title}</p>
      <p className="notificationCardSummary">{event.summary}</p>
      <p className="notificationCardAction">対応: {event.actionRequired}</p>
      {event.urls.length > 0 && (
        <ul className="notificationCardUrls">
          {event.urls.map((u) => (
            <li key={u.value}>
              <a href={u.value} target="_blank" rel="noreferrer">{u.label}</a>
            </li>
          ))}
        </ul>
      )}
      <div className="notificationCardActions">
        <button
          type="button"
          onClick={() => onCopy(event, 'short')}
          className={`notificationCopyButton copy-${copyStates[`${event.id}-short`] ?? 'idle'}`}
        >
          {copyStates[`${event.id}-short`] === 'copied' ? <Check size={14} /> : <Copy size={14} />}
          Telegram短文コピー
        </button>
        <button
          type="button"
          onClick={() => onCopy(event, 'markdown')}
          className={`notificationCopyButton copy-${copyStates[`${event.id}-markdown`] ?? 'idle'}`}
        >
          {copyStates[`${event.id}-markdown`] === 'copied' ? <Check size={14} /> : <Copy size={14} />}
          Markdown詳細コピー
        </button>
      </div>
    </div>
  );
}
