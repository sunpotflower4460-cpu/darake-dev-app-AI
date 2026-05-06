import { buildBeginnerNextStepCard } from '../utils/beginnerNextStepCard';

const card = buildBeginnerNextStepCard();

export function BeginnerNextStepCardPanel() {
  return (
    <div className="bnsPanel">
      <span className="ponPhaseTag">Phase 47</span>

      <div className="bnsCard">
        <div className="bnsCardTitle">🚀 {card.title}</div>
        <div className="bnsCardMessage">{card.message}</div>
        <div className="bnsNextStepLabel">{card.nextStepLabel}</div>
        <div className="bnsNextStepDetail">{card.nextStepDetail}</div>
      </div>

      <div className="bnsSectionTitle">心配しなくていいこと</div>
      <ul className="bnsList">
        {card.doNotWorry.map((item, i) => (
          <li key={i}><span style={{ color: '#4caf50' }}>✅</span>{item}</li>
        ))}
      </ul>

      <div className="bnsStopBox">
        <div className="bnsStopTitle">⚠️ 止まる時</div>
        <ul className="bnsStopList">
          {card.stopIf.map((item, i) => (
            <li key={i}><span>🛑</span>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
