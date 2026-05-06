import { useState } from 'react';
import { ClipboardList, Trash2, Copy, Check } from 'lucide-react';
import {
  loadOneActionDecisionRecords,
  saveOneActionDecisionRecords,
  clearOneActionDecisionRecords,
  summarizeOneActionDecisionRecords,
  updateOneActionDecisionRecord,
} from '../utils/oneActionDecisionRecord';
import type { OneActionDecisionRecord } from '../utils/oneActionDecisionRecord';

type CopyState = 'idle' | 'copied' | 'failed';

export function OneActionDecisionRecordPanel() {
  const [records, setRecords] = useState(() => loadOneActionDecisionRecords());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [activeTab, setActiveTab] = useState<'all' | 'ok' | 'later' | 'stop' | 'followup'>('all');

  function save(updated: OneActionDecisionRecord[]) {
    saveOneActionDecisionRecords(updated);
    setRecords(updated);
  }

  function handleClear() {
    save(clearOneActionDecisionRecords());
  }

  function handleNotesChange(id: string, notes: string) {
    save(updateOneActionDecisionRecord(records, id, { notes }));
  }

  function handleFollowUpChange(id: string, followUpNeeded: boolean) {
    save(updateOneActionDecisionRecord(records, id, { followUpNeeded }));
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const summary = summarizeOneActionDecisionRecords(records);

  const filtered = records.filter((r) => {
    if (activeTab === 'ok') return r.decision === 'ok';
    if (activeTab === 'later') return r.decision === 'later';
    if (activeTab === 'stop') return r.decision === 'stop';
    if (activeTab === 'followup') return r.followUpNeeded;
    return true;
  });

  function decisionIcon(d: string) {
    if (d === 'ok') return '✅';
    if (d === 'later') return '⏳';
    if (d === 'stop') return '🚫';
    return '❓';
  }

  function formatMarkdown() {
    const lines = ['# One Action Decision Records', ''];
    records.forEach((r) => {
      lines.push(`## ${decisionIcon(r.decision)} ${r.candidateId}`);
      lines.push(`- decision: ${r.decision}`);
      lines.push(`- decidedAt: ${r.decidedAt}`);
      if (r.reason) lines.push(`- reason: ${r.reason}`);
      if (r.followUpNeeded) lines.push(`- ⚠️ followUpNeeded`);
      if (r.notes) lines.push(`- notes: ${r.notes}`);
      lines.push('');
    });
    return lines.join('\n');
  }

  return (
    <div className="phase30Panel">
      <div className="phase30Hero">
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 30.3</p>
          <h3>One Action Decision Record</h3>
          <p>OK / Stop / Later の判断記録です。外部送信しません。</p>
        </div>
      </div>

      <div className="phase30SummaryGrid">
        <section><h4>合計</h4><p>{summary.total}</p></section>
        <section><h4>OK</h4><p>{summary.ok}</p></section>
        <section><h4>あとで</h4><p>{summary.later}</p></section>
        <section><h4>止め</h4><p>{summary.stop}</p></section>
        <section><h4>要確認</h4><p>{summary.followUpNeeded}</p></section>
      </div>

      <div className="phase30BtnRow">
        {(['all', 'ok', 'later', 'stop', 'followup'] as const).map((tab) => (
          <button
            key={tab}
            className={`phase30SmallBtn ${activeTab === tab ? 'copied' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? '全て' : tab === 'followup' ? '要確認' : tab}
          </button>
        ))}
        {records.length > 0 && (
          <>
            <button className={`phase30SmallBtn ${copyState}`} onClick={() => void handleCopy(formatMarkdown())}>
              {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} MDコピー
            </button>
            <button className="phase30SmallBtn" onClick={handleClear} style={{ color: '#992020' }}>
              <Trash2 size={13} /> 全削除
            </button>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="phase30Section">
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>記録がありません。</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {filtered.map((r) => (
            <div key={r.id} className="phase30RecordCard">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem' }}>{decisionIcon(r.decision)}</span>
                <strong style={{ flex: 1, fontSize: '0.84rem' }}>{r.candidateId.length > 24 ? r.candidateId.slice(0, 24) + '…' : r.candidateId}</strong>
                <span style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>
                  {r.decidedAt.slice(0, 16).replace('T', ' ')}
                </span>
                {r.followUpNeeded && (
                  <span className="phase30StatusBadge needs-review">要確認</span>
                )}
              </div>
              {r.reason && (
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>理由: {r.reason}</p>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={r.followUpNeeded}
                    onChange={(e) => handleFollowUpChange(r.id, e.target.checked)}
                  />
                  フォローアップ必要
                </label>
              </div>
              <input
                className="phase30Input"
                placeholder="notes"
                value={r.notes}
                style={{ fontSize: '0.78rem' }}
                onChange={(e) => handleNotesChange(r.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
