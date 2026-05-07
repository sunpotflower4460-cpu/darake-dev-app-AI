import { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { loadAgentRunState, saveAgentRunState } from '../utils/agentRunState';
import { buildCloudAgentFollowupInstruction } from '../utils/cloudAgentFollowupInstruction';
import { createPrComment } from '../utils/githubAgentClient';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function AgentFixRequestPanel() {
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<'none' | 'success' | 'failed'>('none');

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadAgentRunState(), [revision]);

  const instruction = useMemo(() => {
    if (!state || state.status !== 'needs-agent-fix') return null;
    return buildCloudAgentFollowupInstruction({
      reason: 'ci-failed',
      issueUrl: state.issueUrl,
      prUrl: state.prUrl,
    });
  }, [state]);

  if (!state || state.status !== 'needs-agent-fix' || !instruction) return null;

  async function handleCopy() {
    if (!instruction) return;
    try {
      await navigator.clipboard.writeText(instruction);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  async function handlePostComment() {
    if (posting || !state || !state.prNumber || !instruction) return;
    setPosting(true);
    setPostResult('none');
    try {
      const res = await createPrComment({
        repoUrl: state.repoUrl,
        prNumber: state.prNumber,
        body: instruction,
      });
      if (res.ok) {
        saveAgentRunState({
          ...state,
          status: 'agent-working',
          nextActionLabel: '何もしなくてOK',
          userMessage: 'AIに修正依頼を送りました。',
        });
        setPostResult('success');
        setRevision((v) => v + 1);
      } else {
        setPostResult('failed');
      }
    } catch {
      setPostResult('failed');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="agentFixPanel">
      <div className="agentFixTitle">⚠️ 止まりました</div>
      <div className="agentFixReason">理由：CIまたはBuildが失敗しました</div>
      <div className="agentFixNextLabel">次にやること：</div>

      {postResult === 'success' ? (
        <div className="agentFixSuccessBox">
          <div className="agentFixSuccessTitle">AIに修正依頼を送りました</div>
          <div className="agentFixSuccessDetail">今やること：何もしなくてOK</div>
        </div>
      ) : postResult === 'failed' ? (
        <div className="agentFixFallbackBox">
          <div className="agentFixFallbackTitle">修正依頼を送れませんでした</div>
          <div className="agentFixFallbackDetail">次にやること：この文章をコピーしてPRに貼ってください</div>
          <div className="agentFixBtnRow">
            <button type="button" className="agentFixBtnPrimary" onClick={handleCopy}>
              {copied ? <><Check size={16} /> コピーしました</> : <><Copy size={16} /> 修正指示をコピー</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="agentFixBtnRow">
          {state.prNumber && (
            <button
              type="button"
              className="agentFixBtnPrimary"
              onClick={handlePostComment}
              disabled={posting}
            >
              {posting ? (
                <><span className="agentFixSpinner" /> 送信中...</>
              ) : (
                'AIに修正をお願いする'
              )}
            </button>
          )}
          <button type="button" className="agentFixBtnSecondary" onClick={handleCopy}>
            {copied ? <><Check size={16} /> コピーしました</> : <><Copy size={16} /> 修正指示をコピー</>}
          </button>
        </div>
      )}
    </div>
  );
}
