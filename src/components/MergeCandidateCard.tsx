import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { loadAutoFixLoopState } from '../utils/autoFixLoopState';
import { buildMergeReadinessSummaryFromPrHealth } from '../utils/mergeReadiness';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function MergeCandidateCard() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadAutoFixLoopState(), [revision]);

  if (!state || state.status !== 'merge-candidate') return null;

  const summary = buildMergeReadinessSummaryFromPrHealth(state.prUrl);

  return (
    <div className="mergeCandidateCard">
      <div className="mergeCandidateInner">
        <div className="mergeCandidateTitle">{summary.title}</div>
        <div className="mergeCandidateMessage">{summary.userMessage}</div>

        {summary.reasons.length > 0 && (
          <ul className="mergeCandidateReasonList">
            {summary.reasons.map((r) => (
              <li key={r} className="mergeCandidateReasonItem">{r}</li>
            ))}
          </ul>
        )}

        {summary.risks.length > 0 && (
          <ul className="mergeCandidateRiskList">
            {summary.risks.map((r) => (
              <li key={r} className="mergeCandidateRiskItem">{r}</li>
            ))}
          </ul>
        )}

        <div className="mergeCandidateNextLabel">
          次にやること：PRを開いてマージできます
        </div>

        {state.prUrl && (
          <a
            href={state.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mergeCandidateOpenBtn"
          >
            <ExternalLink size={16} /> PRを開く
          </a>
        )}
      </div>
    </div>
  );
}
