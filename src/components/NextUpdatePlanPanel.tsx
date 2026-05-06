import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, Rocket } from 'lucide-react';
import { loadReleaseRecords } from '../utils/releaseRecord';
import { loadFeedbacks } from '../utils/postReleaseFeedbackRecord';
import { buildNextUpdatePlan } from '../utils/nextUpdatePlan';

type CopyState = 'idle' | 'copied' | 'failed';

export function NextUpdatePlanPanel() {
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
  const plan = useMemo(
    () => (selectedRecord ? buildNextUpdatePlan(selectedRecord, feedbacks) : null),
    [selectedRecord, feedbacks],
  );

  async function handleCopy() {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan.issueDraft);
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
        <Rocket />
        <div>
          <p className="eyebrow">Phase 15.5</p>
          <h3>次アップデート計画 / Next Update Plan</h3>
          <p>リリース記録とフィードバックから次のアップデート計画を作ります。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし・本番操作なし</strong>
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

      {plan && (
        <>
          <div className="phaseSummaryGrid">
            <section>
              <h4>対象バージョン</h4>
              <p>{plan.targetVersion}</p>
            </section>
            <section>
              <h4>ステータス</h4>
              <p>{plan.status}</p>
            </section>
            <section>
              <h4>修正候補</h4>
              <p>{plan.includedFixes.length}件</p>
            </section>
          </div>

          {plan.includedFixes.length > 0 && (
            <div className="phaseInfoBox">
              <strong>含める修正</strong>
              <ul>{plan.includedFixes.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
          )}

          {plan.includedImprovements.length > 0 && (
            <div className="phaseInfoBox">
              <strong>含める改善</strong>
              <ul>{plan.includedImprovements.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
          )}

          {plan.risks.length > 0 && (
            <div className="phaseWarningsBox">
              <strong>⚠️ リスク</strong>
              <ul>{plan.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}

          <div>
            <strong style={{ fontSize: '0.88rem', color: '#35513d', display: 'block', marginBottom: '8px' }}>Issue下書き</strong>
            <div className="phaseCodeBox">{plan.issueDraft}</div>
          </div>

          <div className="phaseControls">
            <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCcw size={16} /> 再読み込み
            </button>
            <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
              {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
              {copyState === 'copied' ? 'コピー済み' : 'Issue下書きコピー'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
