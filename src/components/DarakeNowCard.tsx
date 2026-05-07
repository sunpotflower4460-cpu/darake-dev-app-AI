import { useEffect, useMemo, useState } from 'react';
import { computeDarakeNowState } from '../utils/darakeNowState';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function DarakeNowCard() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => computeDarakeNowState(), [revision]);

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
