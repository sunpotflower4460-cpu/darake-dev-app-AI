import { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { loadAgentRunState, saveAgentRunState } from '../utils/agentRunState';
import { assignAgentToIssue } from '../utils/githubAgentClient';
import { buildCloudAgentStartInstruction } from '../utils/cloudAgentStartInstruction';
import { loadGitHubIssueRecord } from '../utils/githubIssueRecord';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

function CopyInstructionButton({ instruction }: { instruction: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(instruction);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <button type="button" className="agentStartBtnPrimary" onClick={handleCopy}>
      {copied ? (
        <><Check size={16} /> コピーしました</>
      ) : (
        <><Copy size={16} /> Cloud Agentに貼る指示をコピー</>
      )}
    </button>
  );
}

export function AgentStartPanel() {
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fallbackInstruction, setFallbackInstruction] = useState<string | null>(null);
  const [assignResult, setAssignResult] = useState<'none' | 'success' | 'failed'>('none');
  const [assignError, setAssignError] = useState('');

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadAgentRunState(), [revision]);

  const canStart = state?.status === 'issue-created' || state?.status === 'assigned-to-agent';

  async function handleAssign() {
    if (loading || !state) return;
    setLoading(true);
    setAssignResult('none');
    setAssignError('');
    try {
      const res = await assignAgentToIssue({
        repoUrl: state.repoUrl,
        issueNumber: state.issueNumber ?? 0,
        agent: 'copilot',
      });

      if (res.ok) {
        saveAgentRunState({
          ...state,
          status: 'assigned-to-agent',
          nextActionLabel: '何もしなくてOK',
          userMessage: 'AIに作業を割り当てました。作業が始まります。',
        });
        setAssignResult('success');
        setRevision((v) => v + 1);
      } else {
        // Fallback to cloud agent copy
        const issueRecord = loadGitHubIssueRecord();
        if (issueRecord) {
          setFallbackInstruction(buildCloudAgentStartInstruction(issueRecord));
        }
        setAssignResult('failed');
        setAssignError(
          res.code === 'DISABLED'
            ? 'AIへの自動割り当てはまだ有効化されていません。'
            : res.error,
        );
      }
    } catch {
      const issueRecord = loadGitHubIssueRecord();
      if (issueRecord) {
        setFallbackInstruction(buildCloudAgentStartInstruction(issueRecord));
      }
      setAssignResult('failed');
      setAssignError('接続に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  if (!state || state.status === 'idle') return null;

  // Success: agent assigned
  if (state.status === 'assigned-to-agent' || state.status === 'agent-working') {
    return (
      <div className="agentStartPanel">
        <div className="agentStartSuccessBox">
          <div className="agentStartSuccessTitle">AIが作業中です</div>
          <div className="agentStartSuccessDetail">今やること：何もしなくてOK</div>
        </div>
      </div>
    );
  }

  // Fallback: copy instruction
  if (assignResult === 'failed') {
    return (
      <div className="agentStartPanel">
        <div className="agentStartFallbackBox">
          <div className="agentStartFallbackTitle">Issueは作れました</div>
          <div className="agentStartFallbackDetail">
            AIへの自動割り当てだけ失敗しました。
            {assignError && <div className="agentStartFallbackReason">{assignError}</div>}
          </div>
          <div className="agentStartNextLabel">次にやること：</div>
          <div className="agentStartNextAction">Cloud Agentに貼る指示をコピーしてください。</div>
        </div>
        {fallbackInstruction && (
          <div className="agentStartBtnRow">
            <CopyInstructionButton instruction={fallbackInstruction} />
          </div>
        )}
      </div>
    );
  }

  if (!canStart) return null;

  return (
    <div className="agentStartPanel">
      <div className="agentStartTitle">AIに作業をお願いする</div>
      <div className="agentStartDesc">作成したIssueをもとに、AIに作業を始めてもらいます。</div>
      {state.issueUrl && (
        <div className="agentStartIssueRow">
          <span className="agentStartIssueLabel">Issue：</span>
          <a
            href={state.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="agentStartIssueLink"
          >
            {state.issueUrl}
          </a>
        </div>
      )}
      <div className="agentStartBtnRow">
        <button
          type="button"
          className="agentStartBtnPrimary"
          onClick={handleAssign}
          disabled={loading}
        >
          {loading ? (
            <><span className="agentStartSpinner" /> 割り当て中...</>
          ) : (
            'AIに作業をお願いする'
          )}
        </button>
      </div>
    </div>
  );
}
