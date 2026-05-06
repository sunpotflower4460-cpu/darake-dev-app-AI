import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, Target } from 'lucide-react';
import { loadAppRegistry } from '../utils/appRegistry';
import { buildTodaysFocus } from '../utils/todaysFocusSelector';

type CopyState = 'idle' | 'copied' | 'failed';

export function TodaysFocusPanel() {
  const [apps, setApps] = useState(loadAppRegistry());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setApps(loadAppRegistry());
  }, [reloadKey]);

  const focus = useMemo(() => buildTodaysFocus(apps), [apps]);

  async function handleCopy() {
    const text = [
      `# ${focus.title}`,
      '',
      ...focus.selectedApps.map((a) => `## ${a.appName}\n- 理由: ${a.reason}\n- アクション: ${a.recommendedAction}`),
      '',
      focus.notToday.length > 0 ? `## 今日でなくてOK\n${focus.notToday.map((n) => `- ${n}`).join('\n')}` : '',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
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
        <Target />
        <div>
          <p className="eyebrow">Phase 16.4</p>
          <h3>今日のフォーカス / Today's Focus</h3>
          <p>全部見ない。今日見るべきものだけ絞ります。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし</strong>
      </div>

      {focus.selectedApps.length > 0 ? (
        <div className="phaseItemList">
          <strong style={{ fontSize: '0.88rem', color: '#35513d' }}>{focus.title}</strong>
          {focus.selectedApps.map((app) => (
            <div key={app.appId} className="phaseAppCard phaseAppCard-dream-core">
              <div className="phaseAppCardName">{app.appName}</div>
              <div className="phaseAppCardMeta">
                <span className="phaseItemBadge">{app.reason}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#35513d' }}>👉 {app.recommendedAction}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="phaseInfoBox">
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            {apps.length === 0
              ? 'アプリが登録されていません。Phase 16.2で登録してください。'
              : '😌 今日は特に緊急対応はありません。ゆっくりしていいです。'}
          </p>
        </div>
      )}

      {focus.notToday.length > 0 && (
        <div className="phaseInfoBox">
          <strong>今日でなくてOK</strong>
          <ul>{focus.notToday.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      )}

      <div className="phaseControls">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'コピー'}
        </button>
      </div>
    </div>
  );
}
