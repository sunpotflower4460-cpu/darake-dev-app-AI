import { useEffect, useMemo, useState } from 'react';
import { computeDarakeNowState } from '../utils/darakeNowState';
import { loadAgentRunState } from '../utils/agentRunState';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import type { AgentRunStatus } from '../utils/agentRunState';

const AGENT_STATUS_STEPS: Partial<Record<AgentRunStatus, string[]>> = {
  'issue-created': ['✅ Issueを作成しました', '⬜ AIに作業をお願いする', '⬜ PR確認'],
  'assigned-to-agent': ['✅ Issueを作成しました', '✅ AIに作業をお願いしました', '⬜ PR確認'],
  'agent-working': ['✅ Issueを作成しました', '✅ AIが作業中です', '⬜ PR確認'],
  'pr-created': ['✅ Issueを作成しました', '✅ AIが作業しました', '⏳ PRを確認中'],
  'checks-running': ['✅ Issueを作成しました', '✅ PRができました', '⏳ CI確認中'],
  'needs-agent-fix': ['✅ Issueを作成しました', '✅ PRができました', '⚠️ CI失敗'],
  'ready-to-review': ['✅ Issueを作成しました', '✅ PRができました', '✅ CI通過'],
  'needs-human': ['✅ Issueを作成しました', '✅ PRができました', '⚠️ 確認が必要'],
};

function getAgentMessage(status: AgentRunStatus): { title: string; next: string } | null {
  switch (status) {
    case 'issue-created':
      return { title: 'Issueを作成しました', next: 'AIに作業をお願いする' };
    case 'assigned-to-agent':
    case 'agent-working':
      return { title: 'AIが作業中です', next: '何もしなくてOK' };
    case 'pr-created':
    case 'checks-running':
      return { title: 'PRができました', next: 'まだ何もしなくてOK' };
    case 'needs-agent-fix':
      return { title: '止まりました', next: 'AIに修正をお願いする' };
    case 'ready-to-review':
      return { title: '確認できました', next: 'PRを見てマージできます' };
    case 'needs-human':
      return { title: '確認が必要です', next: 'PRを確認する' };
    default:
      return null;
  }
}

export function DarakeNowCard() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => computeDarakeNowState(), [revision]);
  const agentState = useMemo(() => loadAgentRunState(), [revision]);

  const agentMsg = agentState ? getAgentMessage(agentState.status) : null;
  const agentSteps = agentState ? AGENT_STATUS_STEPS[agentState.status] : undefined;

  // If we have meaningful agent status, show the agent-focused view
  if (agentMsg && agentState && agentState.status !== 'idle' && agentState.status !== 'failed') {
    const isOkStatus =
      agentState.status === 'assigned-to-agent' ||
      agentState.status === 'agent-working' ||
      agentState.status === 'pr-created' ||
      agentState.status === 'checks-running';

    return (
      <div className="darakeNowPanel">
        <div className="darakeNowLabel">いまここ</div>
        <div className="darakeNowCard">
          {agentSteps && agentSteps.map((step, i) => (
            <div key={i} className="darakeNowStep">{step}</div>
          ))}
          <div className="darakeNowNextBox">
            <div className="darakeNowNextLabel">次にやること：</div>
            {isOkStatus ? (
              <div className="darakeNowAllDone">{agentMsg.next}</div>
            ) : (
              <div className="darakeNowNextDetail">{agentMsg.next}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="darakeNowPanel">
      <div className="darakeNowLabel">いまここ</div>
      <div className="darakeNowCard">
        {state.steps.map((step, i) => (
          <div
            key={i}
            className={`darakeNowStep ${
              step.done
                ? 'darakeNowStepDone'
                : step.inProgress
                  ? 'darakeNowStepInProgress'
                  : 'darakeNowStepPending'
            }`}
          >
            {step.done ? '✅' : step.inProgress ? '⏳' : '⬜'} {step.label}
          </div>
        ))}

        <div className="darakeNowNextBox">
          <div className="darakeNowNextLabel">次にやること：</div>
          {state.isAllDone ? (
            <div className="darakeNowAllDone">何もしなくてOK</div>
          ) : (
            <div className="darakeNowNextDetail">{state.nextActionLabel}</div>
          )}
        </div>
      </div>
    </div>
  );
}
