import { useMemo, useState } from 'react';
import { Check, Copy, MapPin } from 'lucide-react';
import { buildSubmitForReviewManualGuide } from '../utils/submitForReviewManualGuide';

export function SubmitForReviewManualGuidePanel() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const guide = useMemo(() => buildSubmitForReviewManualGuide(), []);

  async function handleCopy() {
    const text = [
      `# ${guide.title}`,
      '',
      '## 手順',
      ...guide.steps.map((s) => `${s.number}. **${s.label}**: ${s.detail}`),
      '',
      '## ストップ条件',
      ...guide.stopConditions.map((c) => `- 🔴 ${c}`),
      '',
      '## Submit前チェック',
      ...guide.preSubmitChecks.map((c) => `- ✅ ${c}`),
      '',
      `## 重要`,
      guide.importantNote,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="submitManualGuidePanel">
      <div className="submitManualGuideHero">
        <MapPin />
        <div>
          <p className="eyebrow">Phase 13.6</p>
          <h3>Submit for Review 手順カード</h3>
          <p>App Store Connectでどこを押すかの手順を確認できます。</p>
        </div>
      </div>

      <div className="submitManualGuideSafetyBox">
        <strong>🔒 このアプリはSubmit for Reviewを押しません</strong>
        <p>{guide.importantNote}</p>
      </div>

      <div className="submitManualGuideControls">
        <button type="button" className={`submitManualGuideCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '手順をコピー'}
        </button>
      </div>

      <div className="submitManualGuideSteps">
        {guide.steps.map((step) => (
          <div key={step.number} className={`submitManualGuideStep${step.number === guide.steps.length ? ' submitManualGuideStepFinal' : ''}`}>
            <span className="submitManualGuideStepNumber">{step.number}</span>
            <div>
              <strong>{step.label}</strong>
              <p>{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="submitManualGuideStopBox">
        <strong>🔴 ここで止まる条件</strong>
        <ul>
          {guide.stopConditions.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>

      <div className="submitManualGuidePreCheckBox">
        <strong>Submit前チェック</strong>
        <ul>
          {guide.preSubmitChecks.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
    </div>
  );
}
