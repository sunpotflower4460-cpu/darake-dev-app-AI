import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Copy, RefreshCcw } from 'lucide-react';
import { loadAppRegistry } from '../utils/appRegistry';
import { buildCrossAppNotificationDigest } from '../utils/crossAppNotificationDigest';

type CopyState = 'idle' | 'copied' | 'failed';

export function CrossAppNotificationDigestPanel() {
  const [apps, setApps] = useState(loadAppRegistry());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setApps(loadAppRegistry());
  }, [reloadKey]);

  const digest = useMemo(() => buildCrossAppNotificationDigest(apps), [apps]);

  async function handleCopy() {
    const lines = [
      `# 複数アプリ 通知ダイジェスト`,
      '',
      `**${digest.summary}**`,
      '',
      digest.now.length > 0 ? `## 今すぐ\n${digest.now.map((e) => `- ${e.appName}: ${e.message}`).join('\n')}` : '',
      digest.today.length > 0 ? `## 今日中\n${digest.today.map((e) => `- ${e.appName}: ${e.message}`).join('\n')}` : '',
      digest.report.length > 0 ? `## レポート確認でOK\n${digest.report.map((e) => `- ${e.appName}: ${e.message}`).join('\n')}` : '',
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase16Panel">
      <div className="phase16Hero">
        <Bell />
        <div>
          <p className="eyebrow">Phase 16.5</p>
          <h3>複数アプリ 通知ダイジェスト</h3>
          <p>複数アプリの通知をまとめて確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし</strong>
        <p>{digest.summary}</p>
      </div>

      {digest.now.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>🔴 今すぐ確認 ({digest.now.length}件)</strong>
          <ul>{digest.now.map((e) => <li key={e.appId}>{e.appName}: {e.message}</li>)}</ul>
        </div>
      )}

      {digest.today.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>🟡 今日中 ({digest.today.length}件)</strong>
          <ul>{digest.today.map((e) => <li key={e.appId}>{e.appName}: {e.message}</li>)}</ul>
        </div>
      )}

      {digest.report.length > 0 && (
        <div className="phaseInfoBox">
          <strong>📋 レポート確認でOK ({digest.report.length}件)</strong>
          <ul>{digest.report.map((e) => <li key={e.appId}>{e.appName}: {e.message}</li>)}</ul>
        </div>
      )}

      {digest.ignore.length > 0 && (
        <div className="phaseInfoBox" style={{ opacity: 0.7 }}>
          <strong>🗃 無視してよいもの ({digest.ignore.length}件)</strong>
          <ul>{digest.ignore.map((e) => <li key={e.appId}>{e.appName}: {e.message}</li>)}</ul>
        </div>
      )}

      {apps.length === 0 && (
        <div className="phaseInfoBox">
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>アプリが登録されていません。Phase 16.2で登録してください。</p>
        </div>
      )}

      <div className="phaseControls">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
