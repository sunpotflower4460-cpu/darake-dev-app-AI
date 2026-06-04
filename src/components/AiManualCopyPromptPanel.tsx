import { useMemo, useState } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { AI_EXECUTION_CANDIDATE_DRAFTS } from '../utils/aiExecutionCandidateDraft';
import { buildAiManualCopyPrompt } from '../utils/aiManualCopyPrompt';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiManualCopyPromptPanel() {
  const defaultDraft = AI_EXECUTION_CANDIDATE_DRAFTS.find((draft) => draft.provider === 'manual-ai')
    ?? AI_EXECUTION_CANDIDATE_DRAFTS.find((draft) => draft.status === 'draft-only' && draft.requiredSecrets.length === 0)
    ?? AI_EXECUTION_CANDIDATE_DRAFTS[0];

  if (!defaultDraft) {
    return (
      <div className="phase24Panel">
        <div className="phaseSafetyBox">
          <strong>AI実行候補が未定義のため、手動コピー用プロンプトを生成できません。</strong>
        </div>
      </div>
    );
  }
  const [selectedTitle, setSelectedTitle] = useState(defaultDraft.title);
  const [purpose, setPurpose] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [confirmNoSecrets, setConfirmNoSecrets] = useState(false);
  const [confirmHumanReview, setConfirmHumanReview] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const selectedDraft = useMemo(
    () => AI_EXECUTION_CANDIDATE_DRAFTS.find((draft) => draft.title === selectedTitle) ?? defaultDraft,
    [defaultDraft, selectedTitle],
  );

  const prompt = useMemo(
    () => buildAiManualCopyPrompt({ draft: selectedDraft, purpose, additionalContext }),
    [additionalContext, purpose, selectedDraft],
  );

  const canCopy = confirmNoSecrets && confirmHumanReview;

  async function handleCopy() {
    if (!canCopy) {
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }
  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <ShieldCheck />
        <div>
          <p className="eyebrow">Phase 25.8</p>
          <h3>AI Manual Copy Prompt</h3>
          <p>候補選択 → 文面生成 → 人間確認 → コピー までを安全に行います。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>この導線は外部AI APIを呼びません。API key入力欄も作りません。</strong>
      </div>

      <section className="aiManualCopySection">
        <label className="aiManualCopyField">
          <span>実行候補を選択</span>
          <select value={selectedTitle} onChange={(event) => setSelectedTitle(event.target.value)}>
            {AI_EXECUTION_CANDIDATE_DRAFTS.map((draft) => (
              <option key={draft.title} value={draft.title}>{draft.title}</option>
            ))}
          </select>
        </label>

        <label className="aiManualCopyField">
          <span>このIssue / PR / 設計の目的</span>
          <textarea
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            rows={3}
            placeholder="例: 手動コピー導線を作り、API送信せず安全にレビューを受けたい"
          />
        </label>

        <label className="aiManualCopyField">
          <span>追加コンテキスト（任意）</span>
          <textarea
            value={additionalContext}
            onChange={(event) => setAdditionalContext(event.target.value)}
            rows={2}
            placeholder="必要なら制約や補足を記入"
          />
        </label>
      </section>

      <section className="aiManualCopySection">
        <h4>コピーする前の確認</h4>
        <label className="aiManualCopyCheck">
          <input type="checkbox" checked={confirmNoSecrets} onChange={(event) => setConfirmNoSecrets(event.target.checked)} />
          API key / token / secret / private情報を貼っていないことを確認した
        </label>
        <label className="aiManualCopyCheck">
          <input type="checkbox" checked={confirmHumanReview} onChange={(event) => setConfirmHumanReview(event.target.checked)} />
          AI回答を自動採用せず、人間が確認することを理解した
        </label>
      </section>

      <section className="aiManualCopySection">
        <h4>外部AIに貼り付ける文面</h4>
        <textarea className="aiManualCopyPrompt" value={prompt} readOnly rows={20} />
      </section>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy} disabled={!canCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '確認後にコピー'}
        </button>
      </div>
    </div>
  );
}
