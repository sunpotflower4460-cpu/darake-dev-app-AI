import { useState } from 'react';
import { Check, Copy, Camera } from 'lucide-react';
import {
  buildScreenshotAiReviewPrompt,
  formatScreenshotAiReviewPromptMarkdown,
} from '../utils/screenshotAiReviewPromptBuilder';

type CopyState = 'idle' | 'copied' | 'failed';

export function ScreenshotAiReviewPromptBuilderPanel() {
  const [description, setDescription] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const prompt = buildScreenshotAiReviewPrompt(description);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatScreenshotAiReviewPromptMarkdown(prompt));
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
        <Camera />
        <div>
          <p className="eyebrow">Phase 21.3</p>
          <h3>スクリーンショット AIレビュー プロンプトビルダー</h3>
          <p>スクリーンショットをAIでレビューするためのプロンプトを生成します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部AI API自動呼び出しなし・画像自動送信なし</strong>
        <p>プロンプトをコピーして外部AIに手動で渡してください。スクリーンショットも手動で添付してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>スクリーンショット情報</legend>
          <label>
            スクリーンショットの概要
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: ホーム画面（iOS 375px幅）のスクリーンショット。メインCTAボタンと商品リストが表示されている。"
            />
          </label>
        </fieldset>
      </div>

      <div className="phaseInfoBox">
        <strong>チェックポイント ({prompt.checkpoints.length}件)</strong>
        <ol>{prompt.checkpoints.map((c, i) => <li key={i}>{c}</li>)}</ol>
      </div>

      <div className="phaseWarningsBox">
        <strong>注意事項</strong>
        <ul>{prompt.warnings.map((w, i) => <li key={i}>⚠️ {w}</li>)}</ul>
      </div>

      <div className="phaseInfoBox">
        <strong>生成プロンプト（コピー用）</strong>
        <pre className="phase19CodeBox" style={{ maxHeight: '300px', overflow: 'auto' }}>{prompt.promptText}</pre>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'プロンプトコピー'}
        </button>
      </div>
    </div>
  );
}
