import { useState } from 'react';
import { MonitorDot, Copy, Check } from 'lucide-react';
import {
  buildDarakeFinalFormState,
  loadDarakeFinalFormState,
  saveDarakeFinalFormState,
  STATUS_LABELS_FINAL,
  formatFinalFormMarkdown,
} from '../utils/darakeFinalFormState';
import type { DarakeFinalFormState } from '../utils/darakeFinalFormState';
import { DarakeFinalFormDetailsDrawer } from './DarakeFinalFormDetailsDrawer';

type CopyState = 'idle' | 'copied';

const SNOOZE_KEY = 'darake.finalForm.snooze.v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isSnoozeActive(): boolean {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < ONE_DAY_MS;
  } catch {
    return false;
  }
}

function buildLiveState(): DarakeFinalFormState {
  return buildDarakeFinalFormState({
    autoHandled: 5,
    batched: 2,
    reviewLater: 1,
    humanNow: 0,
    blocked: 0,
    completionRemaining: 3,
    hiddenPanelCount: 12,
  });
}

const TONE_BG: Record<string, string> = {
  soft: '#f5f5f5',
  good: '#e8f5e9',
  warn: '#fff8e1',
  danger: '#fce4ec',
};

export function DarakeFinalFormPanel() {
  const [snoozed, setSnoozed] = useState(isSnoozeActive);
  const [state, setState] = useState<DarakeFinalFormState>(() => {
    return loadDarakeFinalFormState() ?? buildLiveState();
  });
  const [copyState, setCopyState] = useState<CopyState>('idle');

  if (snoozed) {
    return (
      <div className="phase41Panel">
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          だらけ管制室 — 今日は非表示{' '}
          <button className="phase41Btn" onClick={() => setSnoozed(false)} style={{ marginLeft: 8 }}>
            再表示
          </button>
        </p>
      </div>
    );
  }

  function handleRefresh() {
    const live = buildLiveState();
    saveDarakeFinalFormState(live);
    setState(live);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatFinalFormMarkdown(state));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('idle');
    }
  }

  function handleSnooze() {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setSnoozed(true);
  }

  const showPrimaryNeed = state.primaryNeed.urgency !== 'none';

  return (
    <div className="phase41Panel">
      <div className="phase41Hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <MonitorDot size={28} color="#1976d2" />
          <h1 className="phase41Title">{state.title}</h1>
        </div>
        <p className="phase41MainMsg">{state.mainMessage}</p>
        <p className="phase41SubMsg">{state.subMessage}</p>
        <div style={{ marginTop: 6, fontSize: '0.85rem', color: '#777' }}>
          {STATUS_LABELS_FINAL[state.status]}
        </div>
      </div>

      <div className={`phase41StatusCard ${state.status}`}>
        <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>
          {state.mainMessage}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>{state.subMessage}</div>
      </div>

      <div className="phase41Counters">
        <div className="phase41Counter">
          <h4>{state.counters.autoHandled}</h4>
          <p>自動処理</p>
        </div>
        <div className="phase41Counter">
          <h4>{state.counters.reviewLater}</h4>
          <p>あとで確認</p>
        </div>
        <div className="phase41Counter">
          <h4>{state.counters.humanNow}</h4>
          <p>今すぐ確認</p>
        </div>
        <div className="phase41Counter">
          <h4>{state.counters.blocked}</h4>
          <p>ブロック</p>
        </div>
        <div className="phase41Counter">
          <h4>{state.counters.completionRemaining}</h4>
          <p>完成待ち</p>
        </div>
      </div>

      {state.visibleCards.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {state.visibleCards.map((card) => (
            <div
              key={card.id}
              style={{
                background: TONE_BG[card.tone] ?? '#f5f5f5',
                borderRadius: 12,
                padding: '8px 14px',
                fontSize: '0.85rem',
              }}
            >
              <strong>{card.label}:</strong> {card.value}
            </div>
          ))}
        </div>
      )}

      {showPrimaryNeed && (
        <div className="phase41PrimaryNeed">
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{state.primaryNeed.title}</div>
          <div style={{ fontSize: '0.9rem', color: '#555', whiteSpace: 'pre-line' }}>
            {state.primaryNeed.body}
          </div>
          <button
            className="phase41Btn phase41PrimaryBtn"
            style={{ marginTop: 10 }}
          >
            {state.primaryNeed.actionLabel}
          </button>
        </div>
      )}

      <DarakeFinalFormDetailsDrawer state={state} />

      <div className="phase41BtnRow">
        <button className="phase41Btn" onClick={handleCopy} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
          {copyState === 'copied' ? 'コピー済み' : 'まとめをコピー'}
        </button>
        <button className="phase41Btn" onClick={handleRefresh}>
          更新
        </button>
        {showPrimaryNeed && (
          <button className="phase41Btn phase41PrimaryBtn" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            確認する
          </button>
        )}
        <button className="phase41Btn" onClick={handleSnooze} style={{ marginLeft: 'auto' }}>
          今日は見ない
        </button>
      </div>
    </div>
  );
}
