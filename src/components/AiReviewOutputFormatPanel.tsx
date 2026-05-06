import { useState } from 'react';
import { Check, Copy, List } from 'lucide-react';
import {
  AI_REVIEW_OUTPUT_FORMATS,
  formatAiReviewOutputFormatsMarkdown,
} from '../utils/aiReviewOutputFormats';

type CopyState = 'idle' | 'copied' | 'failed';

type CopyMap = Record<string, CopyState>;

export function AiReviewOutputFormatPanel() {
  const [copyStates, setCopyStates] = useState<CopyMap>({});
  const [copyAllState, setCopyAllState] = useState<CopyState>('idle');

  async function handleCopyOne(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStates((prev) => ({ ...prev, [id]: 'copied' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [id]: 'idle' })), 1800);
    } catch {
      setCopyStates((prev) => ({ ...prev, [id]: 'failed' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [id]: 'idle' })), 2400);
    }
  }

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(formatAiReviewOutputFormatsMarkdown(AI_REVIEW_OUTPUT_FORMATS));
      setCopyAllState('copied');
      window.setTimeout(() => setCopyAllState('idle'), 1800);
    } catch {
      setCopyAllState('failed');
      window.setTimeout(() => setCopyAllState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <List />
        <div>
          <p className="eyebrow">Phase 25.4</p>
          <h3>AI Review Output Format Templates</h3>
          <p>AIから返してほしい形式を固定し、結果を戻しやすくします。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ AI結果もそのまま自動実行しない / 人間が読んでから戻す</strong>
      </div>

      <div className="phase25Grid">
        {AI_REVIEW_OUTPUT_FORMATS.map((format) => (
          <section key={format.id} className="phase25Card">
            <div className="phase25CardHeader">
              <div>
                <h4>{format.label}</h4>
                <p className="phase25Muted">taskTypes: {format.taskTypes.join(', ')}</p>
              </div>
              <button
                type="button"
                className={`phaseCopyBtn copy-${copyStates[format.id] ?? 'idle'}`}
                onClick={() => handleCopyOne(format.id, format.markdown)}
              >
                {copyStates[format.id] === 'copied' ? <Check size={16} /> : <Copy size={16} />}
                コピー
              </button>
            </div>
            <pre className="phase25CodeBlock">{format.markdown}</pre>
          </section>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyAllState}`} onClick={handleCopyAll}>
          {copyAllState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyAllState === 'copied' ? 'コピー済み' : '全テンプレートコピー'}
        </button>
      </div>
    </div>
  );
}
