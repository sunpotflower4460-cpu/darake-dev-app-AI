import { useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, SendHorizontal } from 'lucide-react';
import { issueDraft } from '../data/issueDraft';
import { formatIssueDraft } from '../utils/formatIssueDraft';

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
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const formattedDraft = useMemo(() => formatIssueDraft(issueDraft), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedDraft);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

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
        <button type="button" className={`copyMockButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'Issue本文をコピー'}
        </button>
      </div>
    </div>
  );
}
