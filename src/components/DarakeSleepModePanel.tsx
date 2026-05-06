import { useState } from 'react';
import { Moon, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  buildDarakeSleepMode,
  loadDarakeSleepMode,
  saveDarakeSleepMode,
  STATUS_LABELS,
  STATUS_EMOJI,
  formatDarakeSleepModeMarkdown,
} from '../utils/darakeSleepMode';
import type { DarakeSleepMode } from '../utils/darakeSleepMode';

type CopyState = 'idle' | 'copied';

const SNOOZE_KEY = 'darake.sleepMode.snooze.v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isSnoozeActive(): boolean {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Date.now() - ts < ONE_DAY_MS;
  } catch {
    return false;
  }
}

function buildLiveState(): DarakeSleepMode {
  return buildDarakeSleepMode({
    autoHandledCount: 3,
    batchedWarningCount: 1,
    laterReviewCount: 2,
    urgentHumanCount: 0,
    blockedCount: 0,
    hiddenBecauseSafe: ['低リスク警告 ×3', 'CI通過ログ ×5'],
  });
}

export function DarakeSleepModePanel() {
  const [snoozed, setSnoozed] = useState(isSnoozeActive);
  const [state, setState] = useState<DarakeSleepMode>(() => {
    return loadDarakeSleepMode() ?? buildLiveState();
  });
  const [showDetails, setShowDetails] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  if (snoozed) {
    return (
      <div className="phase39Panel">
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          スリープモード — 今日は非表示 <button className="phase39Btn" onClick={() => setSnoozed(false)} style={{ marginLeft: 8 }}>再表示</button>
        </p>
      </div>
    );
  }

  function handleRefresh() {
    const live = buildLiveState();
    saveDarakeSleepMode(live);
    setState(live);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatDarakeSleepModeMarkdown(state));
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

  const statusClass =
    state.status === 'blocked'
      ? 'blocked'
      : state.status === 'quiet-monitoring' || state.status === 'sleep-ok'
        ? 'quiet'
        : '';

  return (
    <div className="phase39Panel">
      <div className="phase39Hero">
        <Moon size={24} color="#555" />
        <div>
          <strong style={{ fontSize: '1.1rem' }}>{state.title}</strong>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>Phase 39</div>
        </div>
      </div>

      <div className={`phase39StatusCard ${statusClass}`}>
        <div style={{ fontSize: '2rem', marginBottom: 6 }}>{STATUS_EMOJI[state.status]}</div>
        <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>{state.headline}</div>
        <div style={{ color: '#555', fontSize: '0.9rem' }}>{state.subline}</div>
        <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#666' }}>{STATUS_LABELS[state.status]}</div>
      </div>

      <div className="phase39Counters">
        <div className="phase39Counter">
          <h4>{state.autoHandledCount}</h4>
          <p>自動処理済み</p>
        </div>
        <div className="phase39Counter">
          <h4>{state.laterReviewCount}</h4>
          <p>あとで確認</p>
        </div>
        <div className="phase39Counter">
          <h4>{state.urgentHumanCount}</h4>
          <p>急ぎの確認</p>
        </div>
        <div className="phase39Counter">
          <h4>{state.blockedCount}</h4>
          <p>ブロック中</p>
        </div>
      </div>

      {state.nextHumanAction && (
        <div style={{ background: '#fffde7', borderRadius: 14, padding: '12px 14px', marginBottom: 12, fontSize: '0.9rem' }}>
          <strong>次のアクション:</strong> {state.nextHumanAction}
        </div>
      )}

      <div className="phase39BtnRow">
        <button className="phase39Btn" onClick={() => setShowDetails((v) => !v)}>
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showDetails ? '詳細を閉じる' : '詳細を見る'}
        </button>
        <button className="phase39Btn" onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
          {copyState === 'copied' ? 'コピー済み' : 'まとめをコピー'}
        </button>
        <button className="phase39Btn" onClick={handleRefresh}>
          更新
        </button>
        <button className="phase39Btn" onClick={handleSnooze} style={{ marginLeft: 'auto' }}>
          今日は見ない
        </button>
      </div>

      {showDetails && (
        <div className="phase39Details">
          {state.hiddenBecauseSafe.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: '0.85rem', color: '#555' }}>安全なので非表示:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {state.hiddenBecauseSafe.map((h, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#666' }}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {state.wakeReasons.length > 0 && (
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#555' }}>起こす理由:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {state.wakeReasons.map((r, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#666' }}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          <pre style={{ fontSize: '0.75rem', color: '#888', marginTop: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {state.detailsMarkdown}
          </pre>
        </div>
      )}
    </div>
  );
}
