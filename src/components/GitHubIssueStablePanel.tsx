import { useMemo, useState } from 'react';
import '../githubIssueStable.css';
import {
  buildDarakeWorkSession,
  loadCurrentWorkSession,
  parseGitHubIssueInput,
  saveCurrentWorkSession,
} from '../utils/darakeWorkSession';
import { buildIssueStabilizerState } from '../utils/githubIssueStabilizer';
import { loadGentleAppStartForm } from '../utils/gentleAppStartForm';

export function GitHubIssueStablePanel() {
  const state = useMemo(() => buildIssueStabilizerState(), []);
  const [copied, setCopied] = useState(false);
  const currentSession = loadCurrentWorkSession();
  const form = loadGentleAppStartForm();
  const [issueInput, setIssueInput] = useState(
    currentSession?.issueUrl || (currentSession?.issueNumber ? String(currentSession.issueNumber) : ''),
  );
  const [savedMessage, setSavedMessage] = useState('');

  function copyBody() {
    if (state.mode !== 'ready') return;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(state.body).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  function markIssueReady() {
    if (state.mode !== 'ready') return;
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...(loadCurrentWorkSession() ?? {}),
        appName: currentSession?.appName || form?.appName || '新しいアプリ',
        oneLineIdea: currentSession?.oneLineIdea || form?.oneLineIdea || 'アイデアを整理する',
        repoUrl: state.repoUrl,
        issueUrl: null,
        issueNumber: currentSession?.issueNumber ?? null,
        status: 'issue-ready',
        nextActionLabel: 'GitHub Issue作成画面を開く',
      }),
    );
  }

  function saveIssueLink() {
    if (state.mode !== 'ready') return;
    const parsed = parseGitHubIssueInput(issueInput, state.repoUrl);
    if (!parsed.issueNumber && !parsed.issueUrl) {
      setSavedMessage('Issue URL か Issue番号を入れてください');
      return;
    }
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...(loadCurrentWorkSession() ?? {}),
        appName: currentSession?.appName || form?.appName || '新しいアプリ',
        oneLineIdea: currentSession?.oneLineIdea || form?.oneLineIdea || 'アイデアを整理する',
        repoUrl: parsed.repoUrl || state.repoUrl,
        issueUrl: parsed.issueUrl,
        issueNumber: parsed.issueNumber,
        status: 'issue-created',
        nextActionLabel: 'AI指示を作る',
      }),
    );
    setIssueInput(parsed.issueUrl || (parsed.issueNumber ? String(parsed.issueNumber) : issueInput));
    setSavedMessage('WorkSessionにIssueを保存しました');
  }

  if (state.mode === 'no-repo') {
    return (
      <section className="issueStable" aria-label="Issue作成">
        <span className="issueStable__eyebrow">Phase 93</span>
        <h2 className="issueStable__title">作業Issueを作る</h2>
        <p className="issueStable__empty">
          まずリポジトリURLを設定してください。「初期設定ここだけ」から進められます。
        </p>
      </section>
    );
  }

  if (state.mode === 'no-idea') {
    return (
      <section className="issueStable" aria-label="Issue作成">
        <span className="issueStable__eyebrow">Phase 93</span>
        <h2 className="issueStable__title">作業Issueを作る</h2>
        <p className="issueStable__empty">
          まずアプリのアイデアを入力してください。
        </p>
      </section>
    );
  }

  return (
    <section className="issueStable" aria-label="Issue作成">
      <span className="issueStable__eyebrow">Phase 93 · 作業Issueを作る</span>
      <h2 className="issueStable__title">Issueを作る</h2>

      <div className="issueStable__issueTitle">{state.title}</div>

      <div className="issueStable__body">
        <span className="issueStable__bodyLabel">Issue本文（自動生成）</span>
        <pre className="issueStable__bodyPreview">{state.body}</pre>
      </div>

      <div className="issueStable__actions">
        <a
          href={state.fallbackUrl}
          target="_blank"
          rel="noreferrer"
          className="issueStable__primary"
          onClick={markIssueReady}
        >
          GitHubでIssueを開く（本文入り）
        </a>
        <button type="button" className="issueStable__copy" onClick={copyBody}>
          {copied ? 'コピーしました' : '本文をコピー'}
        </button>
      </div>

      <div className="issueStable__field">
        <label className="issueStable__bodyLabel" htmlFor="issue-stable-input">
          作成したIssue URL または Issue番号
        </label>
        <div className="issueStable__actions">
          <input
            id="issue-stable-input"
            className="issueStable__input"
            value={issueInput}
            onChange={(event) => setIssueInput(event.target.value)}
            placeholder="https://github.com/owner/repo/issues/123 または 123"
          />
          <button type="button" className="issueStable__fallback" onClick={saveIssueLink}>
            保存
          </button>
        </div>
        {savedMessage ? <div className="issueStable__success">{savedMessage}</div> : null}
      </div>

      <p className="issueStable__note">
        自動作成できない場合でも、上のボタンでGitHub Issue作成画面が開きます。本文はコピー済みにできます。
      </p>
    </section>
  );
}
