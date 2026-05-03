import { ExternalLink, Hand } from 'lucide-react';
import { manualGateSteps, manualGateWarnings } from '../data/manualGate';

export function ManualGatePanel() {
  return (
    <div className="manualGatePanel">
      <div className="manualGateHero">
        <Hand />
        <div>
          <p className="eyebrow">Manual Gate</p>
          <h3>ここから先は手動です</h3>
          <p>自動で進める前に、内容を一度だけ見ます。大事な境界線をここに置きます。</p>
        </div>
      </div>

      <div className="manualWarningList">
        {manualGateWarnings.map((item) => <span key={item}>{item}</span>)}
      </div>

      <div className="manualStepGrid">
        {manualGateSteps.map((step, index) => (
          <article className="manualStepCard" key={step.id}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </div>
          </article>
        ))}
      </div>

      <button type="button" className="manualGateButton" disabled>
        <ExternalLink size={16} /> 次の段階でGitHub案内を有効化
      </button>
    </div>
  );
}
