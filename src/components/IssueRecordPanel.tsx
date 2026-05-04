import { useMemo, useState } from 'react';
import { Check, ExternalLink, FileCheck2, RotateCcw, Save } from 'lucide-react';
import { clearIssueRecord, loadIssueRecord, saveIssueRecord, type IssueRecord, type IssueRecordStatus } from '../utils/issueRecordStore';
import { getIssueNextStep } from '../utils/issueNextStep';

const statusOptions: Array<{ value: IssueRecordStatus; label: string }> = [
  { value: 'drafted', label: '下書き中' },
  { value: 'submitted', label: '投稿済み' },
  { value: 'linked-to-phase', label: 'Phaseに接続済み' },
  { value: 'needs-followup', label: '後で確認' },
];

export function IssueRecordPanel() {
  const [record, setRecord] = useState<IssueRecord>(() => loadIssueRecord());
  const [saved, setSaved] = useState(false);
  const nextStep = useMemo(() => getIssueNextStep(record), [record]);

  function updateRecord(next: Partial<IssueRecord>) {
    setRecord((current) => ({ ...current, ...next }));
    setSaved(false);
  }

  function handleSave() {
    setRecord(saveIssueRecord(record));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function handleClear() {
    setRecord(clearIssueRecord());
    setSaved(false);
  }

  return (
    <div className="issueRecordPanel">
      <div className="issueRecordHero">
        <FileCheck2 />
        <div>
          <p className="eyebrow">Phase 7.6</p>
          <h3>作成後の記録欄</h3>
          <p>GitHubでIssueを作ったあと、番号やURL、関連Phaseをここに控えておきます。</p>
        </div>
      </div>

      <div className="issueNextCard">
        <div>
          <strong>{nextStep.title}</strong>
          <p>{nextStep.message}</p>
        </div>
        {nextStep.hasLink && nextStep.url && (
          <a href={nextStep.url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Issueを開く</a>
        )}
      </div>

      <div className="issueRecordSummary">
        <span>Issue: {record.number || '未記録'}</span>
        <span>Phase: {record.phase || '未接続'}</span>
        <span>状態: {statusOptions.find((item) => item.value === record.status)?.label ?? '未設定'}</span>
      </div>

      <div className="issueRecordGrid">
        <label>
          Issue番号
          <input value={record.number} placeholder="#18 など" onChange={(event) => updateRecord({ number: event.target.value })} />
        </label>
        <label>
          Issue URL
          <input value={record.url} placeholder="https://github.com/..." onChange={(event) => updateRecord({ url: event.target.value })} />
        </label>
        <label>
          関連Phase
          <input value={record.phase} placeholder="Phase 8.0 など" onChange={(event) => updateRecord({ phase: event.target.value })} />
        </label>
        <label>
          状態
          <select value={record.status} onChange={(event) => updateRecord({ status: event.target.value as IssueRecordStatus })}>
            {statusOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="recordNoteField">
          メモ
          <textarea rows={3} value={record.note} placeholder="次に見ること、任せたことなど" onChange={(event) => updateRecord({ note: event.target.value })} />
        </label>
      </div>

      <div className="issueRecordActions">
        <button type="button" onClick={handleSave}>{saved ? <Check size={16} /> : <Save size={16} />} {saved ? '保存しました' : '記録を保存'}</button>
        <button type="button" className="secondaryRecordButton" onClick={handleClear}><RotateCcw size={16} /> 空にする</button>
        {record.savedAt && <span>保存時刻: {record.savedAt}</span>}
      </div>
    </div>
  );
}
