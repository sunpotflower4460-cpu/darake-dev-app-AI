import { useMemo, useState } from 'react';
import { Brain, Check, Copy } from 'lucide-react';
import { AI_PROVIDER_CANDIDATES } from '../utils/aiProviderCandidates';
import {
  AI_TASK_TYPE_REGISTRY,
  formatAiTaskTypeRegistryMarkdown,
} from '../utils/aiTaskTypeRegistry';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiTaskTypeRegistryPanel() {
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const providerLabelMap = useMemo(
    () => Object.fromEntries(AI_PROVIDER_CANDIDATES.map((candidate) => [candidate.id, candidate.label])),
    [],
  );

  const taskTypes =
    riskFilter === 'all'
      ? AI_TASK_TYPE_REGISTRY
      : AI_TASK_TYPE_REGISTRY.filter((taskType) => taskType.privateInfoRisk === riskFilter);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAiTaskTypeRegistryMarkdown(AI_TASK_TYPE_REGISTRY));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <Brain />
        <div>
          <p className="eyebrow">Phase 25.2</p>
          <h3>AI Task Type Registry</h3>
          <p>AIへ頼む作業タイプごとに入力・期待出力・private情報リスクを固定します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ AIへ送る内容は毎回人間が確認する / secretは含めない</strong>
      </div>

      <div>
        <p className="phase25Label">private情報リスクで絞る</p>
        <div className="phase24GroupFilter">
          {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
            <button
              key={risk}
              type="button"
              className={`phase24GroupBtn${riskFilter === risk ? ' active' : ''}`}
              onClick={() => setRiskFilter(risk)}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="phase24Table">
          <thead>
            <tr>
              <th>Task</th>
              <th>推奨AI</th>
              <th>必要入力</th>
              <th>期待出力</th>
              <th>Risk</th>
              <th>Manual Check</th>
            </tr>
          </thead>
          <tbody>
            {taskTypes.map((taskType) => (
              <tr key={taskType.id}>
                <td>
                  <strong>{taskType.label}</strong>
                  <div className="phase25Muted">{taskType.purpose}</div>
                </td>
                <td>{taskType.recommendedProviders.map((id) => providerLabelMap[id] ?? id).join(', ')}</td>
                <td>
                  <ul className="phase25InlineList">
                    {taskType.inputRequired.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </td>
                <td>
                  <ul className="phase25InlineList">
                    {taskType.expectedOutput.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </td>
                <td><span className={`phase25Badge phase25Badge-risk-${taskType.privateInfoRisk}`}>{taskType.privateInfoRisk}</span></td>
                <td>{taskType.manualCheckRequired ? 'required' : 'optional'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
