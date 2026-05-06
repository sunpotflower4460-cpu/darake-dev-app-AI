import { useState } from 'react';
import { Check, Copy, ClipboardList, Trash2 } from 'lucide-react';
import {
  AiReviewResultRecord,
  buildInitialAiReviewResultRecord,
  loadAiReviewResultRecords,
  saveAiReviewResultRecords,
  formatAiReviewResultRecordMarkdown,
  getStatusLabel,
  addAiReviewResultRecord,
  deleteAiReviewResultRecord,
} from '../utils/aiReviewResultRecord';
import { AiReviewTarget } from '../utils/aiReviewInputPack';

type CopyState = { [id: string]: 'idle' | 'copied' | 'failed' };

const TARGETS: AiReviewTarget[] = [
  'screenshot-ui', 'pull-request', 'store-copy', 'submission-risk', 'release-note', 'rejection-response',
];

export function AiReviewResultRecordPanel() {
  const [records, setRecords] = useState<AiReviewResultRecord[]>(loadAiReviewResultRecords);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [saveMsg, setSaveMsg] = useState('');

  function handleChange<K extends keyof AiReviewResultRecord>(
    id: string,
    key: K,
    value: AiReviewResultRecord[K],
  ) {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  function handleAddRecord() {
    const newRecord = buildInitialAiReviewResultRecord();
    setRecords((prev) => addAiReviewResultRecord(prev, newRecord));
  }

  function handleDelete(id: string) {
    setRecords((prev) => deleteAiReviewResultRecord(prev, id));
  }

  function handleSave() {
    saveAiReviewResultRecords(records);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleCopy(record: AiReviewResultRecord) {
    try {
      await navigator.clipboard.writeText(formatAiReviewResultRecordMarkdown(record));
      setCopyStates((prev) => ({ ...prev, [record.id]: 'copied' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [record.id]: 'idle' })), 1800);
    } catch {
      setCopyStates((prev) => ({ ...prev, [record.id]: 'failed' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [record.id]: 'idle' })), 2400);
    }
  }

  function handleListChange(id: string, key: 'findings' | 'blockers' | 'suggestions', raw: string) {
    const value = raw.split('\n').filter((s) => s.trim());
    handleChange(id, key, value);
  }

  return (
    <div className="phase21Panel">
      <div className="phase21Hero">
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 21.4</p>
          <h3>AIレビュー結果 記録</h3>
          <p>AIレビューの結果を記録します。外部AIへの自動送信はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部AI API自動呼び出しなし</strong>
        <p>AIレビュー結果を手動でコピーしてここに貼り付けて記録してください。</p>
      </div>

      <div className="phase21RecordList">
        {records.length === 0 && (
          <div className="phaseInfoBox"><p>記録がありません。「+ 記録を追加」から追加してください。</p></div>
        )}
        {records.map((r) => (
          <div key={r.id} className="phase21RecordItem">
            <div className="phase21RecordHeader">
              <span className={`phaseStatusBadge phaseStatusBadge-${r.status === 'passed' ? 'ok' : r.status === 'failed' ? 'blocked' : r.status === 'warn' ? 'warning' : 'draft'}`}>
                {getStatusLabel(r.status)}
              </span>
              <span className="phase21TargetBadge">{r.target}</span>
              <button type="button" className="phase19DeleteBtn" onClick={() => handleDelete(r.id)} aria-label="削除">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="phaseForm">
              <label>
                対象
                <select value={r.target} onChange={(e) => handleChange(r.id, 'target', e.target.value as AiReviewTarget)}>
                  {TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>
                ステータス
                <select value={r.status} onChange={(e) => handleChange(r.id, 'status', e.target.value as AiReviewResultRecord['status'])}>
                  <option value="unchecked">⬜ 未確認</option>
                  <option value="passed">✅ 通過</option>
                  <option value="warn">⚠️ 警告</option>
                  <option value="failed">❌ 失敗</option>
                </select>
              </label>
              <label>
                レビュアー
                <select value={r.reviewer} onChange={(e) => handleChange(r.id, 'reviewer', e.target.value as AiReviewResultRecord['reviewer'])}>
                  <option value="manual-ai">手動AI（コピペ）</option>
                  <option value="external-ai">外部AI</option>
                  <option value="human">人間レビュー</option>
                </select>
              </label>
              <label>
                サマリー（AIの回答をここに貼る）
                <textarea rows={3} value={r.summary} onChange={(e) => handleChange(r.id, 'summary', e.target.value)} placeholder="AIレビューのサマリーを貼り付けてください" />
              </label>
              <label>
                Findings（1行1件）
                <textarea rows={3} value={r.findings.join('\n')} onChange={(e) => handleListChange(r.id, 'findings', e.target.value)} placeholder="発見事項を1行ずつ入力" />
              </label>
              <label>
                Blockers（1行1件）
                <textarea rows={2} value={r.blockers.join('\n')} onChange={(e) => handleListChange(r.id, 'blockers', e.target.value)} placeholder="ブロッカーを1行ずつ入力" />
              </label>
              <label>
                Suggestions（1行1件）
                <textarea rows={2} value={r.suggestions.join('\n')} onChange={(e) => handleListChange(r.id, 'suggestions', e.target.value)} placeholder="改善提案を1行ずつ入力" />
              </label>
            </div>
            <div className="phase20CandidateActions">
              <button
                type="button"
                className={`phaseCopyBtn copy-${copyStates[r.id] ?? 'idle'}`}
                onClick={() => handleCopy(r)}
              >
                {copyStates[r.id] === 'copied' ? <Check size={16} /> : <Copy size={16} />}
                コピー
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleAddRecord}>+ 記録を追加</button>
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '保存'}
        </button>
      </div>
    </div>
  );
}
