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
import { SafetyConfirmButton } from './SafetyConfirmButton';

export function AppCreationFlowPanel() {
  const stored = loadAppCreationRecord();
  const [record, setRecord] = useState<AppCreationRecord | null>(stored);
  const [appName, setAppName] = useState(stored?.appName ?? '');
  const [oneLineIdea, setOneLineIdea] = useState(stored?.oneLineIdea ?? '');
  const [issueUrl, setIssueUrl] = useState(stored?.issueUrl ?? '');
  const [prUrl, setPrUrl] = useState(stored?.prUrl ?? '');
  const [previewUrl, setPreviewUrl] = useState(stored?.previewUrl ?? '');

  function startFlow() {
    if (!appName.trim()) return;
    const newRecord: AppCreationRecord = {
      appName: appName.trim(),
      oneLineIdea: oneLineIdea.trim() || 'アイデアを整理する',
      currentStep: 'idea',
      completedSteps: [],
      status: 'active',
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
    setIssueUrl('');
    setPrUrl('');
    setPreviewUrl('');
  }

  function saveIssueUrl() {
    if (!record) return;
    const next = { ...record, issueUrl: issueUrl.trim() };
    saveAppCreationRecord(next);
    setRecord(next);
  }

  function savePrUrl() {
    if (!record) return;
    const next = { ...record, prUrl: prUrl.trim() };
    saveAppCreationRecord(next);
    setRecord(next);
  }

  function savePreviewUrl() {
    if (!record) return;
    const next = { ...record, previewUrl: previewUrl.trim() };
    saveAppCreationRecord(next);
    setRecord(next);
  }

  const currentStepMeta = record
    ? FLOW_STEPS.find((s) => s.id === record.currentStep)
    : null;

  const isLast =
    record?.currentStep === FLOW_STEPS[FLOW_STEPS.length - 1]?.id;
  const isCompleted = record?.status === 'completed';

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
      {isCompleted ? (
        <div className="appFlow__completedMessage">
          フロー完了（9/9）。次の改善を提案するか、新しいフローを始めてください。
        </div>
      ) : currentStepMeta ? (
        <div className="appFlow__headline">
          今: {currentStepMeta.label}
          {currentStepMeta.humanAction ? (
            <span className="appFlow__humanBadge">人間確認</span>
          ) : null}
        </div>
      ) : null}

      {record.currentStep === 'issue-created' && (
        <div className="appFlow__urlSection">
          <label className="appFlow__label" htmlFor="af-issue-url">Issue URL</label>
          <div className="appFlow__urlRow">
            <input
              id="af-issue-url"
              className="appFlow__input"
              value={issueUrl}
              onChange={(e) => setIssueUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/issues/1"
            />
            <button type="button" className="appFlow__urlSave" onClick={saveIssueUrl}>保存</button>
          </div>
          {record.issueUrl ? (
            <a href={record.issueUrl} target="_blank" rel="noreferrer" className="appFlow__urlLink">
              🔗 Issue を開く
            </a>
          ) : null}
        </div>
      )}

      {record.currentStep === 'pr-review' && (
        <div className="appFlow__urlSection">
          <label className="appFlow__label" htmlFor="af-pr-url">PR URL</label>
          <div className="appFlow__urlRow">
            <input
              id="af-pr-url"
              className="appFlow__input"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/1"
            />
            <button type="button" className="appFlow__urlSave" onClick={savePrUrl}>保存</button>
          </div>
          {record.prUrl ? (
            <a href={record.prUrl} target="_blank" rel="noreferrer" className="appFlow__urlLink">
              🔗 PR を開く
            </a>
          ) : null}
        </div>
      )}

      {record.currentStep === 'preview-check' && (
        <div className="appFlow__urlSection">
          <label className="appFlow__label" htmlFor="af-preview-url">Preview URL</label>
          <div className="appFlow__urlRow">
            <input
              id="af-preview-url"
              className="appFlow__input"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://your-app.workers.dev"
            />
            <button type="button" className="appFlow__urlSave" onClick={savePreviewUrl}>保存</button>
          </div>
          {record.previewUrl ? (
            <a href={record.previewUrl} target="_blank" rel="noreferrer" className="appFlow__urlLink">
              🔗 Preview を開く
            </a>
          ) : null}
        </div>
      )}

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
        {!isCompleted && !isLast ? (
          record.currentStep === 'agent-handed' || record.currentStep === 'pr-review' ? (
            <SafetyConfirmButton
              actionKey="issue下書き"
              label="次のステップへ"
              onAction={advance}
              className="appFlow__advance"
            />
          ) : (
            <button type="button" className="appFlow__advance" onClick={advance}>
              次のステップへ
            </button>
          )
        ) : !isCompleted ? (
          <button type="button" className="appFlow__advance appFlow__advance--complete" onClick={advance}>
            フロー完了
          </button>
        ) : null}
        {isCompleted ? (
          <button type="button" className="appFlow__advance appFlow__advance--complete" onClick={reset}>
            新しいフローを始める
          </button>
        ) : (
          <button type="button" className="appFlow__reset" onClick={reset}>
            最初からやり直す
          </button>
        )}
      </div>
    </section>
  );
}
