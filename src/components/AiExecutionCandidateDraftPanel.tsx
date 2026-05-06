import { useState } from 'react';
import { Check, Copy, GitBranch } from 'lucide-react';
import {
  AI_EXECUTION_CANDIDATE_DRAFTS,
  formatAiExecutionCandidateDraftsMarkdown,
} from '../utils/aiExecutionCandidateDraft';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiExecutionCandidateDraftPanel() {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAiExecutionCandidateDraftsMarkdown(AI_EXECUTION_CANDIDATE_DRAFTS));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <GitBranch />
        <div>
          <p className="eyebrow">Phase 25.6</p>
          <h3>AI Execution Candidate Draft</h3>
          <p>将来API実行するなら何が必要かを draft-only で整理します。</p>
        </div>
      </div>

      <div className="phaseBlockersBox">
        <strong>絶対表示する注意</strong>
        <ul>
          <li>API keyはこのアプリに入力しない</li>
          <li>secretは外部secret manager / GitHub Secrets等で人間が管理する</li>
          <li>このPhaseではAPI実行しない</li>
          <li>private情報の送信は人間確認必須</li>
        </ul>
      </div>

      <div className="phase25Grid">
        {AI_EXECUTION_CANDIDATE_DRAFTS.map((draft) => (
          <section key={draft.title} className="phase25Card">
            <div className="phase25CardHeader">
              <div>
                <h4>{draft.title}</h4>
                <p className="phase25Muted">{draft.provider} / {draft.taskType}</p>
              </div>
              <span className={`phase25Badge phase25Badge-${draft.status}`}>{draft.status}</span>
            </div>
            <div className="phase25TwoColumn phase25AlignStart">
              <div>
                <strong>requiredSecrets</strong>
                <ul className="phase25List">{draft.requiredSecrets.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <strong>external setup</strong>
                <ul className="phase25List">{draft.requiredExternalSetup.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
            <p className="phase25Note"><strong>input</strong>: {draft.inputPayloadShape}</p>
            <p className="phase25Note"><strong>output</strong>: {draft.outputExpectedShape}</p>
            <div className="phase25TwoColumn phase25AlignStart">
              <div>
                <strong>manual gates</strong>
                <ul className="phase25List">{draft.manualGates.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <strong>blocked conditions</strong>
                <ul className="phase25List">{draft.blockedConditions.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
            <div>
              <strong>safety notes</strong>
              <ul className="phase25List">{draft.safetyNotes.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </section>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
