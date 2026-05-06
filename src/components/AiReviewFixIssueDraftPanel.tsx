import { useMemo, useState } from 'react';
import { Check, Copy, FileEdit, RefreshCcw } from 'lucide-react';
import {
  loadAiReviewResultRecords,
} from '../utils/aiReviewResultRecord';
import {
  buildAiReviewFixIssueDraft,
  saveAiReviewFixIssueDrafts,
  loadAiReviewFixIssueDrafts,
  formatAiReviewFixIssueDraftMarkdown,
  AiReviewFixIssueDraft,
} from '../utils/aiReviewFixIssueDraft';
import { AiReviewTarget } from '../utils/aiReviewInputPack';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiReviewFixIssueDraftPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [savedDrafts, setSavedDrafts] = useState<AiReviewFixIssueDraft[]>(loadAiReviewFixIssueDrafts);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const records = useMemo(() => loadAiReviewResultRecords(), [reloadKey]);
  const failedOrWarnRecords = records.filter((r) => r.status === 'failed' || r.status === 'warn');

  const selectedRecord = records.find((r) => r.id === selectedRecordId) ?? failedOrWarnRecords[0];

  const draft = selectedRecord
    ? buildAiReviewFixIssueDraft({
        sourceReviewId: selectedRecord.id,
        target: selectedRecord.target as AiReviewTarget,
        summary: selectedRecord.summary,
        blockers: selectedRecord.blockers,
        suggestions: selectedRecord.suggestions,
        status: selectedRecord.status,
      })
    : null;

  function handleSaveDraft() {
    if (!draft) return;
    const updated = [...savedDrafts.filter((d) => d.sourceReviewId !== draft.sourceReviewId), draft];
    saveAiReviewFixIssueDrafts(updated);
    setSavedDrafts(updated);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleCopy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(formatAiReviewFixIssueDraftMarkdown(draft));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  async function handleCopyAgent() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.cloudAgentInstruction);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase21Panel">
      <div className="phase21Hero">
        <FileEdit />
        <div>
          <p className="eyebrow">Phase 21.5</p>
          <h3>AIレビュー → 修正Issue下書き</h3>
          <p>AIレビュー結果から修正Issueの下書きを作成します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ GitHub Issue自動作成なし</strong>
        <p>Issueの作成はGitHubで手動実行してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>修正対象のレビュー記録を選択</legend>
          {failedOrWarnRecords.length === 0 ? (
            <div className="phaseInfoBox"><p>failed / warn のレビュー記録がありません。AIレビュー結果記録パネルで記録を追加してください。</p></div>
          ) : (
            <label>
              レビュー記録
              <select value={selectedRecordId} onChange={(e) => setSelectedRecordId(e.target.value)}>
                {failedOrWarnRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.status}] {r.target} — {r.summary.slice(0, 40) || '（サマリーなし）'}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
            <RefreshCcw size={14} /> 記録を再読み込み
          </button>
        </fieldset>
      </div>

      {draft && (
        <>
          <div className="phaseInfoBox">
            <strong>Issue タイトル</strong>
            <p style={{ fontWeight: 700 }}>{draft.issueTitle}</p>
          </div>

          <div className="phaseInfoBox">
            <strong>severity: {draft.severity}</strong>
            <p>推奨フェーズ: {draft.suggestedPhase}</p>
          </div>

          <div className="phaseInfoBox">
            <strong>完了条件</strong>
            <ul>{draft.doneConditions.map((c, i) => <li key={i}>☐ {c}</li>)}</ul>
          </div>

          <div className="phaseInfoBox">
            <strong>Issue 本文プレビュー</strong>
            <pre className="phase19CodeBox" style={{ maxHeight: '200px', overflow: 'auto' }}>{draft.issueBody}</pre>
          </div>
        </>
      )}

      <div className="phaseInfoBox">
        <strong>保存済み修正Issue下書き ({savedDrafts.length}件)</strong>
        {savedDrafts.length > 0 ? (
          <ul>{savedDrafts.map((d, i) => <li key={i}>[{d.severity}] {d.issueTitle}</li>)}</ul>
        ) : (
          <p>なし</p>
        )}
      </div>

      <div className="phaseControls">
        {draft && (
          <>
            <button type="button" onClick={handleSaveDraft} className={saveMsg ? 'phaseSavedBtn' : ''}>
              {saveMsg ? <Check size={16} /> : null}
              {saveMsg || '下書きを保存'}
            </button>
            <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
              {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
              Issue下書きコピー
            </button>
            <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopyAgent}>
              {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
              Agent指示コピー
            </button>
          </>
        )}
      </div>
    </div>
  );
}
