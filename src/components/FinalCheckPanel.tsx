import { ShieldCheck } from 'lucide-react';
import { finalCheckItems, finalCheckNotes } from '../data/finalCheck';

const stateLabel = {
  ok: 'OK',
  check: '見る',
  later: '次へ',
};

export function FinalCheckPanel() {
  return (
    <div className="finalCheckPanel">
      <div className="finalCheckHero">
        <ShieldCheck />
        <div>
          <p className="eyebrow">Final Check</p>
          <h3>Issue化する前のひと呼吸</h3>
          <p>ここではまだ進めません。内容を軽く見て、安心して次へ渡せる状態にします。</p>
        </div>
      </div>

      <div className="finalCheckGrid">
        {finalCheckItems.map((item) => (
          <article className={`finalCheckCard final-${item.state}`} key={item.id}>
            <div>
              <strong>{item.label}</strong>
              <span>{stateLabel[item.state]}</span>
            </div>
            <p>{item.message}</p>
          </article>
        ))}
      </div>

      <div className="finalCheckNotes">
        <strong>最後に見るところ</strong>
        <ul>
          {finalCheckNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </div>

      <button type="button" className="finalCheckButton" disabled>
        次の段階で有効化
      </button>
    </div>
  );
}
