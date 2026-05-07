import { useEffect, useMemo, useState } from 'react';
import { OneActionCard } from './OneActionCard';
import { getWakeAction, runWakeAction } from '../utils/wakeActionTokenClient';
import { loadDarakeLevelSettings } from '../utils/darakeLevelSettings';
import type { WakeActionTokenRecord } from '../utils/darakeRemoteRun';

type PanelState =
  | { kind: 'loading' }
  | { kind: 'expired' }
  | { kind: 'used'; action: WakeActionTokenRecord }
  | { kind: 'error'; message: string }
  | { kind: 'active'; action: WakeActionTokenRecord }
  | { kind: 'done'; message: string; detailText?: string }
  | { kind: 'fallback'; copyText: string };

type Props = {
  tokenId: string;
  onDismiss: () => void;
};

export function WakeActionPanel({ tokenId, onDismiss }: Props) {
  const [state, setState] = useState<PanelState>({ kind: 'loading' });
  const [running, setRunning] = useState(false);
  const levelSettings = useMemo(() => loadDarakeLevelSettings(), []);
  const isCareful = levelSettings.level === 'careful';

  useEffect(() => {
    let cancelled = false;
    getWakeAction(tokenId).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        if (res.code === 'EXPIRED') {
          setState({ kind: 'expired' });
        } else if (res.code === 'USED') {
          setState({ kind: 'error', message: 'このアクションは実行済みです。何もしなくてOK。' });
        } else if (res.code === 'NOT_FOUND') {
          setState({ kind: 'expired' });
        } else {
          setState({ kind: 'error', message: res.error });
        }
        return;
      }
      setState({ kind: 'active', action: res.action });
    });
    return () => { cancelled = true; };
  }, [tokenId]);

  async function handlePrimary(action: WakeActionTokenRecord) {
    // open-pr: just open the URL — no API call, no token marking
    if (action.actionKind === 'open-pr') {
      const url = action.prUrl ?? action.actionUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    // copy-fallback-instruction: copy to clipboard only
    if (action.actionKind === 'copy-fallback-instruction') {
      await copyToClipboard(action.message ?? '');
      setState({ kind: 'done', message: 'コピーしました' });
      return;
    }

    // show-setup / show-details: dismiss back to main app
    if (action.actionKind === 'show-setup' || action.actionKind === 'show-details') {
      onDismiss();
      return;
    }

    // open-issue: open the issue URL
    if (action.actionKind === 'open-issue') {
      const url = action.issueUrl ?? action.actionUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    // send-fix-request: call the run API
    setRunning(true);
    try {
      const res = await runWakeAction(tokenId);
      if (res.ok) {
        setState({ kind: 'done', message: 'AIに修正依頼を送りました' });
      } else if (res.code === 'USED') {
        setState({ kind: 'done', message: '修正依頼は送済みです。何もしなくてOK。' });
      } else {
        // fallback: let user copy the text
        const copyText = (res as { fallbackText?: string }).fallbackText ?? action.message;
        setState({ kind: 'fallback', copyText });
      }
    } finally {
      setRunning(false);
    }
  }

  async function handleCopyFallback(text: string) {
    await copyToClipboard(text);
    setState({ kind: 'done', message: 'コピーしました。PRに貼り付けてください。' });
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (state.kind === 'loading') {
    return (
      <div className="wakeActionPanel">
        <div className="wakeActionPanel__inner wakeActionPanel__inner--loading">
          <div className="wakeActionPanel__loadingText">確認中...</div>
        </div>
      </div>
    );
  }

  if (state.kind === 'expired') {
    return (
      <div className="wakeActionPanel">
        <div className="wakeActionPanel__inner">
          <OneActionCard
            title="この通知は古くなっています"
            message="最新の状態を確認してください。"
            primaryLabel="最新状態を見る"
            onPrimary={onDismiss}
          />
        </div>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="wakeActionPanel">
        <div className="wakeActionPanel__inner">
          <OneActionCard
            title="確認できませんでした"
            message={state.message}
            primaryLabel="最新状態を見る"
            onPrimary={onDismiss}
          />
        </div>
      </div>
    );
  }

  if (state.kind === 'done') {
    return (
      <div className="wakeActionPanel">
        <div className="wakeActionPanel__inner">
          <OneActionCard
            title={state.message}
            message="今やること："
            primaryLabel="何もしなくてOK"
            onPrimary={onDismiss}
            detailText={isCareful ? state.detailText : undefined}
          />
        </div>
      </div>
    );
  }

  if (state.kind === 'fallback') {
    return (
      <div className="wakeActionPanel">
        <div className="wakeActionPanel__inner">
          <OneActionCard
            title="送れませんでした"
            message="次にやること：この文章をコピーしてPRに貼ってください"
            primaryLabel="コピー"
            onPrimary={() => handleCopyFallback(state.copyText)}
            detailText={isCareful ? state.copyText : undefined}
          />
        </div>
      </div>
    );
  }

  if (state.kind === 'used') {
    return (
      <div className="wakeActionPanel">
        <div className="wakeActionPanel__inner">
          <OneActionCard
            title="このアクションは実行済みです"
            message="今やること："
            primaryLabel="何もしなくてOK"
            onPrimary={onDismiss}
          />
        </div>
      </div>
    );
  }

  // active
  const { action } = state;
  return (
    <div className="wakeActionPanel">
      <div className="wakeActionPanel__inner">
        {renderActiveCard(action, running, isCareful, () => handlePrimary(action), onDismiss)}
      </div>
    </div>
  );
}

function renderActiveCard(
  action: WakeActionTokenRecord,
  running: boolean,
  isCareful: boolean,
  onPrimary: () => void,
  onDismiss: () => void,
) {
  switch (action.actionKind) {
    case 'open-pr':
      return (
        <OneActionCard
          title="マージ候補です"
          message={`PRは問題なさそうです。\n次にやること：\nPRを開いて確認してください`}
          primaryLabel="PRを開く"
          onPrimary={onPrimary}
          secondaryLabel="あとで見る"
          onSecondary={onDismiss}
          detailText={isCareful ? `PR: ${action.prUrl ?? ''}` : undefined}
        />
      );

    case 'send-fix-request':
      return (
        <OneActionCard
          title="止まりました"
          message={`理由：\n${action.reason}\n\n次にやること：\nAIに修正をお願いする`}
          primaryLabel="AIに修正をお願いする"
          onPrimary={onPrimary}
          primaryLoading={running}
          secondaryLabel="あとで見る"
          onSecondary={onDismiss}
          detailText={isCareful ? action.message : undefined}
        />
      );

    case 'copy-fallback-instruction':
      return (
        <OneActionCard
          title="送れませんでした"
          message="次にやること：\nこの文章をコピーしてPRに貼ってください"
          primaryLabel="コピー"
          onPrimary={onPrimary}
          detailText={isCareful ? action.message : undefined}
        />
      );

    case 'show-setup':
      return (
        <OneActionCard
          title="設定が必要です"
          message="CloudflareのWorker Secretを設定してください。\n（RUN_REGISTRY_KV、GITHUB_TOKENなど）"
          primaryLabel="設定方法を見る"
          onPrimary={onDismiss}
        />
      );

    case 'open-issue':
      return (
        <OneActionCard
          title="Issueがあります"
          message={`理由：\n${action.reason}\n\n次にやること：\nIssueを確認してください`}
          primaryLabel="Issueを開く"
          onPrimary={onPrimary}
          secondaryLabel="あとで見る"
          onSecondary={onDismiss}
          detailText={isCareful ? `Issue: ${action.issueUrl ?? ''}` : undefined}
        />
      );

    case 'show-details':
    default:
      return (
        <OneActionCard
          title="確認が必要です"
          message={`理由：\n${action.reason}`}
          primaryLabel="詳細を見る"
          onPrimary={onDismiss}
          detailText={isCareful ? action.message : undefined}
        />
      );
  }
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for environments without clipboard API
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
