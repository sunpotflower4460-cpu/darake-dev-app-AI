import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, BellOff } from 'lucide-react';
import {
  buildExternalNotificationCompletionReport,
  formatExternalNotificationCompletionReportMarkdown,
} from '../utils/externalNotificationCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function ExternalNotificationCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildExternalNotificationCompletionReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatExternalNotificationCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase19Panel">
      <div className="phase19Hero">
        <BellOff />
        <div>
          <p className="eyebrow">Phase 19.5</p>
          <h3>外部通知 完成レポート</h3>
          <p>外部通知候補の設定状況を確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ Webhook送信なし・secret保存なし</strong>
      </div>

      <div className="phaseSummaryGrid">
        <section>
          <h4>総チャンネル</h4>
          <p>{report.totalChannels}</p>
        </section>
        <section>
          <h4>候補</h4>
          <p>{report.candidateChannels.length}</p>
        </section>
        <section>
          <h4>手動のみ</h4>
          <p>{report.manualOnlyChannels.length}</p>
        </section>
      </div>

      <div className="phaseInfoBox">
        <strong>すぐ使える候補</strong>
        {report.readyToUseChannels.length > 0 ? (
          <ul>{report.readyToUseChannels.map((c, i) => <li key={i}>✅ {c}</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>secret が必要な候補</strong>
        {report.secretRequiredChannels.length > 0 ? (
          <ul>{report.secretRequiredChannels.map((c, i) => <li key={i}>⛔ {c}（外部secret管理が必要）</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      {report.blockedChannels.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>ブロック中</strong>
          <ul>{report.blockedChannels.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>次のおすすめ</strong>
        <ul>{report.nextRecommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

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
