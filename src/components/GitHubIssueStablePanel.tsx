import { useMemo, useState } from 'react';
import '../githubIssueStable.css';
import { buildIssueStabilizerState } from '../utils/githubIssueStabilizer';

export function GitHubIssueStablePanel() {
  const state = useMemo(() => buildIssueStabilizerState(), []);
  const [copied, setCopied] = useState(false);

  function copyBody() {
    if (state.mode !== 'ready') return;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(state.body).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      });
    }
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
        >
          GitHubでIssueを開く（本文入り）
        </a>
        <button type="button" className="issueStable__copy" onClick={copyBody}>
          {copied ? 'コピーしました' : '本文をコピー'}
        </button>
      </div>

      <p className="issueStable__note">
        自動作成できない場合でも、上のボタンでGitHub Issue作成画面が開きます。本文はコピー済みにできます。
      </p>
    </section>
  );
}
