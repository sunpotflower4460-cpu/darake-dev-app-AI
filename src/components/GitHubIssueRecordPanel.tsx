import { useEffect, useState } from 'react';
import { Check, Save, X } from 'lucide-react';
import { parseGitHubIssueUrl } from '../utils/parseGitHubIssueUrl';
import { loadGitHubIssueRecord, saveGitHubIssueRecord, clearGitHubIssueRecord } from '../utils/githubIssueRecord';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function GitHubIssueRecordPanel() {
  const [revision, setRevision] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  // Sync input when record changes externally
  useEffect(() => {
    const record = loadGitHubIssueRecord();
    if (record) {
      setUrlInput(record.issueUrl);
    }
  }, [revision]);

  const parsed = urlInput ? parseGitHubIssueUrl(urlInput) : null;
  const urlError = urlInput && parsed && !parsed.ok ? parsed.error : '';

  function handleSave() {
    const result = parseGitHubIssueUrl(urlInput.trim());
    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }
    saveGitHubIssueRecord({
      issueUrl: urlInput.trim(),
      owner: result.owner,
      repo: result.repo,
      fullName: result.fullName,
      issueNumber: result.issueNumber,
    });
    setErrorMsg('');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function handleClear() {
    clearGitHubIssueRecord();
    setUrlInput('');
    setErrorMsg('');
    setSaved(false);
  }

  const record = loadGitHubIssueRecord();

  return (
    <div className="girPanel">
      <div className="girTitle">作ったIssueを記録する</div>
      <div className="girSub">
        GitHubでIssueを作ったら、そのURLをここに貼ってください。
        次にCloud Agentへ貼る指示を作ります。
      </div>

      {record && (
        <div className="girRecordedBadge">
          ✅ 記録済み：{record.fullName} #{record.issueNumber}
        </div>
      )}

      <div className="girField">
        <label className="girLabel" htmlFor="gir-issue-url">
          Issue URL
        </label>
        <input
          id="gir-issue-url"
          className={`girInput${urlError || errorMsg ? ' girInputError' : ''}`}
          type="url"
          placeholder="https://github.com/owner/repo/issues/1"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            setErrorMsg('');
          }}
          autoComplete="url"
        />
        {(urlError || errorMsg) && (
          <div className="girFieldError">{urlError || errorMsg}</div>
        )}
        {urlInput && parsed?.ok && (
          <div className="girFieldOk">
            ✅ {parsed.fullName} #{parsed.issueNumber}
          </div>
        )}
      </div>

      <div className="girSafetyNote">
        まだGitHubには自動投稿しません。
        作ったIssueのURLを記録するだけです。
      </div>

      <div className="girBtnRow">
        <button
          type="button"
          className="girBtnPrimary"
          onClick={handleSave}
          disabled={!urlInput || !!urlError}
        >
          {saved ? (
            <><Check size={16} /> 保存しました</>
          ) : (
            <><Save size={16} /> 記録する</>
          )}
        </button>
        {record && (
          <button
            type="button"
            className="girBtnTertiary"
            onClick={handleClear}
          >
            <X size={14} /> 記録を消す
          </button>
        )}
      </div>
    </div>
  );
}
