import { ChevronDown, ChevronUp, Copy, Check, Eye } from 'lucide-react';
import { useState } from 'react';
import type { DarakeFinalFormState } from '../utils/darakeFinalFormState';
import { loadDarakeSleepMode } from '../utils/darakeSleepMode';
import { loadDarakeMorningReport } from '../utils/darakeMorningReport';

type CopyState = 'idle' | 'copied';

type Props = {
  state: DarakeFinalFormState;
};

export function DarakeFinalFormDetailsDrawer({ state }: Props) {
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const sleepMode = loadDarakeSleepMode();
  const morningReport = loadDarakeMorningReport();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(state.detailsMarkdown);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('idle');
    }
  }

  return (
    <div className="phase41Drawer">
      <button
        className="phase41Btn"
        onClick={() => setOpen((v) => !v)}
        style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 8, alignItems: 'center' }}
      >
        <Eye size={14} />
        {open ? (
          <>
            <ChevronUp size={14} /> 詳細を閉じる
          </>
        ) : (
          <>
            <ChevronDown size={14} /> 必要な時だけ見る
          </>
        )}
      </button>

      {open && (
        <div style={{ marginTop: 14 }}>
          <div className="phase41DrawerSection">
            <h4>カウンターサマリー</h4>
            <p>自動処理: {state.counters.autoHandled}件</p>
            <p>まとめた警告: {state.counters.batched}件</p>
            <p>あとで確認: {state.counters.reviewLater}件</p>
            <p>今すぐ確認: {state.counters.humanNow}件</p>
            <p>ブロック: {state.counters.blocked}件</p>
            <p>完成待ち: {state.counters.completionRemaining}件</p>
          </div>

          {sleepMode && (
            <div className="phase41DrawerSection">
              <h4>スリープモード</h4>
              <p>{sleepMode.headline}</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>{sleepMode.subline}</p>
            </div>
          )}

          {morningReport && (
            <div className="phase41DrawerSection">
              <h4>モーニングレポート</h4>
              <p>{morningReport.oneLineSummary}</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>{morningReport.todayOneThing}</p>
            </div>
          )}

          {state.visibleCards.length > 0 && (
            <div className="phase41DrawerSection">
              <h4>表示カード</h4>
              {state.visibleCards.map((card) => (
                <p key={card.id}>
                  <strong>{card.label}:</strong> {card.value}
                </p>
              ))}
            </div>
          )}

          <div className="phase41DrawerSection">
            <h4>非表示パネル</h4>
            <p>{state.hiddenPanelCount}件のパネルを安全のため非表示にしています</p>
          </div>

          <div className="phase41DrawerSection">
            <h4>安全ノート</h4>
            <p>🔴 ブロックと緊急確認は常に表示されます</p>
            <p>✅ 自動処理結果は詳細からのみ確認できます</p>
          </div>

          <div style={{ marginTop: 10 }}>
            <button className="phase41Btn" onClick={handleCopy} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
              {copyState === 'copied' ? 'コピー済み' : '全レポートをコピー'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
