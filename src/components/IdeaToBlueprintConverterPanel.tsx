import { useMemo, useState } from 'react';
import { Check, Copy, Shuffle, RefreshCcw } from 'lucide-react';
import {
  loadAppIdeaBatch,
  sortByPriority,
} from '../utils/appIdeaBatch';
import {
  convertIdeaToBlueprint,
  formatIdeaToBlueprintMarkdown,
} from '../utils/ideaToBlueprintConverter';

type CopyState = 'idle' | 'copied' | 'failed';

export function IdeaToBlueprintConverterPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedIdeaId, setSelectedIdeaId] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [copyAgentState, setCopyAgentState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ideas = useMemo(() => sortByPriority(loadAppIdeaBatch()), [reloadKey]);

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) ?? ideas[0];
  const blueprint = selectedIdea ? convertIdeaToBlueprint(selectedIdea) : null;

  async function handleCopyAll() {
    if (!blueprint) return;
    try {
      await navigator.clipboard.writeText(formatIdeaToBlueprintMarkdown(blueprint));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  async function handleCopyAgent() {
    if (!blueprint) return;
    try {
      await navigator.clipboard.writeText(blueprint.cloudAgentFirstInstruction);
      setCopyAgentState('copied');
      window.setTimeout(() => setCopyAgentState('idle'), 1800);
    } catch {
      setCopyAgentState('failed');
      window.setTimeout(() => setCopyAgentState('idle'), 2400);
    }
  }

  return (
    <div className="phase23Panel">
      <div className="phase23Hero">
        <Shuffle />
        <div>
          <p className="eyebrow">Phase 23.3</p>
          <h3>アイデア → Blueprint 変換</h3>
          <p>選んだアプリ案をBlueprintに変換して、Cloud Agent 指示書を生成します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部API呼び出しなし・GitHubリポジトリ自動作成なし</strong>
        <p>指示書をコピーしてCloud Agentに手動で渡してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>アプリ案を選ぶ</legend>
          {ideas.length === 0 ? (
            <div className="phaseInfoBox"><p>アプリ案がありません。アプリ案バッチパネルで追加してください。</p></div>
          ) : (
            <label>
              アプリ案
              <select value={selectedIdeaId || ideas[0]?.id} onChange={(e) => setSelectedIdeaId(e.target.value)}>
                {ideas.map((idea, i) => (
                  <option key={idea.id} value={idea.id}>
                    #{i + 1} {idea.title || '（未設定）'} (優先度 {idea.priorityScore})
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <RefreshCcw size={14} /> 再読み込み
          </button>
        </fieldset>
      </div>

      {blueprint && (
        <>
          <div className="phaseInfoBox">
            <strong>アプリ名: {blueprint.appName}</strong>
            <p>推奨テンプレート: {blueprint.recommendedTemplate}</p>
            <p>最初のPhase: {blueprint.firstPhase}</p>
          </div>

          <div className="phaseInfoBox">
            <strong>MVP</strong>
            <ul>{blueprint.mvp.map((m, i) => <li key={i}>☐ {m}</li>)}</ul>
          </div>

          <div className="phaseInfoBox">
            <strong>やらないこと</strong>
            <ul>{blueprint.doNotBuild.map((d, i) => <li key={i}>⛔ {d}</li>)}</ul>
          </div>

          <div className="phaseInfoBox">
            <strong>Cloud Agent 初回指示書</strong>
            <pre className="phase19CodeBox" style={{ maxHeight: '200px', overflow: 'auto' }}>{blueprint.cloudAgentFirstInstruction}</pre>
          </div>
        </>
      )}

      <div className="phaseControls">
        {blueprint && (
          <>
            <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopyAll}>
              {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
              Blueprint全体コピー
            </button>
            <button type="button" className={`phaseCopyBtn copy-${copyAgentState}`} onClick={handleCopyAgent}>
              {copyAgentState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
              Agent指示書コピー
            </button>
          </>
        )}
      </div>
    </div>
  );
}
