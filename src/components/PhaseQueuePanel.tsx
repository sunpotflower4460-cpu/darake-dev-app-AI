import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, ListChecks } from 'lucide-react';
import { loadIssueRecord } from '../utils/issueRecordStore';
import { buildPhaseQueueFromIssue } from '../utils/phaseQueueFromIssue';

const statusLabel = {
  waiting: '待機中',
  ready: '接続準備OK',
  linked: '接続済み',
  'needs-followup': '後で確認',
};

export function PhaseQueuePanel() {
  const [issueRecord, setIssueRecord] = useState(() => loadIssueRecord());
  const queueItem = useMemo(() => buildPhaseQueueFromIssue(issueRecord), [issueRecord]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setIssueRecord(loadIssueRecord()), 1200);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="phaseQueuePanel">
      <div className="phaseQueueHero">
        <ListChecks />
        <div>
          <p className="eyebrow">Phase 7.7</p>
          <h3>Phase Queueの入口</h3>
          <p>手動で作ったIssueを、次のAuto Run Planで使えるPhase Queueの種として見える化します。</p>
        </div>
      </div>

      <article className={`phaseQueueCard queue-${queueItem.status}`}>
        <div>
          <strong>{queueItem.phase}</strong>
          <span>{statusLabel[queueItem.status]}</span>
        </div>
        <p>{queueItem.message}</p>
        <div className="phaseQueueMeta">
          <span>{queueItem.issueNumber}</span>
          {queueItem.issueUrl ? <a href={queueItem.issueUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Issueを開く</a> : <span>URL未記録</span>}
        </div>
      </article>

      <div className="phaseQueueNote">
        <strong>次の使い道</strong>
        <p>ここでPhaseとIssueがつながると、Phase 8の一括オート進行モードで「どの順番で進めるか」を作れるようになります。</p>
      </div>
    </div>
  );
}
