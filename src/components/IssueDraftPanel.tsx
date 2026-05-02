import { useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, RotateCcw, SendHorizontal } from 'lucide-react';
import { issueDraft } from '../data/issueDraft';
import type { IssueDraft } from '../data/issueDraft';
import { clearDraft, loadDraft, saveDraft } from '../utils/draftStore';
import { formatIssueDraft } from '../utils/formatIssueDraft';

function toLines(items: string[]): string {
  return items.join('\n');
}

function fromLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="issueEditField">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({ label, value, rows = 4, onChange }: { label: string; value: string; rows?: number; onChange: (value: string) => void }) {
  return (
    <label className="issueEditField">
      {label}
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function IssueDraftPanel() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [draft, setDraft] = useState<IssueDraft>(() => loadDraft());
  const formattedDraft = useMemo(() => formatIssueDraft(draft), [draft]);

  function updateDraft(next: Partial<IssueDraft>) {
    setDraft((current) => {
      const updated = { ...current, ...next };
      saveDraft(updated);
      return updated;
    });
  }

  function handleReset() {
    const resetDraft = clearDraft();
    setDraft(resetDraft);
  }

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

      <div className="draftSaveNote">
        <strong>編集中の下書きはこのブラウザに一時保存されます。</strong>
        <button type="button" onClick={handleReset}><RotateCcw size={15} /> 初期状態に戻す</button>
      </div>

      <div className="issueEditorGrid">
        <TextField label="Issue title" value={draft.title} onChange={(title) => updateDraft({ title })} />
        <TextAreaField label="目的" value={draft.intent} rows={3} onChange={(intent) => updateDraft({ intent })} />
        <TextAreaField label="背景" value={draft.background} rows={4} onChange={(background) => updateDraft({ background })} />
        <TextAreaField label="やること（一行ずつ）" value={toLines(draft.scope)} rows={5} onChange={(value) => updateDraft({ scope: fromLines(value) })} />
        <TextAreaField label="完了条件（一行ずつ）" value={toLines(draft.done)} rows={5} onChange={(value) => updateDraft({ done: fromLines(value) })} />
        <TextAreaField label="まだやらないこと（一行ずつ）" value={toLines(draft.notDoing)} rows={4} onChange={(value) => updateDraft({ notDoing: fromLines(value) })} />
      </div>

      <div className="handoffBox">
        <div>
          <SendHorizontal />
          <strong>エージェントに渡す文</strong>
        </div>
        <textarea className="handoffEditor" rows={4} value={draft.handoffPrompt} onChange={(event) => updateDraft({ handoffPrompt: event.target.value })} />
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
