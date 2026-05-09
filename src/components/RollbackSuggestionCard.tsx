import { useState } from 'react';
import { buildRollbackInstruction } from '../utils/buildRollbackInstruction';
import { loadPostMergeWatchState } from '../utils/postMergeWatch';

export function RollbackSuggestionCard() {
  const [show, setShow] = useState(false);

  const state = loadPostMergeWatchState();
  const isFailed =
    state?.status === 'deploy-failed' ||
    state?.status === 'preview-broken' ||
    state?.status === 'needs-human';

  if (!isFailed) return null;

  const instruction = buildRollbackInstruction({
    prUrl: state?.prUrl,
    prNumber: state?.prNumber,
    repoUrl: state?.repoUrl,
    deployUrl: state?.deployUrl,
    failureReason: state?.userMessage,
  });

  return (
    <div className="rollbackSuggestionCard">
      <div className="rollbackSuggestionCard__title">ロールバック手順</div>
      <button
        type="button"
        className="rollbackSuggestionCard__toggle"
        onClick={() => setShow((v) => !v)}
      >
        {show ? '手順を閉じる' : '手順を見る'}
      </button>

      {show && (
        <div className="rollbackSuggestionCard__body">
          <ol className="rollbackSuggestionCard__steps">
            {instruction.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <div className="rollbackSuggestionCard__warning">{instruction.warningNote}</div>
        </div>
      )}
    </div>
  );
}
