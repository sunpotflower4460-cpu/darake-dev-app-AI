import { useState } from 'react';
import { Check, Copy, Brain } from 'lucide-react';
import {
  AiReviewTarget,
  buildAiReviewInputPack,
} from '../utils/aiReviewInputPack';

type CopyState = 'idle' | 'copied' | 'failed';

const TARGETS: { value: AiReviewTarget; label: string }[] = [
  { value: 'screenshot-ui', label: 'スクリーンショット UIレビュー' },
  { value: 'pull-request', label: 'Pull Request レビュー' },
  { value: 'store-copy', label: 'ストア文面 レビュー' },
  { value: 'submission-risk', label: '審査リスク レビュー' },
  { value: 'release-note', label: 'リリースノート レビュー' },
  { value: 'rejection-response', label: '拒否対応文 レビュー' },
];

export function AiReviewInputPackPanel() {
  const [target, setTarget] = useState<AiReviewTarget>('screenshot-ui');
  const [context, setContext] = useState('');
  const [copyMdState, setCopyMdState] = useState<CopyState>('idle');
  const [copyFormatState, setCopyFormatState] = useState<CopyState>('idle');

  const pack = buildAiReviewInputPack(target, context);

  async function handleCopyMd() {
    try {
      await navigator.clipboard.writeText(pack.markdown);
      setCopyMdState('copied');
      window.setTimeout(() => setCopyMdState('idle'), 1800);
    } catch {
      setCopyMdState('failed');
      window.setTimeout(() => setCopyMdState('idle'), 2400);
    }
  }

  async function handleCopyFormat() {
    try {
      await navigator.clipboard.writeText(pack.expectedOutputFormat);
      setCopyFormatState('copied');
      window.setTimeout(() => setCopyFormatState('idle'), 1800);
    } catch {
      setCopyFormatState('failed');
      window.setTimeout(() => setCopyFormatState('idle'), 2400);
    }
  }

  return (
    <div className="phase21Panel">
      <div className="phase21Hero">
        <Brain />
        <div>
          <p className="eyebrow">Phase 21.1-21.2</p>
          <h3>AIレビュー 入力パック</h3>
          <p>AIレビュー用のプロンプトを作ります。外部AIへの自動送信はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部AI API自動呼び出しなし・画像自動送信なし・artifact自動取得なし</strong>
        <p>プロンプトをコピーして外部AIに手動で渡してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>レビュー設定</legend>
          <label>
            レビュー対象
            <select value={target} onChange={(e) => setTarget(e.target.value as AiReviewTarget)}>
              {TARGETS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label>
            コンテキスト（レビューに渡す情報）
            <textarea
              rows={5}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="レビュー対象の概要・URL・変更内容などを入力してください（secret/token/個人情報は含めないこと）"
            />
          </label>
        </fieldset>
      </div>

      <div className="phaseInfoBox">
        <strong>レビュー観点 ({pack.reviewQuestions.length}件)</strong>
        <ol>{pack.reviewQuestions.map((q, i) => <li key={i}>{q}</li>)}</ol>
      </div>

      {pack.hardStops.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>ハードストップ</strong>
          <ul>{pack.hardStops.map((s, i) => <li key={i}>⛔ {s}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>期待する出力形式</strong>
        <p>{pack.expectedOutputFormat}</p>
      </div>

      <div className="phaseInfoBox">
        <strong>生成プロンプト（Markdownコピー用）</strong>
        <pre className="phase19CodeBox" style={{ maxHeight: '200px', overflow: 'auto' }}>{pack.markdown}</pre>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyMdState}`} onClick={handleCopyMd}>
          {copyMdState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          プロンプトコピー
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyFormatState}`} onClick={handleCopyFormat}>
          {copyFormatState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          出力形式コピー
        </button>
      </div>
    </div>
  );
}
