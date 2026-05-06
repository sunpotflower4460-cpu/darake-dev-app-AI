import { useMemo, useState } from 'react';
import { Check, Copy, GitBranch } from 'lucide-react';
import { buildRejectionFixIssueDraft } from '../utils/rejectionFixIssueDraft';
import { loadAppReviewRejectionRecord } from '../utils/appReviewRejectionRecord';
import { classifyRejection, REJECTION_CATEGORY_LABELS } from '../utils/appReviewRejectionClassifier';

export function RejectionFixIssueDraftPanel() {
  const [copyStates, setCopyStates] = useState<Record<string, 'idle' | 'copied' | 'failed'>>({});

  const record = useMemo(() => loadAppReviewRejectionRecord(), []);
  const classification = useMemo(
    () => classifyRejection(record.appleMessage, record.guidelineNumber),
    [record],
  );
  const issueDraft = useMemo(
    () => buildRejectionFixIssueDraft(
      record.guidelineNumber,
      record.affectedFeature,
      classification,
      record.appleMessage,
    ),
    [record, classification],
  );

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates((prev) => ({ ...prev, [key]: 'copied' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [key]: 'idle' })), 1800);
    } catch {
      setCopyStates((prev) => ({ ...prev, [key]: 'failed' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [key]: 'idle' })), 2400);
    }
  }

  return (
    <div className="rejectionIssuePanel">
      <div className="rejectionIssueHero">
        <GitBranch />
        <div>
          <p className="eyebrow">Phase 14.4</p>
          <h3>修正Issue 下書き</h3>
          <p>リジェクト対応をGitHub Issueに落とし込みます。GitHub Issueの作成は人間が行います。</p>
        </div>
      </div>

      <div className="rejectionIssueSafetyBox">
        <strong>GitHub Issue作成は手動</strong>
        <p>Issue下書きのコピーのみです。GitHubへの自動作成はしません。</p>
      </div>

      <div className="rejectionIssueClassificationBox">
        <span>推定分類: {REJECTION_CATEGORY_LABELS[classification.category]}</span>
        <span className={`rejectionClassificationSev sev-${classification.severity}`}>{classification.severity}</span>
        {classification.manualGateRequired && (
          <span className="rejectionClassificationManualGateBadge">🔒 manual gate必須</span>
        )}
      </div>

      <div className="rejectionIssueSection">
        <div className="rejectionIssueSectionHeader">
          <span>Issue タイトル</span>
          <button
            type="button"
            className={`rejectionIssueCopyButton copy-${copyStates['title'] ?? 'idle'}`}
            onClick={() => copyText('title', issueDraft.title)}
          >
            {copyStates['title'] === 'copied' ? <Check size={12} /> : <Copy size={12} />}
            コピー
          </button>
        </div>
        <pre className="rejectionIssuePreview">{issueDraft.title}</pre>
      </div>

      <div className="rejectionIssueSection">
        <div className="rejectionIssueSectionHeader">
          <span>Issue 本文</span>
          <button
            type="button"
            className={`rejectionIssueCopyButton copy-${copyStates['body'] ?? 'idle'}`}
            onClick={() => copyText('body', issueDraft.body)}
          >
            {copyStates['body'] === 'copied' ? <Check size={12} /> : <Copy size={12} />}
            コピー
          </button>
        </div>
        <pre className="rejectionIssuePreview">{issueDraft.body}</pre>
      </div>

      <div className="rejectionIssueSection">
        <div className="rejectionIssueSectionHeader">
          <span>Cloud Agent 指示文</span>
          <button
            type="button"
            className={`rejectionIssueCopyButton copy-${copyStates['agent'] ?? 'idle'}`}
            onClick={() => copyText('agent', issueDraft.cloudAgentInstruction)}
          >
            {copyStates['agent'] === 'copied' ? <Check size={12} /> : <Copy size={12} />}
            コピー
          </button>
        </div>
        <pre className="rejectionIssuePreview">{issueDraft.cloudAgentInstruction}</pre>
      </div>

      <div className="rejectionIssueManualGateBox">
        <strong>🔒 手動ゲート</strong>
        <p>{issueDraft.manualGate}</p>
      </div>

      <div className="rejectionIssueDoneConditionsBox">
        <strong>完了条件</strong>
        <ul>
          {issueDraft.doneConditions.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
    </div>
  );
}
