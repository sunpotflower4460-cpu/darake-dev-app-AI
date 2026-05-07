import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { loadAgentRunState } from '../utils/agentRunState';
import { watchAgentPr } from '../utils/githubPrWatcher';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import type { AgentRunStatus } from '../utils/agentRunState';

function isActiveWatchingStatus(status: AgentRunStatus): boolean {
  return (
    status === 'agent-working' ||
    status === 'assigned-to-agent' ||
    status === 'pr-created' ||
    status === 'checks-running'
  );
}

export function AgentRunWatchPanel() {
  const [revision, setRevision] = useState(0);
  const [watching, setWatching] = useState(false);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadAgentRunState(), [revision]);

  // Only show when agent is working or PR exists
  const showPanel =
    state &&
    state.status !== 'idle' &&
    state.status !== 'issue-created' &&
    state.status !== 'failed' &&
    state.status !== 'done';

  async function handleCheck() {
    if (watching) return;
    setWatching(true);
    try {
      await watchAgentPr();
      setRevision((v) => v + 1);
    } finally {
      setWatching(false);
    }
  }

  if (!showPanel || !state) return null;

  return (
    <div className="agentWatchPanel">
      <div className="agentWatchStatus">
        {state.status === 'agent-working' || state.status === 'assigned-to-agent' ? (
          <>
            <div className="agentWatchTitle">AIが作業中です</div>
            <div className="agentWatchDetail">PRができるのを待っています。</div>
            <div className="agentWatchNextLabel">今やること：<span className="agentWatchNextAction">何もしなくてOK</span></div>
          </>
        ) : state.status === 'pr-created' || state.status === 'checks-running' ? (
          <>
            <div className="agentWatchTitle">PRができました</div>
            <div className="agentWatchDetail">状態：確認中です</div>
            <div className="agentWatchNextLabel">今やること：<span className="agentWatchNextAction">まだ何もしなくてOK</span></div>
            {state.prUrl && (
              <a href={state.prUrl} target="_blank" rel="noopener noreferrer" className="agentWatchPrLink">
                <ExternalLink size={13} /> PRを見る
              </a>
            )}
          </>
        ) : state.status === 'needs-agent-fix' ? (
          <>
            <div className="agentWatchTitle agentWatchTitleWarn">止まりました</div>
            <div className="agentWatchDetail">理由：CIまたはBuildが失敗しました</div>
            <div className="agentWatchNextLabel">次にやること：</div>
          </>
        ) : state.status === 'ready-to-review' ? (
          <>
            <div className="agentWatchTitle">確認できました</div>
            <div className="agentWatchDetail">次にやること：PRを見てマージできます</div>
            {state.prUrl && (
              <a href={state.prUrl} target="_blank" rel="noopener noreferrer" className="agentWatchBtnSecondary">
                <ExternalLink size={14} /> PRを開く
              </a>
            )}
          </>
        ) : state.status === 'needs-human' ? (
          <>
            <div className="agentWatchTitle agentWatchTitleWarn">確認が必要です</div>
            <div className="agentWatchDetail">{state.userMessage}</div>
            {state.prUrl && (
              <a href={state.prUrl} target="_blank" rel="noopener noreferrer" className="agentWatchBtnSecondary">
                <ExternalLink size={14} /> PRを開く
              </a>
            )}
          </>
        ) : null}
      </div>

      {state.lastCheckAt && (
        <div className="agentWatchLastCheck">
          最終確認：{new Date(state.lastCheckAt).toLocaleTimeString('ja-JP')}
        </div>
      )}

      {isActiveWatchingStatus(state.status) && (
        <button
          type="button"
          className="agentWatchRefreshBtn"
          onClick={handleCheck}
          disabled={watching}
        >
          {watching ? '確認中...' : 'いまの状態を確認する'}
        </button>
      )}
    </div>
  );
}
