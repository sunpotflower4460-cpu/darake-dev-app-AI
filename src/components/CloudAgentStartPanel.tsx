import { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { loadGitHubIssueRecord } from '../utils/githubIssueRecord';
import { buildCloudAgentStartInstruction } from '../utils/cloudAgentStartInstruction';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function CloudAgentStartPanel() {
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const record = useMemo(() => loadGitHubIssueRecord(), [revision]);
  const instruction = useMemo(
    () => (record ? buildCloudAgentStartInstruction(record) : null),
    [record],
  );

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

  if (!record || !instruction) {
    return (
      <div className="casPanel">
        <div className="casTitle">Cloud Agentに作業を始めてもらう</div>
        <div className="casSub">
          まず「作ったIssueを記録する」でIssue URLを保存してください。
        </div>
        <div className="casDisabledNote">
          Issue URLを記録すると、Cloud Agentへ貼る指示が作られます。
        </div>
      </div>
    );
  }

  return (
    <div className="casPanel">
      <div className="casReadyBadge">✅ Cloud Agent指示 準備OK</div>
      <div className="casTitle">Cloud Agentに作業を始めてもらう</div>
      <div className="casSub">
        以下のボタンで指示をコピーして、Cloud Agentのチャットへ貼ってください。
      </div>
      <div className="casIssueRef">
        <span className="casIssueLabel">対象Issue：</span>
        <a
          className="casIssueLink"
          href={record.issueUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {record.fullName} #{record.issueNumber}
        </a>
      </div>
      <button
        type="button"
        className="casBtnPrimary"
        onClick={handleCopy}
      >
        {copied ? (
          <><Check size={16} /> コピー済み</>
        ) : (
          <><Copy size={16} /> Cloud Agentに貼る指示をコピー</>
        )}
      </button>
      <details className="casDetails">
        <summary className="casSummary">指示の内容を確認する</summary>
        <pre className="casInstructionPreview">{instruction}</pre>
      </details>
    </div>
  );
}
