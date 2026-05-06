import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { HumanCheckMinimalCard } from '../utils/humanCheckMinimalMode';

type CopyState = 'idle' | 'copied' | 'failed';

type Props = {
  card: HumanCheckMinimalCard;
  onCopy?: (text: string) => void;
};

export function MinimalModeDetailDrawer({ card, onCopy }: Props) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  async function handleCopy(text: string) {
    if (onCopy) {
      onCopy(text);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase31Drawer" style={{ marginTop: 10 }}>
      {card.detailsMarkdown && (
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: '0 0 4px' }}>詳細</p>
          <pre className="phase31CodeBlock">{card.detailsMarkdown}</pre>
        </div>
      )}

      {card.hiddenDetails.length > 0 && (
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: '0 0 4px' }}>追加詳細</p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', display: 'grid', gap: 3 }}>
            {card.hiddenDetails.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}

      {card.safetyNotes.length > 0 && (
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: '0 0 4px' }}>安全メモ</p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', color: '#7a4c00', display: 'grid', gap: 3 }}>
            {card.safetyNotes.map((n, i) => <li key={i}>⚠️ {n}</li>)}
          </ul>
        </div>
      )}

      {card.detailsMarkdown && (
        <button
          className={`phase31SmallBtn ${copyState}`}
          onClick={() => void handleCopy(card.detailsMarkdown)}
        >
          {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />}
          詳細をコピー
        </button>
      )}
    </div>
  );
}
