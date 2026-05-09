import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { loadDarakeAutopilotState } from '../utils/darakeAutopilotState';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { loadAutoMergeSettings } from '../utils/autoMergeSettings';

export function MergeSafetyCard() {
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadDarakeAutopilotState(), [revision]);
  const settings = useMemo(() => loadAutoMergeSettings(), [revision]);

  if (!state || state.status !== 'merge-candidate') return null;

  const isAutoMergeMode = settings.mode === 'low-risk-only';

  const cardClass = isAutoMergeMode
    ? 'mergeSafetyCard mergeSafetyCard--allowed'
    : 'mergeSafetyCard mergeSafetyCard--candidate';

  const title = 'マージ候補です';
  const message = 'PRは問題なさそうです。';

  return (
    <div className={cardClass}>
      <div className="mergeSafetyCard__title">{title}</div>
      <div className="mergeSafetyCard__message">{message}</div>

      <div className="mergeSafetyCard__next">
        次にやること：PRを開いて確認してください。
      </div>

      {state.prUrl && (
        <a
          href={state.prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mergeSafetyCard__btn"
        >
          <ExternalLink size={15} /> PRを開く
        </a>
      )}
    </div>
  );
}
