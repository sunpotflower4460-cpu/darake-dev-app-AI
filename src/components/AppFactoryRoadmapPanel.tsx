import { useMemo, useState } from 'react';
import { Check, Copy, Map, RefreshCcw } from 'lucide-react';
import {
  loadAppIdeaBatch,
} from '../utils/appIdeaBatch';
import {
  AppFactoryRoadmap,
  buildAppFactoryRoadmap,
  saveAppFactoryRoadmap,
  formatAppFactoryRoadmapMarkdown,
} from '../utils/appFactoryRoadmap';

type CopyState = 'idle' | 'copied' | 'failed';

const STRATEGIES: { value: AppFactoryRoadmap['strategy']; label: string }[] = [
  { value: 'balanced', label: 'バランス（優先度順）' },
  { value: 'quick-wins', label: 'クイックウィン優先（小規模・容易）' },
  { value: 'dream-core-first', label: '夢コア優先（dreamScore高）' },
  { value: 'revenue-first', label: '収益優先（revenuePotential高）' },
];

export function AppFactoryRoadmapPanel() {
  const [strategy, setStrategy] = useState<AppFactoryRoadmap['strategy']>('balanced');
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ideas = useMemo(() => loadAppIdeaBatch(), [reloadKey]);
  const roadmap = useMemo(() => buildAppFactoryRoadmap(ideas, strategy), [ideas, strategy]);

  function handleSave() {
    saveAppFactoryRoadmap(roadmap);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAppFactoryRoadmapMarkdown(roadmap));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase23Panel">
      <div className="phase23Hero">
        <Map />
        <div>
          <p className="eyebrow">Phase 23.4</p>
          <h3>アプリ工房 ロードマップ</h3>
          <p>複数アプリをどの順で作るかロードマップ化します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>📝 制作ロードマップメモ</strong>
        <p>実際の開発は各アプリのリポジトリで進めてください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>戦略を選ぶ</legend>
          <label>
            ロードマップ戦略
            <select value={strategy} onChange={(e) => setStrategy(e.target.value as AppFactoryRoadmap['strategy'])}>
              {STRATEGIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <RefreshCcw size={14} /> アプリ案を再読み込み
          </button>
        </fieldset>
      </div>

      {ideas.length === 0 ? (
        <div className="phaseInfoBox"><p>アプリ案がありません。アプリ案バッチパネルで追加してください。</p></div>
      ) : (
        <>
          <div className="phaseInfoBox">
            <strong>{roadmap.title}</strong>
            <p>登録アプリ案: {ideas.length}件</p>
          </div>

          <div className="phase23WaveList">
            {roadmap.waves.map((wave, i) => (
              <div key={i} className="phase23WaveItem">
                <div className="phase23WaveLabel">
                  <strong>{wave.label}</strong>
                  <span className="phase23WaveReason">{wave.reason}</span>
                </div>
                <ul>{wave.apps.map((app, j) => <li key={j}>📦 {app}</li>)}</ul>
                <p className="phase23WaveOutcome">期待成果: {wave.expectedOutcome}</p>
              </div>
            ))}
          </div>

          {roadmap.risks.length > 0 && (
            <div className="phaseWarningsBox">
              <strong>リスク</strong>
              <ul>{roadmap.risks.map((r, i) => <li key={i}>⚠️ {r}</li>)}</ul>
            </div>
          )}

          <div className="phaseInfoBox">
            <strong>次のアクション</strong>
            <ul>{roadmap.nextActions.map((a, i) => <li key={i}>☐ {a}</li>)}</ul>
          </div>
        </>
      )}

      <div className="phaseControls">
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || 'ロードマップ保存'}
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
