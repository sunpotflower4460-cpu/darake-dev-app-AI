import { useState } from 'react';
import { Sun, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  buildDarakeMorningReport,
  loadDarakeMorningReport,
  saveDarakeMorningReport,
  STATUS_LABELS_MORNING,
  formatMorningReportMarkdown,
} from '../utils/darakeMorningReport';
import type { DarakeMorningReport } from '../utils/darakeMorningReport';

type CopyState = 'idle' | 'copied';

const SNOOZE_KEY = 'darake.morningReport.snooze.v1';

function isSnoozeActive(): boolean {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function buildLiveState(): DarakeMorningReport {
  return buildDarakeMorningReport({
    quietItems: ['CIパイプライン 4件通過', '自動PR作成 1件'],
    waitItems: ['スクリーンショット確認'],
    humanItems: [],
    blockedItems: [],
    autoHandledCount: 5,
  });
}

export function DarakeMorningReportPanel() {
  const [snoozed, setSnoozed] = useState(isSnoozeActive);
  const [state, setState] = useState<DarakeMorningReport>(() => {
    return loadDarakeMorningReport() ?? buildLiveState();
  });
  const [showDetails, setShowDetails] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  if (snoozed) {
    return (
      <div className="phase40Panel">
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          モーニングレポート — 今日は非表示{' '}
          <button className="phase40Btn" onClick={() => setSnoozed(false)} style={{ marginLeft: 8 }}>
            再表示
          </button>
        </p>
      </div>
    );
  }

  function handleRefresh() {
    const live = buildLiveState();
    saveDarakeMorningReport(live);
    setState(live);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatMorningReportMarkdown(state));
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

  return (
    <div className="phase40Panel">
      <div className="phase40Hero">
        <Sun size={26} color="#f9a825" />
        <div>
          <h2 className="phase40Greeting">{state.greeting}</h2>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>Phase 40</div>
        </div>
      </div>

      <div className="phase40StatusLabel">{STATUS_LABELS_MORNING[state.status]}</div>

      <p className="phase40Summary">{state.oneLineSummary}</p>

      <div className="phase40Counters">
        <div className="phase40Counter">
          <h4>{state.whatHappenedQuietly.length}</h4>
          <p>裏で整ったこと</p>
        </div>
        <div className="phase40Counter">
          <h4>{state.whatCanWait.length}</h4>
          <p>あとで見ること</p>
        </div>
        <div className="phase40Counter">
          <h4>{state.whatNeedsHuman.length}</h4>
          <p>今すぐ必要</p>
        </div>
        <div className="phase40Counter">
          <h4>{state.whatIsBlocked.length}</h4>
          <p>ブロック中</p>
        </div>
      </div>

      <div className="phase40OneThing">
        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4 }}>今日の1つのこと</div>
        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{state.todayOneThing}</div>
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 6 }}>{state.lazyRecommendation}</div>
      </div>

      <div className="phase40BtnRow">
        <button className="phase40Btn" onClick={() => setShowDetails((v) => !v)}>
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          詳細を見る
        </button>
        <button className="phase40Btn" onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
          まとめをコピー
        </button>
        <button className="phase40Btn" onClick={handleRefresh}>
          更新
        </button>
        <button className="phase40Btn" onClick={handleSnooze} style={{ marginLeft: 'auto' }}>
          今日は見ない
        </button>
      </div>

      {showDetails && (
        <div className="phase40Details">
          {state.whatHappenedQuietly.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: '0.85rem', color: '#555' }}>裏で整ったこと:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {state.whatHappenedQuietly.map((q, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#666' }}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          {state.whatCanWait.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: '0.85rem', color: '#555' }}>あとで見ること:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {state.whatCanWait.map((w, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#666' }}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          {state.whatNeedsHuman.length > 0 && (
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#d32f2f' }}>今すぐ必要:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {state.whatNeedsHuman.map((h, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#d32f2f' }}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
