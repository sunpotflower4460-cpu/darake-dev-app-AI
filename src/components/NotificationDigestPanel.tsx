import { useMemo, useState } from 'react';
import { Check, Copy, Layers, RefreshCcw } from 'lucide-react';
import { buildSampleDigest, severityLabel } from '../utils/notificationDigest';

export function NotificationDigestPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const digest = useMemo(() => buildSampleDigest(), [reloadKey]);

  function handleReload() {
    setReloadKey((k) => k + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(digest.markdown);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="notificationDigestPanel">
      <div className={`notificationDigestHero notificationDigest-${digest.status}`}>
        <Layers />
        <div>
          <p className="eyebrow">Phase 11.3</p>
          <h3>通知ダイジェスト / Batch Gate Summary</h3>
          <p>{digest.message}</p>
        </div>
      </div>

      <div className="notificationDigestControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button
          type="button"
          className={`notificationDigestCopyButton copy-${copyState}`}
          onClick={handleCopy}
        >
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : copyState === 'failed' ? '失敗' : 'Markdownコピー'}
        </button>
        <span className={`digestStatusBadge digest-${digest.status}`}>{digest.status}</span>
      </div>

      <div className="notificationDigestSummaryGrid">
        <section>
          <h4>Status</h4>
          <p>{digest.status}</p>
        </section>
        <section>
          <h4>即通知</h4>
          <p>{digest.immediateEvents.length}件</p>
        </section>
        <section>
          <h4>バッチ</h4>
          <p>{digest.batchedEvents.length}件</p>
        </section>
      </div>

      {digest.immediateEvents.length > 0 && (
        <div className="notificationDigestListBox notificationDigestImmediateBox">
          <strong>🔔 今すぐ見るべきもの</strong>
          <ul>
            {digest.immediateEvents.map((e) => (
              <li key={e.id}>
                {severityLabel(e.severity)} {e.title}: {e.summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      {digest.batchedEvents.length > 0 && (
        <div className="notificationDigestListBox notificationDigestBatchedBox">
          <strong>📋 最後のレポートで見るもの</strong>
          <ul>
            {digest.batchedEvents.map((e) => (
              <li key={e.id}>
                {severityLabel(e.severity)} {e.title}: {e.summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      {digest.status === 'quiet' && (
        <div className="notificationDigestQuiet">
          <p>現在、確認が必要な通知はありません。</p>
        </div>
      )}
    </div>
  );
}
