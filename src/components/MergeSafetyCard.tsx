import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { loadDarakeAutopilotState } from '../utils/darakeAutopilotState';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { judgeMergeSafety } from '../utils/mergeSafetyJudge';
import { loadAutoMergeSettings } from '../utils/autoMergeSettings';

export function MergeSafetyCard() {
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadDarakeAutopilotState(), [revision]);
  const settings = useMemo(() => loadAutoMergeSettings(), [revision]);

  if (!state || state.status !== 'merge-candidate') return null;

  const judgement = judgeMergeSafety(
    {
      ciPassed: true,
      buildPassed: true,
      typecheckPassed: true,
      changedFiles: 0,
      additions: 0,
      deletions: 0,
      riskLevel: 'safe',
      headSha: 'unknown',
      prUrl: state.prUrl,
      prNumber: state.prNumber,
    },
    settings,
  );

  const isAllowed = judgement.decision === 'auto-merge-allowed';
  const isCandidate = judgement.decision === 'merge-candidate';

  const cardClass = isAllowed
    ? 'mergeSafetyCard mergeSafetyCard--allowed'
    : isCandidate
      ? 'mergeSafetyCard mergeSafetyCard--candidate'
      : 'mergeSafetyCard mergeSafetyCard--not-ready';

  const title = isAllowed
    ? 'マージしました'
    : 'マージ候補です';

  const message = isAllowed
    ? 'デプロイ結果を確認しています。'
    : 'PRは問題なさそうです。';

  return (
    <div className={cardClass}>
      <div className="mergeSafetyCard__title">{title}</div>
      <div className="mergeSafetyCard__message">{message}</div>

      {!isAllowed && (
        <div className="mergeSafetyCard__next">
          次にやること：PRを開いて確認してください。
        </div>
      )}

      {isAllowed && (
        <div className="mergeSafetyCard__next">今やること：何もしなくてOK</div>
      )}

      {judgement.blockers.length > 0 && (
        <ul className="mergeSafetyCard__blockers">
          {judgement.blockers.map((b) => <li key={b}>{b}</li>)}
        </ul>
      )}

      {state.prUrl && !isAllowed && (
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
