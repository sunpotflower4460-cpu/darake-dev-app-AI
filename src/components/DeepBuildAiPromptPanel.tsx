import { useMemo, useState } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import {
  judgeDeepBuildCompletion,
  markCompletionCandidates,
  syncCurrentDeepBuildPhase,
} from '../utils/deepBuildCompletionJudge';
import { loadCurrentWorkSession } from '../utils/darakeWorkSession';
import { loadDeepBuildPlan } from '../utils/deepBuildPlanStorage';
import { loadPrCiLastStatus } from '../utils/prCiStatusClient';
import { buildDeepBuildAiPrompt } from '../utils/deepBuildAiPrompt';

type CopyState = 'idle' | 'copied' | 'failed';

export function DeepBuildAiPromptPanel() {
  const [confirmNoSecrets, setConfirmNoSecrets] = useState(false);
  const [confirmHumanReview, setConfirmHumanReview] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const plan = useMemo(() => {
    const loaded = loadDeepBuildPlan();
    if (!loaded) return null;
    return markCompletionCandidates(
      syncCurrentDeepBuildPhase(loaded, loadCurrentWorkSession(), loadPrCiLastStatus()),
    );
  }, []);

  const judgement = useMemo(() => (plan ? judgeDeepBuildCompletion(plan) : null), [plan]);

  const promptResult = useMemo(() => {
    if (!plan || !judgement) return null;
    return buildDeepBuildAiPrompt({ plan, judgement });
  }, [plan, judgement]);

  const canCopy = confirmNoSecrets && confirmHumanReview;

  async function handleCopy() {
    if (!canCopy || !promptResult) return;
    try {
      await navigator.clipboard.writeText(promptResult.prompt);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  if (!plan || !judgement || !promptResult) {
    return (
      <div className="aiManualCopyPanel">
        <div className="aiManualCopyHero">
          <ShieldCheck />
          <div>
            <p className="eyebrow">Phase 90</p>
            <h3>Deep Build → AIに渡す</h3>
            <p>熟成モードの計画がまだありません。先に熟成計画を作成してください。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aiManualCopyPanel">
      <div className="aiManualCopyHero">
        <ShieldCheck />
        <div>
          <p className="eyebrow">Phase 90</p>
          <h3>Deep Build → AIに渡す</h3>
          <p>判定結果をAI用プロンプトに変換し、手動コピーで外部AIへ渡せます。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>この導線は外部AI APIを呼びません。API key入力欄も作りません。</strong>
      </div>

      <section className="aiManualCopySection">
        <h4>現在の判定結果</h4>
        <div className="aiManualCopyField">
          <span className="aiManualCopyField__label">ステータス</span>
          <strong>{judgement.title}</strong>
        </div>
        <div className="aiManualCopyField">
          <span className="aiManualCopyField__label">メッセージ</span>
          <p>{judgement.message}</p>
        </div>
        <div className="aiManualCopyField">
          <span className="aiManualCopyField__label">プロンプトの目的</span>
          <p>{promptResult.purpose}</p>
        </div>
      </section>

      <section className="aiManualCopySection">
        <h4>コピーする前の確認</h4>
        <label className="aiManualCopyCheck">
          <input
            type="checkbox"
            checked={confirmNoSecrets}
            onChange={(e) => setConfirmNoSecrets(e.target.checked)}
          />
          API key / token / secret / private情報を貼っていないことを確認した
        </label>
        <label className="aiManualCopyCheck">
          <input
            type="checkbox"
            checked={confirmHumanReview}
            onChange={(e) => setConfirmHumanReview(e.target.checked)}
          />
          AI回答を自動採用せず、人間が確認することを理解した
        </label>
      </section>

      <section className="aiManualCopySection">
        <h4>外部AIに貼り付ける文面</h4>
        <textarea className="aiManualCopyPrompt" value={promptResult.prompt} readOnly rows={20} />
      </section>

      <div className="phaseControls">
        <button
          type="button"
          className={`phaseBtn ${copyState === 'copied' ? 'phaseBtn--success' : ''} ${copyState === 'failed' ? 'phaseBtn--error' : ''}`}
          onClick={() => void handleCopy()}
          disabled={!canCopy}
        >
          {copyState === 'copied' ? (
            <>
              <Check size={16} /> コピーしました
            </>
          ) : (
            <>
              <Copy size={16} /> AIに渡す（コピー）
            </>
          )}
        </button>
        {copyState === 'failed' ? (
          <p className="aiManualCopyError">コピーに失敗しました。手動で選択してコピーしてください。</p>
        ) : null}
      </div>
    </div>
  );
}
