import { useState } from 'react';
import '../styles/safetyConfirmButton.css';
import { checkActionSafety } from '../utils/safetyGateV2';

type Props = {
  actionKey: string;
  label: string;
  onAction: () => void;
  className?: string;
  disabled?: boolean;
};

export function SafetyConfirmButton({ actionKey, label, onAction, className, disabled }: Props) {
  const [state, setState] = useState<'idle' | 'confirm' | 'blocked'>('idle');
  const safetyResult = checkActionSafety(actionKey);

  function handleClick() {
    if (safetyResult.decision === 'allow') {
      onAction();
    } else if (safetyResult.decision === 'stop') {
      setState('blocked');
    } else {
      // ask or unknown
      setState('confirm');
    }
  }

  if (state === 'blocked') {
    return (
      <span className="safetyBtn safetyBtn--blocked">
        🚫 {safetyResult.message}
        <button
          type="button"
          className="safetyBtn__dismiss"
          onClick={() => setState('idle')}
        >
          閉じる
        </button>
      </span>
    );
  }

  if (state === 'confirm') {
    return (
      <div className="safetyBtn__confirm">
        <span className="safetyBtn__confirmMsg">{safetyResult.message}</span>
        <div className="safetyBtn__confirmRow">
          <button
            type="button"
            className="safetyBtn__confirmOk"
            onClick={() => { setState('idle'); onAction(); }}
          >
            確認して進める
          </button>
          <button
            type="button"
            className="safetyBtn__confirmCancel"
            onClick={() => setState('idle')}
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
