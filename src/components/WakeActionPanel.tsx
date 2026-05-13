import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { OneActionCard } from './OneActionCard';
import { getWakeAction, runWakeAction } from '../utils/wakeActionTokenClient';
import { clearWakeActionFromUrl } from '../utils/wakeActionRouter';
import { loadDarakeLevelSettings } from '../utils/darakeLevelSettings';
import type { WakeActionTokenRecord } from '../utils/wakeActionTokenClient';

type PanelState =
  | { phase: 'loading' }
  | { phase: 'error'; code: string; message: string }
  | { phase: 'expired' }
  | { phase: 'used' }
  | { phase: 'ready'; action: WakeActionTokenRecord }
  | { phase: 'running' }
  | { phase: 'done'; message: string; actionUrl?: string }
  | { phase: 'failed'; error: string; fallbackText?: string };

type WakeActionPanelProps = {
  tokenId: string;
  onDismiss: () => void;
};

export function WakeActionPanel({ tokenId, onDismiss }: WakeActionPanelProps) {
  const [state, setState] = useState<PanelState>({ phase: 'loading' });
  const [copyDone, setCopyDone] = useState(false);
  const level = loadDarakeLevelSettings().level;
  const isWakeMeOnly = level === 'wake-me-only-if-needed';
  const isCareful = level === 'careful';

  useEffect(() => {
    let cancelled = false;
    getWakeAction(tokenId).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        if (res.code === 'EXPIRED') {
          setState({ phase: 'expired' });
        } else if (res.code === 'USED') {
          setState({ phase: 'used' });
        } else {
          setState({ phase: 'error', code: res.code, message: res.error });
        }
        return;
      }
      setState({ phase: 'ready', action: res.action });
    });
    return () => { cancelled = true; };
  }, [tokenId]);

  async function handlePrimary() {
    if (state.phase !== 'ready') return;
    const { action } = state;

    if (action.actionKind === 'open-pr') {
      if (action.prUrl) {
        window.open(action.prUrl, '_blank', 'noopener,noreferrer');
      }
      clearWakeActionFromUrl();
      onDismiss();
      return;
    }

    if (action.actionKind === 'open-issue') {
      if (action.issueUrl) {
        window.open(action.issueUrl, '_blank', 'noopener,noreferrer');
      }
      clearWakeActionFromUrl();
      onDismiss();
      return;
    }

    if (action.actionKind === 'copy-fallback-instruction') {
      await copyToClipboard(action.message);
      setCopyDone(true);
      return;
    }

    if (action.actionKind === 'show-setup' || action.actionKind === 'show-details') {
      clearWakeActionFromUrl();
      onDismiss();
      return;
    }

    if (action.actionKind === 'send-fix-request') {
      setState({ phase: 'running' });
      const res = await runWakeAction(tokenId);
      if (res.ok) {
        setState({ phase: 'done', message: res.message, actionUrl: res.actionUrl });
        clearWakeActionFromUrl();
      } else {
        setState({
          phase: 'failed',
          error: res.error,
          fallbackText: res.fallbackText,
        });
      }
    }
  }

  async function handleCopyFallback(text: string) {
    await copyToClipboard(text);
    setCopyDone(true);
  }

  function handleViewLatest() {
    clearWakeActionFromUrl();
    onDismiss();
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (state.phase === 'loading') {
    return (
      <div className="wakeActionPanel wakeActionPanel--loading">
        <div className="wakeActionPanel__spinner" aria-hidden="true" />
        <div className="wakeActionPanel__loadingText">確認中...</div>
      </div>
    );
  }

  // ── Expired ──────────────────────────────────────────────────────────────
  if (state.phase === 'expired') {
    return (
      <div className="wakeActionPanel wakeActionPanel--expired">
        <OneActionCard
          title="この確認項目は古くなっています"
          message="最新の状態を確認します。"
          primaryLabel="最新状態を見る"
          onPrimary={handleViewLatest}
        />
      </div>
    );
  }

  // ── Used ─────────────────────────────────────────────────────────────────
  if (state.phase === 'used') {
    return (
      <div className="wakeActionPanel wakeActionPanel--used">
        <OneActionCard
          title="すでに完了しています"
          message="この確認項目はすでに処理されました。"
          primaryLabel="最新状態を見る"
          onPrimary={handleViewLatest}
        />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (state.phase === 'error') {
    return (
      <div className="wakeActionPanel wakeActionPanel--error">
        <OneActionCard
          title="取得できませんでした"
          message="確認項目を読み込めませんでした。"
          primaryLabel="最新状態を見る"
          onPrimary={handleViewLatest}
        />
      </div>
    );
  }

  // ── Running ───────────────────────────────────────────────────────────────
  if (state.phase === 'running') {
    return (
      <div className="wakeActionPanel wakeActionPanel--running">
        <div className="wakeActionPanel__spinner" aria-hidden="true" />
        <div className="wakeActionPanel__loadingText">送信中...</div>
      </div>
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (state.phase === 'done') {
    return (
      <div className="wakeActionPanel wakeActionPanel--done">
        <div className="wakeActionPanel__doneTitle">完了しました</div>
        <div className="wakeActionPanel__doneMessage">{state.message}</div>
        <div className="wakeActionPanel__nowLabel">
          今やること：
          <br />
          <span className="wakeActionPanel__nowAction">何もしなくてOK</span>
        </div>
        {state.actionUrl && (
          <a
            href={state.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wakeActionPanel__linkBtn"
          >
            <ExternalLink size={14} /> 確認する
          </a>
        )}
      </div>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────────
  if (state.phase === 'failed') {
    return (
      <div className="wakeActionPanel wakeActionPanel--failed">
        <OneActionCard
          title="送れませんでした"
          message="後でやること："
          primaryLabel={copyDone ? 'コピー済み ✓' : 'この文章をコピーしてPRに貼ってください'}
          onPrimary={() => state.fallbackText && handleCopyFallback(state.fallbackText)}
          secondaryLabel="最新状態を見る"
          onSecondary={handleViewLatest}
          detailText={isCareful ? state.error : undefined}
        />
        {state.fallbackText && (
          <div className="wakeActionPanel__fallback">
            <div className="wakeActionPanel__fallbackLabel">貼り付ける文章：</div>
            <pre className="wakeActionPanel__fallbackBody">{state.fallbackText}</pre>
          </div>
        )}
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────
  const { action } = state;

  if (action.actionKind === 'open-pr') {
    return (
      <div className="wakeActionPanel wakeActionPanel--ready">
        <OneActionCard
          title="PR確認候補です"
          message={
            isWakeMeOnly
              ? `後で見ること：\nPRを確認してください`
              : `${action.reason}\n\n後で見ること：\nPRを確認してください`
          }
          primaryLabel={
            <span className="wakeActionPanel__btnInner">
              <ExternalLink size={14} /> PRを開く
            </span> as unknown as string
          }
          onPrimary={handlePrimary}
          detailText={isCareful ? buildCarefulDetail(action) : undefined}
        />
      </div>
    );
  }

  if (action.actionKind === 'send-fix-request') {
    return (
      <div className="wakeActionPanel wakeActionPanel--ready">
        <OneActionCard
          title="聞くことリストに入りました"
          message={
            isWakeMeOnly
              ? `後でやること：\nAIに修正をお願いする`
              : `理由：\n${action.reason}\n\n後でやること：\nAIに修正をお願いする`
          }
          primaryLabel="AIに修正をお願いする"
          onPrimary={handlePrimary}
          detailText={isCareful ? buildCarefulDetail(action) : undefined}
        />
      </div>
    );
  }

  if (action.actionKind === 'show-setup') {
    return (
      <div className="wakeActionPanel wakeActionPanel--ready">
        <OneActionCard
          title="後で設定確認が必要です"
          message={action.message}
          primaryLabel="確認する"
          onPrimary={handlePrimary}
        />
      </div>
    );
  }

  if (action.actionKind === 'show-details') {
    return (
      <div className="wakeActionPanel wakeActionPanel--ready">
        <OneActionCard
          title={action.nextActionLabel}
          message={
            isWakeMeOnly
              ? `後で見ること：\n${action.nextActionLabel}`
              : `理由：\n${action.reason}\n\n後で見ること：\n${action.nextActionLabel}`
          }
          primaryLabel="最新状態を見る"
          onPrimary={handleViewLatest}
          detailText={isCareful ? buildCarefulDetail(action) : undefined}
        />
      </div>
    );
  }

  if (action.actionKind === 'copy-fallback-instruction') {
    return (
      <div className="wakeActionPanel wakeActionPanel--ready">
        <OneActionCard
          title={action.nextActionLabel}
          message={action.message}
          primaryLabel={copyDone ? 'コピー済み ✓' : 'コピーする'}
          onPrimary={handlePrimary}
          secondaryLabel="最新状態を見る"
          onSecondary={handleViewLatest}
        />
      </div>
    );
  }

  if (action.actionKind === 'open-issue') {
    return (
      <div className="wakeActionPanel wakeActionPanel--ready">
        <OneActionCard
          title={action.nextActionLabel}
          message={action.message}
          primaryLabel={
            <span className="wakeActionPanel__btnInner">
              <ExternalLink size={14} /> Issueを開く
            </span> as unknown as string
          }
          onPrimary={handlePrimary}
          detailText={isCareful ? buildCarefulDetail(action) : undefined}
        />
      </div>
    );
  }

  return null;
}

function buildCarefulDetail(action: WakeActionTokenRecord): string {
  const parts: string[] = [];
  if (action.reason) parts.push(`理由: ${action.reason}`);
  if (action.prUrl) parts.push(`PR: ${action.prUrl}`);
  if (action.issueUrl) parts.push(`Issue: ${action.issueUrl}`);
  if (action.message) parts.push(`メッセージ: ${action.message}`);
  return parts.join('\n');
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
