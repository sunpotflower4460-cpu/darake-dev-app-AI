import { Layers3 } from 'lucide-react';
import { getDevServiceSnapshot } from '../services/devService';

const rows = Object.values(getDevServiceSnapshot());

export function StatusPanel() {
  return (
    <div className="statusPanel">
      <div className="statusLead">
        <Layers3 />
        <div>
          <p className="eyebrow">Mode Map</p>
          <h3>今の表示モード</h3>
          <p>この段階では、各欄が仮表示として安全に動いていることを見えるようにします。</p>
        </div>
      </div>
      <div className="statusGrid">
        {rows.map((row) => (
          <article className="statusCard" key={row.label}>
            <div className="agentTop">
              <strong>{row.label}</strong>
              <span>{row.mode}</span>
            </div>
            <p>{row.description}</p>
            <div className="doneBox">
              <span>次の段階</span>
              <p>{row.nextStep}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
