import { useEffect, useState } from 'react';
import { Check, Copy, FileX, Save } from 'lucide-react';
import type { AppReviewRejectionRecord } from '../utils/appReviewRejectionRecord';
import {
  buildInitialAppReviewRejectionRecord,
  clearAppReviewRejectionRecord,
  formatAppReviewRejectionRecord,
  loadAppReviewRejectionRecord,
  saveAppReviewRejectionRecord,
} from '../utils/appReviewRejectionRecord';

export function AppReviewRejectionRecordPanel() {
  const [record, setRecord] = useState<AppReviewRejectionRecord>(buildInitialAppReviewRejectionRecord);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    setRecord(loadAppReviewRejectionRecord());
  }, []);

  function handleChange<K extends keyof AppReviewRejectionRecord>(key: K, value: AppReviewRejectionRecord[K]) {
    setRecord((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveAppReviewRejectionRecord(record);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    if (!window.confirm('リジェクト記録を初期化しますか？')) return;
    clearAppReviewRejectionRecord();
    setRecord(buildInitialAppReviewRejectionRecord());
    setSaved(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAppReviewRejectionRecord(record));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="rejectionRecordPanel">
      <div className="rejectionRecordHero">
        <FileX />
        <div>
          <p className="eyebrow">Phase 14.1</p>
          <h3>App Review リジェクト記録</h3>
          <p>リジェクト内容を記録し、Markdownでコピーできます。Appleへの自動返信はしません。</p>
        </div>
      </div>

      <div className="rejectionRecordSafetyBox">
        <strong>自動返信なし・APIなし</strong>
        <p>リジェクト内容の記録のみです。Appleへの返信は人間が行います。</p>
      </div>

      <div className="rejectionRecordForm">
        <label>リジェクト日<input type="date" value={record.rejectionDate} onChange={(e) => handleChange('rejectionDate', e.target.value)} /></label>
        <label>アプリバージョン<input value={record.appVersion} onChange={(e) => handleChange('appVersion', e.target.value)} placeholder="例: 1.0.1" /></label>
        <label>ガイドライン番号<input value={record.guidelineNumber} onChange={(e) => handleChange('guidelineNumber', e.target.value)} placeholder="例: 4.3, 2.1" /></label>
        <label>対象機能<input value={record.affectedFeature} onChange={(e) => handleChange('affectedFeature', e.target.value)} /></label>
        <label>
          Severity
          <select value={record.severity} onChange={(e) => handleChange('severity', e.target.value as AppReviewRejectionRecord['severity'])}>
            <option value="unknown">unknown</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>
        <label>
          対応状況
          <select value={record.responseStatus} onChange={(e) => handleChange('responseStatus', e.target.value as AppReviewRejectionRecord['responseStatus'])}>
            <option value="pending">pending（未対応）</option>
            <option value="in-progress">in-progress（対応中）</option>
            <option value="resolved">resolved（解決済み）</option>
            <option value="appealed">appealed（異議申し立て中）</option>
          </select>
        </label>
        <label>Appleのメッセージ（貼り付け）<textarea rows={6} value={record.appleMessage} onChange={(e) => handleChange('appleMessage', e.target.value)} /></label>
        <label>添付・スクショメモ<textarea rows={3} value={record.attachmentNotes} onChange={(e) => handleChange('attachmentNotes', e.target.value)} /></label>
        <label>次のアクション<input value={record.nextAction} onChange={(e) => handleChange('nextAction', e.target.value)} /></label>
      </div>

      <div className="rejectionRecordControls">
        <button type="button" onClick={handleSave} className={saved ? 'rejectionRecordSaved' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : '保存'}
        </button>
        <button type="button" onClick={handleClear}>初期化</button>
        <button type="button" className={`rejectionRecordCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
