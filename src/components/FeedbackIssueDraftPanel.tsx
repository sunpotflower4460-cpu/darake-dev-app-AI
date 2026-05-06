import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, GitBranch } from 'lucide-react';
import { loadFeedbacks } from '../utils/postReleaseFeedbackRecord';
import { generateFeedbackIssueDraft } from '../utils/feedbackIssueDraft';

type CopyTarget = 'issue' | 'agent' | null;

export function FeedbackIssueDraftPanel() {
  const [feedbacks, setFeedbacks] = useState(loadFeedbacks());
  const [selectedId, setSelectedId] = useState<string>('');
  const [copyTarget, setCopyTarget] = useState<CopyTarget>(null);

  useEffect(() => {
    setFeedbacks(loadFeedbacks());
  }, []);

  const selected = feedbacks.find((f) => f.id === selectedId);
  const draft = useMemo(() => (selected ? generateFeedbackIssueDraft(selected) : null), [selected]);

  async function handleCopy(text: string, target: CopyTarget) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyTarget(target);
      window.setTimeout(() => setCopyTarget(null), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="phase15Panel">
      <div className="phase15Hero">
        <GitBranch />
        <div>
          <p className="eyebrow">Phase 15.4</p>
          <h3>フィードバック → GitHub Issue下書き</h3>
          <p>GitHub Issueは自動作成しません。コピーして手動で作成してください。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⚠️ GitHub Issue自動作成なし</strong>
        <p>コピーのみ対応です。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>フィードバックを選ぶ</legend>
          {feedbacks.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>フィードバックがありません。Phase 15.3で登録してください。</p>
          ) : (
            <label>
              フィードバック
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                <option value="">（選択してください）</option>
                {feedbacks.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.priority}] {f.title || '（タイトルなし）'}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>
      </div>

      {draft && (
        <>
          <div className="phaseInfoBox">
            <strong>Issue タイトル</strong>
            <p style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{draft.issueTitle}</p>
          </div>

          <div className="phaseInfoBox">
            <strong>severity: {draft.severity}</strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{draft.manualGate}</p>
          </div>

          <div>
            <strong style={{ fontSize: '0.88rem', color: '#35513d', display: 'block', marginBottom: '8px' }}>Issue本文</strong>
            <div className="phaseCodeBox">{draft.issueBody}</div>
          </div>

          <div>
            <strong style={{ fontSize: '0.88rem', color: '#35513d', display: 'block', marginBottom: '8px' }}>Cloud Agent指示書</strong>
            <div className="phaseCodeBox">{draft.cloudAgentInstruction}</div>
          </div>

          <div className="phaseControls">
            <button
              type="button"
              className={`phaseCopyBtn copy-${copyTarget === 'issue' ? 'copied' : 'idle'}`}
              onClick={() => handleCopy(`${draft.issueTitle}\n\n${draft.issueBody}`, 'issue')}
            >
              {copyTarget === 'issue' ? <Check size={16} /> : <Copy size={16} />}
              Issue本文コピー
            </button>
            <button
              type="button"
              className={`phaseCopyBtn copy-${copyTarget === 'agent' ? 'copied' : 'idle'}`}
              onClick={() => handleCopy(draft.cloudAgentInstruction, 'agent')}
            >
              {copyTarget === 'agent' ? <Check size={16} /> : <Copy size={16} />}
              Agent指示書コピー
            </button>
          </div>
        </>
      )}
    </div>
  );
}
