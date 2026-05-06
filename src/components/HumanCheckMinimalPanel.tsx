import { useState } from 'react';
import { Eye, Copy, Check, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  buildHumanCheckMinimalCard,
  loadHumanCheckMinimalCards,
  saveHumanCheckMinimalCards,
  formatHumanCheckMinimalCard,
  summarizeHumanCheckMinimalMode,
} from '../utils/humanCheckMinimalMode';
import type {
  HumanCheckMinimalCard,
  HumanCheckMinimalModeStatus,
} from '../utils/humanCheckMinimalMode';
import {
  loadOneActionDecisionRecords,
  saveOneActionDecisionRecords,
  addOneActionDecisionRecord,
} from '../utils/oneActionDecisionRecord';
import { MinimalModeDetailDrawer } from './MinimalModeDetailDrawer';

type CopyState = 'idle' | 'copied' | 'failed';

const STATUS_OPTIONS: HumanCheckMinimalModeStatus[] = [
  'quiet', 'ready', 'manual-gate', 'blocked', 'needs-choice',
];

export function HumanCheckMinimalPanel() {
  const [cards, setCards] = useState(() => loadHumanCheckMinimalCards());
  const [decisions, setDecisions] = useState(() => loadOneActionDecisionRecords());
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [whyNow, setWhyNow] = useState('');
  const [details, setDetails] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [drawerOpenId, setDrawerOpenId] = useState<string | null>(null);
  const [stopReasonMap, setStopReasonMap] = useState<Record<string, string>>({});
  const [pendingStopId, setPendingStopId] = useState<string | null>(null);

  const stats = summarizeHumanCheckMinimalMode(cards);
  const readyCards = cards.filter((c) => c.status === 'ready');
  const featuredCard = readyCards[0] ?? null;

  function saveCards(updated: HumanCheckMinimalCard[]) {
    saveHumanCheckMinimalCards(updated);
    setCards(updated);
  }

  function handleAdd() {
    if (!title.trim()) return;
    const c = buildHumanCheckMinimalCard({
      title: title.trim(),
      oneLineSummary: summary.trim(),
      whyNow: whyNow.trim(),
      detailsMarkdown: details.trim(),
    });
    saveCards([c, ...cards]);
    setTitle(''); setSummary(''); setWhyNow(''); setDetails('');
  }

  function handleDelete(id: string) {
    saveCards(cards.filter((c) => c.id !== id));
  }

  function handleStatusChange(id: string, status: HumanCheckMinimalModeStatus) {
    saveCards(cards.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  function handleDecision(cardId: string, decision: 'ok' | 'stop' | 'later') {
    const reason = stopReasonMap[cardId] ?? '';
    if (decision === 'stop' && !reason.trim()) {
      setPendingStopId(cardId);
      return;
    }
    const updated = addOneActionDecisionRecord(decisions, {
      candidateId: cardId,
      decision,
      reason: decision === 'stop' ? reason : '',
      followUpNeeded: decision === 'later',
      notes: '',
    });
    saveOneActionDecisionRecords(updated);
    setDecisions(updated);
    setPendingStopId(null);
    setStopReasonMap((prev) => ({ ...prev, [cardId]: '' }));
    // Mark card as quiet after decision
    if (decision === 'ok' || decision === 'stop') {
      saveCards(cards.map((c) => (c.id === cardId ? { ...c, status: 'quiet' } : c)));
    }
  }

  async function handleCopy(text: string) {
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
    <div className="phase31Panel">
      <div className="phase31Hero">
        <Eye />
        <div>
          <p className="eyebrow">Phase 31.1 / 31.2</p>
          <h3>Human Check Minimal Mode</h3>
          <p>今見るべきことだけを1枚で出します。OK / あとで / 止める だけ選べばOK。</p>
        </div>
      </div>

      <div className="phase31SafetyBox">
        ⛔ OKしても外部実行しません。判断をlocalStorageに保存するだけです。
      </div>

      {featuredCard ? (
        <div className={`phase31MinimalCard ${featuredCard.status}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className={`phase31StatusBadge ${featuredCard.status}`}>{featuredCard.status}</span>
            <h3 className="phase31CardTitle">{featuredCard.title}</h3>
          </div>

          {featuredCard.oneLineSummary && (
            <p className="phase31OneLineSummary">{featuredCard.oneLineSummary}</p>
          )}

          {featuredCard.whyNow && (
            <p className="phase31WhyNow">なぜ今？ {featuredCard.whyNow}</p>
          )}

          {featuredCard.safetyNotes.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', color: '#7a4c00' }}>
              {featuredCard.safetyNotes.map((n, i) => <li key={i}>⚠️ {n}</li>)}
            </ul>
          )}

          <p className="phase31Question">{featuredCard.humanQuestion}</p>

          {pendingStopId === featuredCard.id && (
            <div style={{ display: 'grid', gap: 6 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>止める理由</p>
              <input
                className="phase31Input"
                placeholder="理由を入力してください"
                value={stopReasonMap[featuredCard.id] ?? ''}
                onChange={(e) =>
                  setStopReasonMap((prev) => ({ ...prev, [featuredCard.id]: e.target.value }))
                }
              />
              <button className="phase31StopBtn" onClick={() => handleDecision(featuredCard.id, 'stop')}>
                確定して止める
              </button>
            </div>
          )}

          <div className="phase31DecisionRow">
            <button className="phase31OkBtn" onClick={() => handleDecision(featuredCard.id, 'ok')}>
              ✅ {featuredCard.okLabel}
            </button>
            <button className="phase31LaterBtn" onClick={() => handleDecision(featuredCard.id, 'later')}>
              ⏳ {featuredCard.laterLabel}
            </button>
            <button className="phase31StopBtn" onClick={() => {
              setPendingStopId(featuredCard.id);
              setStopReasonMap((prev) => ({ ...prev, [featuredCard.id]: '' }));
            }}>
              🚫 {featuredCard.stopLabel}
            </button>
          </div>

          {featuredCard.detailsMarkdown && (
            <div>
              <button
                className="phase31DrawerToggle"
                onClick={() => setDrawerOpenId(drawerOpenId === featuredCard.id ? null : featuredCard.id)}
              >
                {drawerOpenId === featuredCard.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                詳細
              </button>
              {drawerOpenId === featuredCard.id && (
                <MinimalModeDetailDrawer card={featuredCard} onCopy={handleCopy} />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="phase31Section">
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: 0 }}>
            🌿 今は静かです。新しいカードを追加してください。
          </p>
        </div>
      )}

      <div className="phase31SummaryGrid">
        <section><h4>合計</h4><p>{stats.total}</p></section>
        <section><h4>ready</h4><p>{stats.ready}</p></section>
        <section><h4>blocked</h4><p>{stats.blocked}</p></section>
        <section><h4>gate</h4><p>{stats.manualGate}</p></section>
        <section><h4>quiet</h4><p>{stats.quiet}</p></section>
      </div>

      <div className="phase31Section">
        <h4>新しいカードを追加</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <input className="phase31Input" placeholder="タイトル *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="phase31Input" placeholder="1行サマリー" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <input className="phase31Input" placeholder="なぜ今？" value={whyNow} onChange={(e) => setWhyNow(e.target.value)} />
          <textarea className="phase31Textarea" rows={3} placeholder="詳細（折りたたみで表示）" value={details} onChange={(e) => setDetails(e.target.value)} />
          <button className="phase31SmallBtn" onClick={handleAdd}><Plus size={14} /> 追加</button>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="phase31Section">
          <h4>全カード ({cards.length})</h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {cards.map((c) => (
              <div key={c.id} className="phase31RecordCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ flex: 1, fontSize: '0.84rem' }}>{c.title}</strong>
                  <select
                    className="phase31Select"
                    style={{ width: 'auto', fontSize: '0.76rem', padding: '3px 8px' }}
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value as HumanCheckMinimalModeStatus)}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="phase31BtnRow">
                  <button className={`phase31SmallBtn ${copyState}`} onClick={() => void handleCopy(formatHumanCheckMinimalCard(c))}>
                    {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} MDコピー
                  </button>
                  <button className="phase31SmallBtn" onClick={() => handleDelete(c.id)} style={{ color: '#992020' }}>
                    <Trash2 size={13} /> 削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
