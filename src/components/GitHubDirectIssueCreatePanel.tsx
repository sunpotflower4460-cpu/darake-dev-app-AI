import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { createGitHubIssue } from '../utils/githubIssueCreateClient';
import type { CreateGitHubIssueResult } from '../utils/githubIssueCreateClient';
import { loadGitHubIssueCreateState, saveGitHubIssueCreateState } from '../utils/githubIssueCreateState';
import { saveGitHubIssueRecord, loadGitHubIssueRecord } from '../utils/githubIssueRecord';
import { parseGitHubRepoUrl } from '../utils/githubRepoUrl';
import { buildPonStartPack } from '../utils/ponStartPack';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { DARAKE_SETUP_LINKS } from '../utils/darakeSetupLinks';
import { getGitHubWriteGatePolicy } from '../utils/writeGatePolicy';

export function GitHubDirectIssueCreatePanel() {
  const [revision, setRevision] = useState(0);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateGitHubIssueResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const pack = useMemo(() => buildPonStartPack(), [revision]);
  const record = useMemo(() => loadGitHubIssueRecord(), [revision]);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  // Load saved repo URL on mount
  useEffect(() => {
    const state = loadGitHubIssueCreateState();
    if (state?.repoUrl) {
      setRepoUrl(state.repoUrl);
    }
  }, []);

  const parsed = repoUrl ? parseGitHubRepoUrl(repoUrl) : null;
  const repoUrlError = repoUrl && parsed && !parsed.ok ? parsed.error : '';

  const issueTitle = useMemo(() => {
    const firstLine = pack.issueDraftMarkdown.split('\n').find((l) => l.trim().length > 0) ?? '';
    return firstLine.replace(/^#+\s*/, '').trim() || pack.appName;
  }, [pack.issueDraftMarkdown, pack.appName]);

  const issueBody = pack.issueDraftMarkdown;
  const issueBodyPreview = issueBody.length > 4000
    ? `${issueBody.slice(0, 4000)}\n\n...（以下省略）`
    : issueBody;
  const writeGatePolicy = getGitHubWriteGatePolicy('issue-create');

  function handleRepoUrlChange(value: string) {
    setRepoUrl(value);
    setResult(null);
    setConfirmed(false);
    if (value.trim()) {
      saveGitHubIssueCreateState({ repoUrl: value.trim() });
    }
  }

  async function handleCreate() {
    if (!parsed?.ok || !issueTitle || !issueBody) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await createGitHubIssue({
        repoUrl: repoUrl.trim(),
        title: issueTitle,
        body: issueBody,
        source: 'pon-start',
      });

      setResult(res);

      if (res.ok) {
        saveGitHubIssueRecord({
          issueUrl: res.issueUrl,
          owner: res.owner,
          repo: res.repo,
          issueNumber: res.issueNumber,
          fullName: res.fullName,
        });
      }
    } catch {
      setResult({ ok: false, error: 'ネットワークエラーが発生しました', code: 'UNKNOWN_ERROR' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyAgentInstruction() {
    try {
      await navigator.clipboard.writeText(pack.cloudAgentInstructionMarkdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const canCreate =
    !loading &&
    parsed?.ok === true &&
    issueTitle.length > 0 &&
    issueBody.length > 0 &&
    pack.status !== 'not-ready' &&
    confirmed;

  const isDisabledError =
    result && !result.ok && result.code === 'DISABLED';
  const isMissingTokenError =
    result && !result.ok && result.code === 'MISSING_TOKEN';

  return (
    <div className="gdicPanel">
      <span className="gdicPhaseTag">GitHub Issue直接作成</span>
      <div className="gdicTitle">GitHub Issueを作る</div>
      <div className="gdicSub">
        ボタンを押すと、GitHubにIssueを作ります。
        作成されたIssue URLは自動で記録されます。
      </div>

      <div className="gdicSafetyNote">
        Issueだけ作成します。PRやマージはしません。
      </div>

      {(isDisabledError || isMissingTokenError) && (
        <div className="gdicSetupNote">
          <div className="gdicSetupTitle">最初だけ設定が必要です</div>
          <div className="gdicSetupDetail">
            {isMissingTokenError
              ? <>GitHub Secretsに <span className="gdicSetupCode">WORKER_GITHUB_TOKEN</span> を登録して、Cloudflare Setupを実行してください。</>
              : <>Cloudflare Setupを実行して、<span className="gdicSetupCode">GITHUB_ISSUE_CREATE_ENABLED=true</span> をWorkerへ反映してください。</>
            }
          </div>
          <div className="darakeHumanOnePage__linkGrid" aria-label="Issue作成に必要な設定リンク">
            <a href={DARAKE_SETUP_LINKS.githubNewSecret} target="_blank" rel="noreferrer">GitHubの登録ページを開く</a>
            <a href={DARAKE_SETUP_LINKS.githubFineGrainedTokens} target="_blank" rel="noreferrer">GitHubの鍵ページを開く</a>
            <a href={DARAKE_SETUP_LINKS.cloudflareSetupWorkflow} target="_blank" rel="noreferrer">自動設定を実行する</a>
          </div>
        </div>
      )}

      {result && !result.ok && !isDisabledError && !isMissingTokenError && (
        <div className="gdicErrorBox">
          <div className="gdicErrorTitle">Issueを作れませんでした</div>
          <div className="gdicErrorDetail">
            {result.error}
            {result.code === 'REPO_NOT_ALLOWED' && (
              <> — WORKER_GITHUB_TOKENの権限か許可リポジトリを確認してください。</>
            )}
          </div>
        </div>
      )}

      {result?.ok && (
        <div className="gdicSuccessBox">
          <div className="gdicSuccessTitle">✅ Issueを作成しました</div>
          <div className="gdicSuccessUrl">
            <a href={result.issueUrl} target="_blank" rel="noopener noreferrer" aria-label={`作成されたGitHub Issueを新しいタブで開く: ${result.issueUrl}`}>
              {result.issueUrl}
            </a>
          </div>
          <div className="gdicSuccessNote">
            次はCloud Agentに貼る指示をコピーしてください。
          </div>
        </div>
      )}

      {!result?.ok && (
        <>
          <div className="gdicField">
            <label className="gdicLabel" htmlFor="gdic-repo-url">
              GitHubリポジトリURL
            </label>
            <input
              id="gdic-repo-url"
              className={`gdicInput${repoUrlError ? ' gdicInputError' : ''}`}
              type="url"
              placeholder="https://github.com/sunpotflower4460-cpu/sample-app"
              value={repoUrl}
              onChange={(e) => handleRepoUrlChange(e.target.value)}
              autoComplete="url"
            />
            {repoUrlError && (
              <div className="gdicFieldError">{repoUrlError}</div>
            )}
            {repoUrl && parsed?.ok && (
              <div className="gdicFieldOk">✅ {parsed.fullName}</div>
            )}
            {!repoUrl && (
              <div className="gdicFieldError">リポジトリURLを入れてください</div>
            )}
          </div>

          <div className="gdicPreviewBox">
            <div className="gdicPreviewTitle">作成前プレビュー</div>
            <div className="gdicPreviewItem">
              <span className="gdicPreviewLabel">リスク:</span> {writeGatePolicy.risk}
            </div>
            <div className="gdicPreviewItem">
              <span className="gdicPreviewLabel">タイトル:</span> {issueTitle || '(未入力)'}
            </div>
            <div className="gdicPreviewBody">{issueBodyPreview || '(本文なし)'}</div>
            <label className="gdicConfirmRow" htmlFor="gdic-confirm-create">
              <input
                id="gdic-confirm-create"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>プレビュー内容を確認し、Issue作成を実行します</span>
            </label>
          </div>
        </>
      )}

      <div className="gdicBtnRow">
        {result?.ok ? (
          <>
            <button
              type="button"
              className="gdicBtnPrimaryGreen"
              onClick={handleCopyAgentInstruction}
            >
              {copied ? <><Check size={16} /> コピー済み</> : <><Copy size={16} /> Cloud Agentに貼る指示をコピー</>}
            </button>
            <a
              href={result.issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gdicBtnSecondary"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={14} /> Issueを開く
            </a>
            <button
              type="button"
              className="gdicBtnSecondary"
              onClick={() => { setResult(null); }}
            >
              別のIssueを作る
            </button>
          </>
        ) : (
          <button
            type="button"
            className="gdicBtnPrimary"
            onClick={handleCreate}
            disabled={!canCreate}
          >
            {loading ? (
              <><span className="gdicSpinner" /> 作成中...</>
            ) : (
              'Issueを作成する'
            )}
          </button>
        )}
      </div>

      {record && !result?.ok && (
        <div style={{ marginTop: 14, fontSize: '0.78rem', color: '#aaa', textAlign: 'center' }}>
          記録済み: <a href={record.issueUrl} target="_blank" rel="noopener noreferrer" aria-label={`記録済みIssueを開く: ${record.fullName} #${record.issueNumber}`} style={{ color: '#1565c0' }}>{record.fullName} #{record.issueNumber}</a>
        </div>
      )}
    </div>
  );
}
