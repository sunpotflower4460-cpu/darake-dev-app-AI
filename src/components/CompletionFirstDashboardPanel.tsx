import { useState } from 'react';
import { Target, Copy, Check } from 'lucide-react';
import {
  buildCompletionGoalMap,
  rankCompletionGoals,
  formatCompletionGoalMapMarkdown,
} from '../utils/completionGoalMap';
import type { CompletionGoalStatus } from '../utils/completionGoalMap';

type CopyState = 'idle' | 'copied' | 'failed';

const STATUS_EMOJI: Record<CompletionGoalStatus, string> = {
  done: '✅',
  'auto-progressable': '⚙️',
  batched: '📦',
  'needs-human': '👤',
  blocked: '🚫',
  'not-started': '⬜',
};

const STATUS_LABEL: Record<CompletionGoalStatus, string> = {
  done: '完了',
  'auto-progressable': '自動で進められる',
  batched: 'まとめ済み',
  'needs-human': '人間が必要',
  blocked: 'ブロック',
  'not-started': '未着手',
};

export function CompletionFirstDashboardPanel() {
  const [goalMap, setGoalMap] = useState(() => buildCompletionGoalMap());
  const [showAll, setShowAll] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const rankedGoals = rankCompletionGoals(goalMap.goals);
  const displayGoals = showAll ? rankedGoals : rankedGoals.filter((g) => g.status !== 'done');

  function handleRefresh() {
    setGoalMap(buildCompletionGoalMap());
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatCompletionGoalMapMarkdown(goalMap));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase37Panel">
      <div className="phase37Hero">
        <Target />
        <div>
          <p className="eyebrow">Phase 37.2</p>
          <h3>Completion-first Dashboard</h3>
          <p>完成まであと何が必要かだけ見せます。</p>
        </div>
      </div>

      <div className="phase37CountGrid">
        <section>
          <h4>完了</h4>
          <p>{goalMap.doneCount}</p>
        </section>
        <section>
          <h4>自動で進められる</h4>
          <p>{goalMap.autoProgressCount}</p>
        </section>
        <section>
          <h4>人間が必要</h4>
          <p style={{ color: goalMap.needsHumanCount > 0 ? '#8a5e12' : undefined }}>
            {goalMap.needsHumanCount}
          </p>
        </section>
        <section>
          <h4>ブロック</h4>
          <p style={{ color: goalMap.blockedCount > 0 ? '#8b2020' : undefined }}>
            {goalMap.blockedCount}
          </p>
        </section>
      </div>

      {goalMap.blockedCount > 0 && (
        <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(220,40,40,0.07)', border: '2px solid rgba(220,40,40,0.28)', fontSize: '0.88rem', fontWeight: 700, color: '#7a0a0a' }}>
          🚫 ブロックを解消してください
        </div>
      )}

      <div className="phase37PathCard">
        <h4>最短だらけルート</h4>
        {displayGoals
          .filter((g) => g.status === 'needs-human' || g.status === 'blocked')
          .map((g, i) => (
            <div key={g.id} className="phase37PathStep">
              <span className="phase37PathStepNum">{i + 1}.</span>
              <span>{g.label}</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--muted)', marginLeft: 'auto' }}>
                {g.nextAction}
              </span>
            </div>
          ))}
        {goalMap.needsHumanCount === 0 && goalMap.blockedCount === 0 && (
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#0c5c2c' }}>
            😴 今は人間の作業なしで進められます
          </p>
        )}
      </div>

      <div className="phase37Section">
        <h4>ゴール一覧 {!showAll && `（完了以外）`}</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          {displayGoals.map((g) => (
            <div key={g.id} className="phase37GoalCard">
              <span className="phase37GoalLabel">
                {STATUS_EMOJI[g.status]} {g.label}
              </span>
              <span className={`phase37StatusBadge ${g.status}`}>
                {STATUS_LABEL[g.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="phase37BtnRow">
        <button className="phase37SmallBtn" onClick={handleRefresh}>
          🔄 更新
        </button>
        <button className="phase37SmallBtn" onClick={() => setShowAll(!showAll)}>
          {showAll ? '完了を隠す' : '完了も表示'}
        </button>
        <button className={`phase37CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} Markdownコピー
        </button>
      </div>
    </div>
  );
}
