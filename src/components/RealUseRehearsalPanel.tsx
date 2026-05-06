import { useState } from 'react';
import { ClipboardList, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { REHEARSAL_SCENARIOS, REHEARSAL_SCENARIO_STAGE_LABELS } from '../utils/realUseRehearsalScenario';
import { runRealUseRehearsal, REHEARSAL_STATUS_LABELS } from '../utils/realUseRehearsalRunner';
import type { RealUseRehearsalResult } from '../utils/realUseRehearsalRunner';

const STATUS_CLASS: Record<string, string> = {
  'darake-success': 'darake-success',
  'too-much-human-work': 'too-much-human-work',
  blocked: 'blocked',
  'needs-review': 'needs-review',
};

export function RealUseRehearsalPanel() {
  const [selectedId, setSelectedId] = useState(REHEARSAL_SCENARIOS[0].id);
  const [result, setResult] = useState<RealUseRehearsalResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedScenario = REHEARSAL_SCENARIOS.find((s) => s.id === selectedId)!;

  function handleRun() {
    setResult(runRealUseRehearsal(selectedScenario));
    setShowDetails(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="phase42Panel">
      <div className="phase42Hero">
        <ClipboardList size={22} color="#555" />
        <div>
          <strong style={{ fontSize: '1rem' }}>通し稽古</strong>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Phase 42</div>
        </div>
      </div>

      <select
        className="phase42ScenarioSelect"
        value={selectedId}
        onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
        aria-label="シナリオを選択"
      >
        {REHEARSAL_SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>{s.title}</option>
        ))}
      </select>

      <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: 12 }}>
        <span>アプリ: <strong>{selectedScenario.appName}</strong></span>
        <span style={{ marginLeft: 12 }}>ステージ: {REHEARSAL_SCENARIO_STAGE_LABELS[selectedScenario.currentStage]}</span>
      </div>

      {result && (
        <div className={`phase42StatusCard ${STATUS_CLASS[result.status]}`}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>
            {REHEARSAL_STATUS_LABELS[result.status]}
          </div>
          {result.unnecessaryFriction.length > 0 && (
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
              人間の手間: {result.unnecessaryFriction.length}件残っています
            </div>
          )}
        </div>
      )}

      {result && (
        <>
          <div className="phase42SectionTitle">人間が見るもの</div>
          <ul className="phase42List">
            {result.visibleToHuman.map((v, i) => <li key={i}>{v}</li>)}
          </ul>

          {result.unnecessaryFriction.length > 0 && (
            <>
              <div className="phase42SectionTitle">⚠️ 不要な手間</div>
              <ul className="phase42List">
                {result.unnecessaryFriction.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </>
          )}

          {result.recommendedCuts.length > 0 && (
            <>
              <div className="phase42SectionTitle">削るべきもの</div>
              <ul className="phase42List">
                {result.recommendedCuts.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </>
          )}
        </>
      )}

      <div className="phase42BtnRow">
        <button className="phase42Btn" onClick={handleRun}>
          稽古を実行
        </button>
        {result && (
          <>
            <button className="phase42Btn" onClick={() => setShowDetails((v) => !v)}>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDetails ? '詳細を閉じる' : '詳細を見る'}
            </button>
            <button className="phase42Btn" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'コピー済み' : 'Markdownコピー'}
            </button>
          </>
        )}
      </div>

      {showDetails && result && (
        <div className="phase42Details">
          <div className="phase42SectionTitle">自動処理済み</div>
          <ul className="phase42List">
            {result.autoHandled.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
          <div className="phase42SectionTitle">隠すもの</div>
          <ul className="phase42List">
            {result.hiddenFromHuman.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
          <div className="phase42SectionTitle">手動ゲート</div>
          <ul className="phase42List">
            {result.manualGates.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
          <pre style={{ fontSize: '0.75rem', color: '#888', marginTop: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {result.summary}
          </pre>
        </div>
      )}
    </div>
  );
}
