import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { runOmakaseStart } from '../utils/runOmakaseStart';
import { loadOmakaseStartState, clearOmakaseStartState } from '../utils/omakaseStartState';
import { loadGitHubIssueCreateState, saveGitHubIssueCreateState } from '../utils/githubIssueCreateState';
import { parseGitHubRepoUrl } from '../utils/githubRepoUrl';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { loadDarakeLevelSettings, getDarakeLevelVisibility } from '../utils/darakeLevelSettings';

function CopyAgentInstructionButton({ instruction }: { instruction: string }) {
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
    <button type="button" className="omkBtnPrimaryGreen" onClick={handleCopy}>
      {copied ? <><Check size={16} /> コピー済み</> : <><Copy size={16} /> Cloud Agentに貼る指示をコピー</>}
    </button>
  );
}

export function OmakaseStartPanel() {
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  // Load saved repo URL on mount and on revision change
  useEffect(() => {
    const state = loadGitHubIssueCreateState();
    if (state?.repoUrl) {
      setRepoUrl(state.repoUrl);
    }
  }, [revision]);

  const omakase = useMemo(() => loadOmakaseStartState(), [revision]);
  const { level } = useMemo(() => loadDarakeLevelSettings(), [revision]);
  const visibility = useMemo(() => getDarakeLevelVisibility(level), [level]);

  const parsed = repoUrl ? parseGitHubRepoUrl(repoUrl) : null;
  const repoUrlError = repoUrl && parsed && !parsed.ok ? parsed.error : '';

  function handleRepoUrlChange(value: string) {
    setRepoUrl(value);
    if (value.trim()) {
      saveGitHubIssueCreateState({ repoUrl: value.trim() });
    }
  }

  async function handleStart() {
    if (loading) return;
    setLoading(true);
    try {
      await runOmakaseStart();
      setRevision((v) => v + 1);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    clearOmakaseStartState();
    setRevision((v) => v + 1);
  }

  const status = omakase?.status ?? 'idle';
  const isPreparing = status === 'preparing' || loading;
  const isReady = status === 'cloud-agent-ready' || status === 'issue-created';
  const isFailed = status === 'failed' || status === 'blocked';

  const canStart =
    !loading &&
    !!parsed?.ok &&
    status !== 'preparing';

  // In wake-me-only-if-needed + success, collapse to minimal
  const collapseToMinimal = visibility.collapseOnSuccess && isReady;

  if (collapseToMinimal) {
    return (
      <div className="omkPanel">
        <div className="omkSuccessBox">
          <div className="omkSuccessTitle">何もしなくてOK</div>
          <div className="omkSuccessDetail">
            準備が完了しました。Cloud Agentに貼る指示をコピーするだけです。
          </div>
          {omakase?.issueUrl && (
            <>
              <span className="omkIssueLabel">作成したIssue：</span>
              <a
                className="omkIssueLink"
                href={omakase.issueUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {omakase.issueUrl}
              </a>
            </>
          )}
        </div>
        <div className="omkBtnRow">
          {omakase?.cloudAgentInstruction && (
            <CopyAgentInstructionButton instruction={omakase.cloudAgentInstruction} />
          )}
          {omakase?.issueUrl && (
            <a
              href={omakase.issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="omkBtnSecondary"
            >
              <ExternalLink size={14} /> Issueを開く
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="omkPanel">
      <div className="omkTitle">おまかせ開始</div>
      <div className="omkSub">
        Issue作成・記録・Cloud Agent指示作成までまとめて準備します。
      </div>

      {isPreparing && (
        <div className="omkPreparingBox">
          <div className="omkPreparingTitle">準備中です</div>
          <div className="omkPreparingDetail">
            Issueを作成して、Cloud Agentに渡す文章を整えています。
          </div>
        </div>
      )}

      {isReady && (
        <div className="omkSuccessBox">
          <div className="omkSuccessTitle">準備できました</div>
          <div className="omkSuccessDetail">
            次はこれをCloud Agentに貼るだけです。
          </div>
          {omakase?.issueUrl && (
            <>
              <span className="omkIssueLabel">作成したIssue：</span>
              <a
                className="omkIssueLink"
                href={omakase.issueUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {omakase.issueUrl}
              </a>
            </>
          )}
        </div>
      )}

      {isFailed && omakase?.error && (
        <div className="omkErrorBox">
          <div className="omkErrorTitle">止まりました</div>
          <div className="omkErrorDetail">{omakase.userMessage}</div>
          <div className="omkNextActionLabel">次にやること：{omakase.nextActionLabel}</div>
        </div>
      )}

      {!isReady && !isPreparing && (
        <div className="omkSafetyNote">
          Issueだけ作成します。PRやマージはしません。
        </div>
      )}

      {!isReady && !isPreparing && (
        <div style={{ marginBottom: 14 }}>
          <label
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: 6 }}
            htmlFor="omk-repo-url"
          >
            GitHubリポジトリURL
          </label>
          <input
            id="omk-repo-url"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: `1.5px solid ${repoUrlError ? '#e53935' : '#ddd'}`,
              fontSize: '0.9rem',
              color: '#222',
              background: '#fafafa',
              boxSizing: 'border-box',
              outline: 'none',
              WebkitAppearance: 'none',
            }}
            type="url"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => handleRepoUrlChange(e.target.value)}
            autoComplete="url"
          />
          {repoUrlError && (
            <div style={{ marginTop: 5, fontSize: '0.8rem', color: '#e53935' }}>{repoUrlError}</div>
          )}
          {repoUrl && parsed?.ok && (
            <div style={{ marginTop: 5, fontSize: '0.8rem', color: '#2e7d32' }}>✅ {parsed.fullName}</div>
          )}
        </div>
      )}

      <div className="omkBtnRow">
        {isReady ? (
          <>
            {omakase?.cloudAgentInstruction && (
              <CopyAgentInstructionButton instruction={omakase.cloudAgentInstruction} />
            )}
            {omakase?.issueUrl && (
              <a
                href={omakase.issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="omkBtnSecondary"
              >
                <ExternalLink size={14} /> Issueを開く
              </a>
            )}
            <button
              type="button"
              className="omkBtnSecondary"
              onClick={handleReset}
            >
              別のIssueを作る
            </button>
          </>
        ) : (
          <button
            type="button"
            className="omkBtnPrimary"
            onClick={handleStart}
            disabled={!canStart}
          >
            {isPreparing ? (
              <><span className="omkSpinner" /> 準備中...</>
            ) : (
              'この内容で作り始める'
            )}
          </button>
        )}
      </div>

      {visibility.showCloudAgentInstruction && isReady && omakase?.cloudAgentInstruction && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ fontSize: '0.82rem', color: '#888', cursor: 'pointer' }}>指示の内容を確認する</summary>
          <pre style={{ fontSize: '0.75rem', color: '#555', whiteSpace: 'pre-wrap', marginTop: 8, background: '#f8f9fa', borderRadius: 8, padding: 10 }}>
            {omakase.cloudAgentInstruction}
          </pre>
        </details>
      )}
    </div>
  );
}
