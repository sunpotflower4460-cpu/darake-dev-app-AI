import { useState } from 'react';
import '../appCreationFlow.css';
import {
  advanceAppCreationFlow,
  clearAppCreationRecord,
  FLOW_STEPS,
  loadAppCreationRecord,
  saveAppCreationRecord,
  type AppCreationRecord,
} from '../utils/appCreationFlowV1';

export function AppCreationFlowPanel() {
  const stored = loadAppCreationRecord();
  const [record, setRecord] = useState<AppCreationRecord | null>(stored);
  const [appName, setAppName] = useState(stored?.appName ?? '');
  const [oneLineIdea, setOneLineIdea] = useState(stored?.oneLineIdea ?? '');

  function startFlow() {
    if (!appName.trim()) return;
    const newRecord: AppCreationRecord = {
      appName: appName.trim(),
      oneLineIdea: oneLineIdea.trim() || 'アイデアを整理する',
      currentStep: 'idea',
      completedSteps: [],
      updatedAt: new Date().toISOString(),
    };
    saveAppCreationRecord(newRecord);
    setRecord(newRecord);
  }

  function advance() {
    if (!record) return;
    const next = advanceAppCreationFlow(record);
    saveAppCreationRecord(next);
    setRecord(next);
  }

  function reset() {
    clearAppCreationRecord();
    setRecord(null);
    setAppName('');
    setOneLineIdea('');
  }

  const currentStepMeta = record
    ? FLOW_STEPS.find((s) => s.id === record.currentStep)
    : null;

  const isLast =
    record?.currentStep === FLOW_STEPS[FLOW_STEPS.length - 1]?.id;

  if (!record) {
    return (
      <section className="appFlow" aria-label="アプリ制作フロー">
        <span className="appFlow__eyebrow">Phase 98 · アプリ制作フロー</span>
        <h2 className="appFlow__title">作りたいものを置くだけ</h2>
        <div className="appFlow__start">
          <div className="appFlow__field">
            <label className="appFlow__label" htmlFor="af-name">アプリ名</label>
            <input
              id="af-name"
              className="appFlow__input"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="宝地図アプリ"
            />
          </div>
          <div className="appFlow__field">
            <label className="appFlow__label" htmlFor="af-idea">一行アイデア</label>
            <input
              id="af-idea"
              className="appFlow__input"
              value={oneLineIdea}
              onChange={(e) => setOneLineIdea(e.target.value)}
              placeholder="自分の夢を宝地図みたいに置いて、AIが次の一歩にしてくれるアプリ"
            />
          </div>
          <button type="button" className="appFlow__startBtn" onClick={startFlow}>
            フローを開始する
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="appFlow" aria-label="アプリ制作フロー">
      <span className="appFlow__eyebrow">Phase 98 · アプリ制作フロー</span>
      <h2 className="appFlow__title">{record.appName}</h2>
      {currentStepMeta ? (
        <div className="appFlow__headline">
          今: {currentStepMeta.label}
          {currentStepMeta.humanAction ? (
            <span className="appFlow__humanBadge">人間確認</span>
          ) : null}
        </div>
      ) : null}

      <ol className="appFlow__flow">
        {FLOW_STEPS.map((step) => {
          const isDone = record.completedSteps.includes(step.id);
          const isCurrent = record.currentStep === step.id;
          return (
            <li
              key={step.id}
              className={`appFlow__step${isDone ? ' appFlow__step--done' : ''}${isCurrent ? ' appFlow__step--current' : ''}`}
            >
              <span className="appFlow__stepNum">{isDone ? '✓' : step.num}</span>
              <div className="appFlow__stepBody">
                <div className="appFlow__stepLabel">
                  {step.label}
                  {step.humanAction ? (
                    <span className="appFlow__humanBadge">人間</span>
                  ) : null}
                </div>
                <div className="appFlow__stepDesc">{step.description}</div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="appFlow__actions">
        {!isLast ? (
          <button type="button" className="appFlow__advance" onClick={advance}>
            次のステップへ
          </button>
        ) : (
          <button type="button" className="appFlow__advance" style={{ background: '#7c3aed' }} onClick={advance}>
            フロー完了
          </button>
        )}
        <button type="button" className="appFlow__reset" onClick={reset}>
          最初からやり直す
        </button>
      </div>
    </section>
  );
}
