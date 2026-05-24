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
import {
  appendWorkSessionHistory,
  buildDarakeWorkSession,
  clearCurrentWorkSession,
  loadCurrentWorkSession,
  parseGitHubIssueInput,
  parseGitHubPrInput,
  saveCurrentWorkSession,
} from '../utils/darakeWorkSession';
import { loadGitHubIssueCreateState } from '../utils/githubIssueCreateState';
import { SafetyConfirmButton } from './SafetyConfirmButton';

function workSessionStepMeta(step: AppCreationRecord['currentStep']): {
  status:
    | 'idea'
    | 'issue-ready'
    | 'issue-created'
    | 'agent-instruction-ready'
    | 'agent-working'
    | 'pr-detected'
    | 'ci-checking'
    | 'preview-ready'
    | 'phase-complete';
  nextActionLabel: string;
} {
  switch (step) {
    case 'idea':
    case 'mvp':
    case 'blueprint':
    case 'phase-breakdown':
      return { status: 'idea', nextActionLabel: 'Issueを作る' };
    case 'issue-created':
      return { status: 'issue-ready', nextActionLabel: 'GitHub Issue作成画面を開く' };
    case 'agent-handed':
      return { status: 'agent-working', nextActionLabel: 'PRを探す' };
    case 'pr-review':
      return { status: 'pr-detected', nextActionLabel: 'CIを確認する' };
    case 'preview-check':
      return { status: 'ci-checking', nextActionLabel: 'Preview URLを探す' };
    case 'next-improvement':
      return { status: 'preview-ready', nextActionLabel: '次のPhaseへ' };
  }
}

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
    const repoUrl = loadGitHubIssueCreateState()?.repoUrl?.trim() || loadCurrentWorkSession()?.repoUrl || undefined;
    const newRecord: AppCreationRecord = {
      appName: appName.trim(),
      oneLineIdea: oneLineIdea.trim() || 'アイデアを整理する',
      currentStep: 'idea',
      completedSteps: [],
      status: 'active',
      repoUrl,
      updatedAt: new Date().toISOString(),
    };
    saveAppCreationRecord(newRecord);
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...(loadCurrentWorkSession() ?? {}),
        appName: newRecord.appName,
        oneLineIdea: newRecord.oneLineIdea,
        repoUrl,
        status: 'idea',
        nextActionLabel: 'Issueを作る',
      }),
    );
    setRecord(newRecord);
  }

  function advance() {
    if (!record) return;
    const next = advanceAppCreationFlow(record);
    saveAppCreationRecord(next);
    const meta = workSessionStepMeta(next.currentStep);
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...(loadCurrentWorkSession() ?? {}),
        appName: next.appName,
        oneLineIdea: next.oneLineIdea,
        repoUrl: next.repoUrl ?? null,
        issueUrl: next.issueUrl ?? null,
        issueNumber: next.issueNumber ?? null,
        prUrl: next.prUrl ?? null,
        prNumber: next.prNumber ?? null,
        previewUrl: next.previewUrl ?? null,
        status: next.status === 'completed' ? 'phase-complete' : meta.status,
        nextActionLabel: next.status === 'completed' ? '次のPhaseへ' : meta.nextActionLabel,
      }),
    );
    setRecord(next);
  }

  function reset() {
    const currentSession = loadCurrentWorkSession();
    if (currentSession) {
      appendWorkSessionHistory(currentSession);
      clearCurrentWorkSession();
    }
    clearAppCreationRecord();
    setAppName('');
    setOneLineIdea('');
    setIssueUrl('');
    setPrUrl('');
    setPreviewUrl('');
    setRecord(null);
  }

  function saveIssueUrl() {
    if (!record) return;
    const parsed = parseGitHubIssueInput(issueUrl, record.repoUrl);
    const next = {
      ...record,
      issueUrl: parsed.issueUrl || issueUrl.trim() || undefined,
      issueNumber: parsed.issueNumber || undefined,
      repoUrl: parsed.repoUrl || record.repoUrl,
    };
    saveAppCreationRecord(next);
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...(loadCurrentWorkSession() ?? {}),
        appName: next.appName,
        oneLineIdea: next.oneLineIdea,
        repoUrl: next.repoUrl ?? null,
        issueUrl: parsed.issueUrl || next.issueUrl || null,
        issueNumber: parsed.issueNumber,
        status: parsed.issueNumber || parsed.issueUrl ? 'issue-created' : 'issue-ready',
        nextActionLabel: parsed.issueNumber || parsed.issueUrl ? 'AI指示を作る' : 'GitHub Issue作成画面を開く',
      }),
    );
    setRecord(next);
  }

  function savePrUrl() {
    if (!record) return;
    const parsed = parseGitHubPrInput(prUrl, record.repoUrl);
    const next = {
      ...record,
      repoUrl: parsed.repoUrl || record.repoUrl,
      prUrl: parsed.prUrl || prUrl.trim() || undefined,
      prNumber: parsed.prNumber || undefined,
    };
    saveAppCreationRecord(next);
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...(loadCurrentWorkSession() ?? {}),
        appName: next.appName,
        oneLineIdea: next.oneLineIdea,
        repoUrl: next.repoUrl ?? null,
        issueUrl: next.issueUrl ?? null,
        issueNumber: next.issueNumber ?? null,
        prUrl: parsed.prUrl || next.prUrl || null,
        prNumber: parsed.prNumber,
        status: parsed.prNumber || parsed.prUrl ? 'pr-detected' : 'agent-working',
        nextActionLabel: parsed.prNumber || parsed.prUrl ? 'CIを確認する' : 'PRを探す',
      }),
    );
    setRecord(next);
  }

  function savePreviewUrl() {
    if (!record) return;
    const next = { ...record, previewUrl: previewUrl.trim() };
    saveAppCreationRecord(next);
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...(loadCurrentWorkSession() ?? {}),
        appName: next.appName,
        oneLineIdea: next.oneLineIdea,
        repoUrl: next.repoUrl ?? null,
        issueUrl: next.issueUrl ?? null,
        issueNumber: next.issueNumber ?? null,
        prUrl: next.prUrl ?? null,
        prNumber: next.prNumber ?? null,
        previewUrl: next.previewUrl ?? null,
        status: next.previewUrl?.trim() ? 'preview-ready' : 'ci-checking',
        nextActionLabel: next.previewUrl?.trim() ? 'Previewを見る' : 'Preview URLを探す',
      }),
    );
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
          record.currentStep === 'agent-handed' ? (
            <SafetyConfirmButton
              actionKey="agentに渡す"
              label="次のステップへ"
              onAction={advance}
              className="appFlow__advance"
            />
          ) : record.currentStep === 'pr-review' ? (
            <SafetyConfirmButton
              actionKey="prを確認する"
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
