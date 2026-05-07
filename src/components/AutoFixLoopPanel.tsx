import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { loadAutoFixLoopState } from '../utils/autoFixLoopState';
import { runAutoFixLoop } from '../utils/runAutoFixLoop';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function AutoFixLoopPanel() {
  const [revision, setRevision] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo(() => loadAutoFixLoopState(), [revision]);

  // Only show when there's an active fix loop state (not idle/null)
  if (!state || state.status === 'idle') return null;
  // MergeCandidateCard handles merge-candidate state separately
  if (state.status === 'merge-candidate') return null;

  async function handleRunLoop() {
    if (running) return;
    setRunning(true);
    try {
      await runAutoFixLoop();
      setRevision((v) => v + 1);
    } finally {
      setRunning(false);
    }
  }

  async function handleCopy() {
    if (!state?.lastInstruction) return;
    try {
      await navigator.clipboard.writeText(state.lastInstruction);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const { status, userMessage, nextActionLabel, prUrl, lastFailureSummary, attemptCount, maxAttempts, updatedAt } = state;

  if (status === 'checking' || status === 'waiting-for-agent') {
    return (
      <div className="autoFixLoopPanel">
        <div className="autoFixLoopCard autoFixLoopCard--checking">
          <div className="autoFixLoopTitle">作業中</div>
          <div className="autoFixLoopReason">{userMessage}</div>
          <div className="autoFixLoopNextLabel">
            今やること：<span className="autoFixLoopNextAction">{nextActionLabel}</span>
          </div>
          {updatedAt && (
            <div className="autoFixLoopCheckAt">
              最終確認：{new Date(updatedAt).toLocaleTimeString('ja-JP')}
            </div>
          )}
        </div>
        <div className="autoFixLoopBtnRow">
          <button
            type="button"
            className="autoFixLoopBtnSecondary"
            onClick={handleRunLoop}
            disabled={running}
          >
            {running ? '確認中...' : 'いまの状態を確認する'}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'needs-fix') {
    return (
      <div className="autoFixLoopPanel">
        <div className="autoFixLoopCard autoFixLoopCard--needsFix">
          <div className="autoFixLoopTitle autoFixLoopTitle--warn">止まりました</div>
          <div className="autoFixLoopReason">
            理由：{lastFailureSummary ?? 'BuildまたはCIで止まりました'}
          </div>
          <div className="autoFixLoopAttemptNote">
            修正試行：{attemptCount} / {maxAttempts} 回
          </div>
          <div className="autoFixLoopNextLabel">次にやること：</div>
        </div>
        <div className="autoFixLoopBtnRow">
          <button
            type="button"
            className="autoFixLoopBtnPrimary"
            onClick={handleRunLoop}
            disabled={running}
          >
            {running ? <><span className="autoFixLoopSpinner" /> 送信中...</> : 'AIに修正をお願いする'}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'fix-instruction-ready') {
    return (
      <div className="autoFixLoopPanel">
        <div className="autoFixLoopCard autoFixLoopCard--needsFix">
          <div className="autoFixLoopTitle autoFixLoopTitle--warn">止まりました</div>
          <div className="autoFixLoopReason">
            修正依頼を送れませんでした。この文章をコピーしてPRに貼ってください。
          </div>
          <div className="autoFixLoopNextLabel">次にやること：</div>
        </div>
        <div className="autoFixLoopBtnRow">
          <button type="button" className="autoFixLoopBtnPrimary" onClick={handleCopy}>
            {copied ? <><Check size={16} /> コピーしました</> : <><Copy size={16} /> 修正指示をコピー</>}
          </button>
          {prUrl && (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="autoFixLoopBtnSecondary"
            >
              <ExternalLink size={14} /> PRを開く
            </a>
          )}
        </div>
      </div>
    );
  }

  if (status === 'fix-comment-posted') {
    return (
      <div className="autoFixLoopPanel">
        <div className="autoFixLoopCard autoFixLoopCard--posted">
          <div className="autoFixLoopTitle autoFixLoopTitle--success">AIに修正依頼を送りました</div>
          <div className="autoFixLoopNextLabel">
            今やること：<span className="autoFixLoopNextAction">何もしなくてOK</span>
          </div>
          {updatedAt && (
            <div className="autoFixLoopCheckAt">
              送信日時：{new Date(updatedAt).toLocaleTimeString('ja-JP')}
            </div>
          )}
        </div>
        <div className="autoFixLoopBtnRow">
          <button
            type="button"
            className="autoFixLoopBtnSecondary"
            onClick={handleRunLoop}
            disabled={running}
          >
            {running ? '確認中...' : 'もう一度確認する'}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'needs-human') {
    return (
      <div className="autoFixLoopPanel">
        <div className="autoFixLoopCard autoFixLoopCard--needsHuman">
          <div className="autoFixLoopTitle autoFixLoopTitle--caution">人間の確認が必要です</div>
          <div className="autoFixLoopReason">{userMessage}</div>
          <div className="autoFixLoopNextLabel">次にやること：</div>
        </div>
        <div className="autoFixLoopBtnRow">
          {prUrl && (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="autoFixLoopBtnPrimaryGreen"
            >
              <ExternalLink size={14} /> 詳細を見る
            </a>
          )}
        </div>
      </div>
    );
  }

  if (status === 'checks-passed') {
    return (
      <div className="autoFixLoopPanel">
        <div className="autoFixLoopCard autoFixLoopCard--posted">
          <div className="autoFixLoopTitle autoFixLoopTitle--success">確認できました</div>
          <div className="autoFixLoopReason">CIが通っています。</div>
          <div className="autoFixLoopNextLabel">
            今やること：<span className="autoFixLoopNextAction">{nextActionLabel}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
