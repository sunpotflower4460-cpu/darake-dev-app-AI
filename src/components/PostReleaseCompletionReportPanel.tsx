import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, FileText, RefreshCcw } from 'lucide-react';
import { loadReleaseRecords } from '../utils/releaseRecord';
import { loadFeedbacks } from '../utils/postReleaseFeedbackRecord';
import {
  buildPostReleaseCompletionReport,
  formatPostReleaseCompletionReportMarkdown,
} from '../utils/postReleaseCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function PostReleaseCompletionReportPanel() {
  const [records, setRecords] = useState(loadReleaseRecords());
  const [feedbacks, setFeedbacks] = useState(loadFeedbacks());
  const [selectedAppId, setSelectedAppId] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setRecords(loadReleaseRecords());
    setFeedbacks(loadFeedbacks());
  }, [reloadKey]);

  const selectedRecord = records.find((r) => r.appId === selectedAppId);
  const report = useMemo(
    () => (selectedRecord ? buildPostReleaseCompletionReport(selectedRecord, feedbacks) : null),
    [selectedRecord, feedbacks],
  );

  async function handleCopy() {
    if (!selectedRecord || !report) return;
    try {
      await navigator.clipboard.writeText(formatPostReleaseCompletionReportMarkdown(selectedRecord, report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase15Panel">
      <div className="phase15Hero">
        <FileText />
        <div>
          <p className="eyebrow">Phase 15.6</p>
          <h3>公開後運用レポート / Post-Release Completion Report</h3>
          <p>公開後の状態を1枚でまとめます。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし</strong>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>対象アプリを選ぶ</legend>
          {records.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>リリース記録がありません。Phase 15.2で登録してください。</p>
          ) : (
            <label>
              アプリ
              <select value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                <option value="">（選択してください）</option>
                {records.map((r) => (
                  <option key={r.appId} value={r.appId}>
                    {r.appName} v{r.version}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>
      </div>

      {report && selectedRecord && (
        <>
          <div className="phaseSummaryGrid">
            <section>
              <h4>公開済み</h4>
              <p>{report.isReleased ? '✅' : '❌'}</p>
            </section>
            <section>
              <h4>フィードバック</h4>
              <p>{report.totalFeedbacks}件</p>
            </section>
            <section>
              <h4>critical</h4>
              <p>{report.criticalCount}件</p>
            </section>
          </div>

          <div className="phaseSummaryGrid">
            <section>
              <h4>Issue化済み</h4>
              <p>{report.issueDraftedCount}件</p>
            </section>
            <section>
              <h4>未対応</h4>
              <p>{report.pendingCount}件</p>
            </section>
            <section>
              <h4>候補</h4>
              <p>{report.nextUpdateCandidates.length}件</p>
            </section>
          </div>

          {report.criticalCount > 0 && (
            <div className="phaseBlockersBox">
              <strong>🔴 criticalなフィードバックがあります</strong>
              <p style={{ fontSize: '0.88rem' }}>Issue化を優先してください。</p>
            </div>
          )}

          <div className="phaseInfoBox">
            <strong>おすすめ</strong>
            <ul>{report.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
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
        </>
      )}
    </div>
  );
}
