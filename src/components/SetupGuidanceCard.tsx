import { useState } from 'react';
import type { SetupGuidance, SetupGuidanceStep } from '../utils/setupGuidance';

function dangerBadge(level: SetupGuidance['dangerLevel']): React.ReactNode {
  if (level === 'secret') {
    return <span className="sgc-badge sgc-badge--secret">🔒 Secret</span>;
  }
  if (level === 'careful') {
    return <span className="sgc-badge sgc-badge--careful">⚠️ 要確認</span>;
  }
  return null;
}

function StepItem({ step }: { step: SetupGuidanceStep }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!step.copyText) return;
    navigator.clipboard.writeText(step.copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="sgc-step">
      <div className="sgc-step-title">{step.title}</div>
      <div className="sgc-step-desc">{step.description}</div>
      {step.copyText && (
        <div className="sgc-copy-row">
          <pre className="sgc-copy-pre">{step.copyText}</pre>
          <button
            type="button"
            className="sgc-copy-btn"
            onClick={handleCopy}
          >
            {copied ? 'コピー済み ✓' : 'コピー'}
          </button>
        </div>
      )}
      {step.warning && (
        <div className="sgc-step-warning">⚠ {step.warning}</div>
      )}
    </div>
  );
}

export function SetupGuidanceCard({ guidance }: { guidance: SetupGuidance }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`sgc-card sgc-card--${guidance.dangerLevel}`}>
      <div className="sgc-header">
        <div className="sgc-title-row">
          <span className="sgc-title">{guidance.title}</span>
          {dangerBadge(guidance.dangerLevel)}
        </div>
        <p className="sgc-short">{guidance.shortMessage}</p>
      </div>

      <div className="sgc-actions">
        <button
          type="button"
          className="sgc-btn-primary"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '手順を閉じる' : '手順を見る'}
        </button>
      </div>

      {open && (
        <div className="sgc-steps">
          {guidance.steps.map((step) => (
            <StepItem key={step.title} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}
