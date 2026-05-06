import { useState } from 'react';
import { Check, Copy, MessageSquare } from 'lucide-react';
import {
  APP_REVIEW_RESPONSE_TEMPLATES,
  getAppReviewResponseTemplate,
} from '../utils/appReviewResponseDraft';
import { loadAppReviewRejectionRecord } from '../utils/appReviewRejectionRecord';
import {
  classifyRejection,
  REJECTION_CATEGORY_LABELS,
} from '../utils/appReviewRejectionClassifier';

export function AppReviewResponseDraftPanel() {
  const [selectedId, setSelectedId] = useState<string>(APP_REVIEW_RESPONSE_TEMPLATES[0].id);
  const [customBody, setCustomBody] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [showClassification, setShowClassification] = useState(false);

  const selected = getAppReviewResponseTemplate(selectedId);
  const record = loadAppReviewRejectionRecord();
  const classification = classifyRejection(record.appleMessage, record.guidelineNumber);

  const bodyText = customBody || (selected?.bodyTemplate ?? '');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bodyText);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  function handleSelectTemplate(id: string) {
    setSelectedId(id);
    setCustomBody('');
    setCopyState('idle');
  }

  return (
    <div className="rejectionResponsePanel">
      <div className="rejectionResponseHero">
        <MessageSquare />
        <div>
          <p className="eyebrow">Phase 14.3</p>
          <h3>Appleへの返信文下書き</h3>
          <p>テンプレートから返信文を生成し、コピーできます。Appleへの自動送信はしません。</p>
        </div>
      </div>

      <div className="rejectionResponseSafetyBox">
        <strong>自動送信なし</strong>
        <p>返信文の下書きとコピーのみです。Appleへの送信はApp Store Connect上で人間が行います。</p>
      </div>

      <button
        type="button"
        className="rejectionResponseClassifyButton"
        onClick={() => setShowClassification((v) => !v)}
      >
        {showClassification ? '推定分類を隠す' : '推定分類を見る（Phase 14.2）'}
      </button>

      {showClassification && (
        <div className={`rejectionResponseClassification rejectionClassification-${classification.severity}`}>
          <strong>推定分類（自動断定ではありません）</strong>
          <p>カテゴリ: {REJECTION_CATEGORY_LABELS[classification.category]}</p>
          <p>Severity: {classification.severity}</p>
          <p>修正タイプ: {classification.likelyFixType}</p>
          <ul>
            {classification.suggestedActions.map((a) => <li key={a}>{a}</li>)}
          </ul>
          {classification.manualGateRequired && (
            <p className="rejectionClassificationManualGate">🔒 manual gate必須：高severity案件です。人間が確認してください。</p>
          )}
        </div>
      )}

      <div className="rejectionResponseSelector">
        <label htmlFor="rejectionResponseSelect">テンプレートを選ぶ：</label>
        <select
          id="rejectionResponseSelect"
          value={selectedId}
          onChange={(e) => handleSelectTemplate(e.target.value)}
        >
          {APP_REVIEW_RESPONSE_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="rejectionResponseEditor">
        <label htmlFor="rejectionResponseBody">返信文（編集可能）：</label>
        <textarea
          id="rejectionResponseBody"
          rows={12}
          value={customBody || (selected?.bodyTemplate ?? '')}
          onChange={(e) => setCustomBody(e.target.value)}
        />
      </div>

      <div className="rejectionResponseControls">
        <button type="button" className={`rejectionResponseCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '返信文をコピー'}
        </button>
        <p className="rejectionResponseNote">※ コピーした文面をApp Store Connect上で人間が送信してください。</p>
      </div>
    </div>
  );
}
