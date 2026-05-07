import { useEffect, useMemo, useState } from 'react';
import { loadDarakeAutopilotState } from '../utils/darakeAutopilotState';
import type { DarakeAutopilotStatus } from '../utils/darakeAutopilotState';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

const NOTHING_TO_DO_STATUSES = new Set<DarakeAutopilotStatus>([
  'agent-working',
  'watching-pr',
  'waiting-for-checks',
  'auto-fixing',
]);

const HIDE_STATUSES = new Set<DarakeAutopilotStatus>([
  'needs-human',
  'blocked',
  'merge-candidate',
  'failed',
  'off',
  'idle',
  'starting',
  'issue-creating',
]);

export function NothingToDoCard() {
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadDarakeAutopilotState(), [revision]);

  if (!state) return null;
  if (HIDE_STATUSES.has(state.status)) return null;
  if (!NOTHING_TO_DO_STATUSES.has(state.status)) return null;

  const isAutoFixing = state.status === 'auto-fixing';

  return (
    <div className="nothingToDoCard">
      <div className="nothingToDoInner">
        {state.appName && (
          <div className="nothingToDoAppName">{state.appName}</div>
        )}
        <div className="nothingToDoHeadline">
          {isAutoFixing ? 'AIに修正をお願いしました' : '何もしなくてOK'}
        </div>
        <div className="nothingToDoSub">
          {isAutoFixing
            ? '次の確認まで待っています。'
            : 'AIが作業中です。'}
        </div>
        <div className="nothingToDoNote">止まった時だけ知らせます。</div>
      </div>
    </div>
  );
}
