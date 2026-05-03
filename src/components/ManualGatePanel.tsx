import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Hand } from 'lucide-react';
import type { IssueDraft } from '../data/issueDraft';
import { manualGateSteps, manualGateWarnings } from '../data/manualGate';
import { buildGitHubIssueUrl } from '../utils/githubIssueUrl';
import { loadDraft, subscribeDraftChanges } from '../utils/draftStore';
import { formatIssueDraft } from '../utils/formatIssueDraft';

export function ManualGatePanel() {
  const [draft, setDraft] = useState<IssueDraft>(() => loadDraft());

  useEffect(() => {
    return subscribeDraftChanges(() => setDraft(loadDraft()));
  }, []);

  const issueUrl = useMemo(() => buildGitHubIssueUrl(draft.title, formatIssueDraft(draft)), [draft]);

  return (
    <div className="manualGatePanel">
      <div className="manualGateHero">
        <Hand />
        <div>
          <p className="eyebrow">Manual Gate</p>
          <h3>ここから先は手動です</h3>
          <p>自動で進める前に、内容を一度だけ見ます。大事な境界線をここに置きます。</p>
        </div>
      </div>

      <div className="manualWarningList">
        {manualGateWarnings.map((item) => <span key={item}>{item}</span>)}
      </div>

      <div className="manualStepGrid">
        {manualGateSteps.map((step, index) => (
          <article className="manualStepCard" key={step.id}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </div>
          </article>
        ))}
      </div>

      <a className="manualGateButton manualGateLink" href={issueUrl} target="_blank" rel="noreferrer">
        <ExternalLink size={16} /> GitHubでIssue作成画面を開く
      </a>
      <p className="manualGateSmall">GitHub画面で最後に確認してから作成します。</p>
    </div>
  );
}
