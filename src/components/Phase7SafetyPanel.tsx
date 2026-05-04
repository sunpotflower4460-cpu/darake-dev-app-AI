import { ShieldCheck } from 'lucide-react';
import { phase7SafetyGates } from '../data/phase7Safety';

const modeLabel = {
  'auto-candidate': '自動候補',
  'manual-gate': '手動ゲート',
  blocked: '必ず停止',
};

export function Phase7SafetyPanel() {
  return (
    <div className="phase7SafetyPanel">
      <div className="phase7Hero">
        <ShieldCheck />
        <div>
          <p className="eyebrow">Phase 7入口</p>
          <h3>書き込み自動化の前に止まる場所</h3>
          <p>Issue作成、PR作成、マージへ進む前に、何を自動候補にして何を止めるかを固定します。</p>
        </div>
      </div>

      <div className="phase7GateGrid">
        {phase7SafetyGates.map((gate) => (
          <article className={`phase7Gate gate-${gate.mode}`} key={gate.id}>
            <div>
              <strong>{gate.label}</strong>
              <span>{modeLabel[gate.mode]}</span>
            </div>
            <p>{gate.reason}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
