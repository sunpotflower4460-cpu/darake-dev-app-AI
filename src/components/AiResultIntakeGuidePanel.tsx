import { useState } from 'react';
import { Check, Copy, ClipboardList } from 'lucide-react';
import {
  formatAiResultIntakeGuideMarkdown,
  getAiResultIntakeGuide,
} from '../utils/aiResultIntakeGuide';
import { AI_TASK_TYPE_REGISTRY } from '../utils/aiTaskTypeRegistry';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiResultIntakeGuidePanel() {
  const [taskType, setTaskType] = useState(AI_TASK_TYPE_REGISTRY[0]?.id ?? 'screenshot-ui-review');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const guide = getAiResultIntakeGuide(taskType);

  async function handleCopy() {
    if (!guide) return;

    try {
      await navigator.clipboard.writeText(formatAiResultIntakeGuideMarkdown(guide));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  if (!guide) return null;

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 25.5</p>
          <h3>AI Result Intake Guide</h3>
          <p>AIから返ってきた結果を、どのパネルへ戻すか案内します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ AI結果の貼り戻しも人間が判断して行う</strong>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>task type</legend>
          <label>
            Intake対象
            <select value={taskType} onChange={(event) => setTaskType(event.target.value as typeof taskType)}>
              {AI_TASK_TYPE_REGISTRY.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
        </fieldset>
      </div>

      <div className="phaseInfoBox">
        <strong>Expected Result</strong>
        <p>{guide.expectedResult}</p>
      </div>

      <div className="phase25Grid">
        {guide.pasteTargets.map((target) => (
          <section key={`${target.panelName}-${target.fieldName}`} className="phase25Card phase25CompactCard">
            <h4>{target.panelName}</h4>
            <p className="phase25Muted">field: {target.fieldName}</p>
            <p className="phase25Note">{target.note}</p>
          </section>
        ))}
      </div>

      <div className="phase25TwoColumn phase25AlignStart">
        <section className="phaseInfoBox">
          <strong>Next Actions</strong>
          <ul>{guide.nextActions.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className="phaseWarningsBox">
          <strong>Cautions</strong>
          <ul>{guide.cautions.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
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
