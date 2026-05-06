import { useState } from 'react';
import { Bell, Check, Copy, RefreshCcw } from 'lucide-react';
import {
  buildDefaultNotificationDryRunTargets,
  formatNotificationDryRunTargetsMarkdown,
  summarizeNotificationDryRunTargets,
} from '../utils/notificationDryRunTarget';
import type { NotificationDryRunTarget } from '../utils/notificationDryRunTarget';

type CopyState = 'idle' | 'copied' | 'failed';

function StatusBadge({ status }: { status: NotificationDryRunTarget['status'] }) {
  return (
    <span className={`phase26StatusBadge ${status}`}>{status}</span>
  );
}

export function NotificationDryRunTargetPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // reloadKey is read here to suppress unused-variable lint; button increments it to trigger re-render
  void reloadKey;
  const targets = buildDefaultNotificationDryRunTargets();

  async function handleCopy() {
    try {
      const text = formatNotificationDryRunTargetsMarkdown(targets);
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  async function handleSummaryCopy() {
    try {
      await navigator.clipboard.writeText(summarizeNotificationDryRunTargets(targets));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase26Panel">
      <div className="phase26Hero">
        <Bell />
        <div>
          <p className="eyebrow">Phase 26.1</p>
          <h3>Notification Dry-run Target</h3>
          <p>通知dry-runの対象チャンネルを整理します。実送信はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部送信なし・secret保存なし・すべてdry-run / manual-copy</strong>
      </div>

      <div className="phase26SummaryGrid">
        <section>
          <h4>合計</h4>
          <p>{targets.length}</p>
        </section>
        <section>
          <h4>manual-copy-ready</h4>
          <p>{targets.filter((t) => t.status === 'manual-copy-ready').length}</p>
        </section>
        <section>
          <h4>draft-only</h4>
          <p>{targets.filter((t) => t.status === 'draft-only').length}</p>
        </section>
        <section>
          <h4>secret必要</h4>
          <p>{targets.filter((t) => t.requiresSecret).length}</p>
        </section>
      </div>

      <table className="phase26Table">
        <thead>
          <tr>
            <th>チャンネル</th>
            <th>type</th>
            <th>status</th>
            <th>secret</th>
            <th>markdown</th>
            <th>plain</th>
            <th>json</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((t) => (
            <tr key={t.id}>
              <td>{t.label}</td>
              <td>{t.type}</td>
              <td><StatusBadge status={t.status} /></td>
              <td>{t.requiresSecret ? '⛔ 要' : '✅ 不要'}</td>
              <td>{t.supportsMarkdown ? '✅' : '—'}</td>
              <td>{t.supportsPlainText ? '✅' : '—'}</td>
              <td>{t.supportsJsonPayload ? '✅' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="phaseInfoBox">
        <strong>secret policy</strong>
        <ul>
          {targets.map((t) => (
            <li key={t.id}>
              <strong>{t.label}</strong>: {t.secretPolicy}
              {t.notes ? ` — ${t.notes}` : ''}
            </li>
          ))}
        </ul>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleSummaryCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'サマリーコピー'}
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
