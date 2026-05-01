import { Eye } from 'lucide-react';
import { phase3Readiness } from '../data/phase3Plan';

export function FuturePanel() {
  return (
    <div className="phase3Panel">
      <div className="statusLead">
        <Eye />
        <div>
          <p className="eyebrow">Next</p>
          <h3>次の表示準備</h3>
          <p>次に見えるようにしたい項目を一覧にしています。</p>
        </div>
      </div>
      <div className="phase3Grid">
        {phase3Readiness.map((item) => (
          <article className="phase3Card" key={item.label}>
            <div className="agentTop">
              <strong>{item.label}</strong>
              <span>{item.state}</span>
            </div>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
