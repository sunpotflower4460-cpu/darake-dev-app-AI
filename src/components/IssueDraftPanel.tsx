import { ClipboardList, Copy, SendHorizontal } from 'lucide-react';
import { issueDraft } from '../data/issueDraft';

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="issueListBlock">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export function IssueDraftPanel() {
  return (
    <div className="issueDraftPanel">
      <div className="issueDraftHero">
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 4</p>
          <h3>Issue下書き</h3>
          <p>まだ投稿せず、エージェントに渡しやすい形へ整える段階です。</p>
        </div>
      </div>

      <div className="issueTitleCard">
        <span>Issue title</span>
        <strong>{issueDraft.title}</strong>
      </div>

      <div className="issueBodyGrid">
        <article className="issueMainCard">
          <h4>目的</h4>
          <p>{issueDraft.intent}</p>
          <h4>背景</h4>
          <p>{issueDraft.background}</p>
        </article>
        <ListBlock title="やること" items={issueDraft.scope} />
        <ListBlock title="完了条件" items={issueDraft.done} />
        <ListBlock title="まだやらないこと" items={issueDraft.notDoing} />
      </div>

      <div className="handoffBox">
        <div>
          <SendHorizontal />
          <strong>エージェントに渡す文</strong>
        </div>
        <p>{issueDraft.handoffPrompt}</p>
        <button type="button" className="copyMockButton"><Copy size={16} /> コピー機能は次の段階で追加</button>
      </div>
    </div>
  );
}
