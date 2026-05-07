import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import {
  loadGitHubStartSettings,
  saveGitHubStartSettings,
  buildEmptyGitHubStartSettings,
} from '../utils/githubStartSettings';
import type { GitHubStartMode } from '../utils/githubStartSettings';
import { parseGitHubRepoUrl } from '../utils/githubRepoUrl';
import { buildGitHubIssueCreateUrl } from '../utils/githubIssueCreateUrl';
import { buildPonStartPack } from '../utils/ponStartPack';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

const MODE_LABELS: Record<GitHubStartMode, string> = {
  'copy-only': 'コピーだけ',
  'open-issue-page': 'Issue作成ページを開く',
  'cloud-agent': 'Cloud Agentに貼る',
  both: '両方',
};

export function GitHubStartPanel() {
  const [revision, setRevision] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [modeInput, setModeInput] = useState<GitHubStartMode>('open-issue-page');
  const [copied, setCopied] = useState<'issue' | 'agent' | null>(null);

  const settings = useMemo(() => loadGitHubStartSettings(), [revision]);
  const pack = useMemo(() => buildPonStartPack(), [revision]);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  // Sync inputs when settings load or settings panel opens
  useEffect(() => {
    if (showSettings) {
      setUrlInput(settings?.repoUrl ?? '');
      setModeInput(settings?.mode ?? 'open-issue-page');
    }
  }, [showSettings, settings]);

  const parsed = settings?.repoUrl ? parseGitHubRepoUrl(settings.repoUrl) : null;
  const hasValidRepo = parsed?.ok === true;

  const issueCreateResult = useMemo(() => {
    if (!hasValidRepo || !settings?.repoUrl) return null;
    const firstLine = pack.issueDraftMarkdown.split('\n').find((l) => l.trim().length > 0) ?? '';
    const title = firstLine.replace(/^#+\s*/, '').trim() || pack.appName;
    return buildGitHubIssueCreateUrl({
      repoUrl: settings.repoUrl,
      title,
      body: pack.issueDraftMarkdown,
    });
  }, [hasValidRepo, settings?.repoUrl, pack.issueDraftMarkdown, pack.appName]);

  const urlInputParsed = urlInput ? parseGitHubRepoUrl(urlInput) : null;
  const urlInputError = urlInput && urlInputParsed && !urlInputParsed.ok ? urlInputParsed.error : '';

  function handleSave() {
    const s = settings ?? buildEmptyGitHubStartSettings();
    saveGitHubStartSettings({ ...s, repoUrl: urlInput.trim(), mode: modeInput });
    setShowSettings(false);
  }

  function handleOpenIssuePage() {
    if (!issueCreateResult?.ok) return;
    window.open(issueCreateResult.url, '_blank', 'noopener,noreferrer');
  }

  async function copyText(kind: 'issue' | 'agent', text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  }

  if (showSettings) {
    return (
      <div className="ghsPanel">
        <div className="ghsTitle">GitHubで作り始める準備</div>
        <div className="ghsSub">
          リポジトリURLを入れると、Issue作成ページを開けます。投稿はまだ自分で押します。
        </div>

        <div className="ghsField">
          <label className="ghsLabel" htmlFor="ghs-repo-url">
            GitHubリポジトリURL
          </label>
          <input
            id="ghs-repo-url"
            className={`ghsInput${urlInputError ? ' ghsInputError' : ''}`}
            type="url"
            placeholder="https://github.com/your-name/my-app"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            autoComplete="url"
          />
          {urlInputError && <div className="ghsFieldError">{urlInputError}</div>}
          {urlInput && urlInputParsed?.ok && (
            <div className="ghsFieldOk">✅ {urlInputParsed.fullName}</div>
          )}
        </div>

        <div className="ghsField">
          <label className="ghsLabel" htmlFor="ghs-mode">
            作業開始モード
          </label>
          <select
            id="ghs-mode"
            className="ghsSelect"
            value={modeInput}
            onChange={(e) => setModeInput(e.target.value as GitHubStartMode)}
          >
            {(Object.entries(MODE_LABELS) as [GitHubStartMode, string][]).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="ghsSafetyNote">
          まだGitHubには投稿しません。
          Issue作成ページを開くだけです。
          最後の投稿ボタンは自分で押します。
        </div>

        <div className="ghsBtnRow">
          <button
            type="button"
            className="ghsBtnPrimary"
            onClick={handleSave}
            disabled={!!urlInput && !urlInputParsed?.ok}
          >
            保存する
          </button>
          <button
            type="button"
            className="ghsBtnSecondary"
            onClick={() => setShowSettings(false)}
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  if (!hasValidRepo) {
    return (
      <div className="ghsPanel">
        <div className="ghsTitle">GitHubで始める</div>
        <div className="ghsSub">
          リポジトリURLを入れると、Issue作成ページを開けます。
          投稿はまだ自分で押します。
        </div>
        <div className="ghsSafetyNote">
          まだGitHubには投稿しません。
          Issue作成ページを開くだけです。
          最後の投稿ボタンは自分で押します。
        </div>
        <button
          type="button"
          className="ghsBtnPrimary"
          onClick={() => setShowSettings(true)}
        >
          GitHub URLを設定する
        </button>
      </div>
    );
  }

  const repoName = parsed?.ok ? parsed.fullName : '';

  return (
    <div className="ghsPanel">
      <div className="ghsReadyBadge">✅ GitHubで始める準備OK</div>
      <div className="ghsRepoName">
        <span className="ghsRepoLabel">リポジトリ：</span>
        <span className="ghsRepoValue">{repoName}</span>
      </div>
      <div className="ghsNextNote">
        次にやること：
        Issue作成ページを開いて、内容を確認して投稿します。
      </div>
      <div className="ghsSafetyNote">
        まだGitHubには投稿しません。
        Issue作成ページを開くだけです。
        最後の投稿ボタンは自分で押します。
      </div>

      <div className="ghsBtnRow">
        <button
          type="button"
          className="ghsBtnPrimary"
          onClick={handleOpenIssuePage}
          disabled={!issueCreateResult?.ok}
        >
          <ExternalLink size={16} /> Issue作成ページを開く
        </button>
        <button
          type="button"
          className="ghsBtnSecondary"
          onClick={() => copyText('issue', pack.issueDraftMarkdown)}
          disabled={pack.status === 'not-ready'}
        >
          {copied === 'issue' ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> Issue本文をコピー</>}
        </button>
        <button
          type="button"
          className="ghsBtnSecondary"
          onClick={() => copyText('agent', pack.cloudAgentInstructionMarkdown)}
          disabled={pack.status === 'not-ready'}
        >
          {copied === 'agent' ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> Cloud Agent指示をコピー</>}
        </button>
        <button
          type="button"
          className="ghsBtnTertiary"
          onClick={() => setShowSettings(true)}
        >
          URLを変更する
        </button>
      </div>
    </div>
  );
}
