import { useEffect, useMemo, useState } from 'react';
import { buildDeepBuildPlan } from '../utils/buildDeepBuildPlan';
import {
  getDeepBuildNextAction,
  getDeepBuildProgress,
  judgeDeepBuildCompletion,
  markCompletionCandidates,
  syncCurrentDeepBuildPhase,
} from '../utils/deepBuildCompletionJudge';
import { loadCurrentWorkSession } from '../utils/darakeWorkSession';
import { clearDeepBuildPlan, loadDeepBuildPlan, saveDeepBuildPlan } from '../utils/deepBuildPlanStorage';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { loadGentleAppStartForm } from '../utils/gentleAppStartForm';
import type { DeepBuildPlan } from '../utils/deepBuildPlan';
import { loadPrCiLastStatus } from '../utils/prCiStatusClient';

function buildPlanSource(): { appName: string; oneLineIdea: string } {
  const session = loadCurrentWorkSession();
  const form = loadGentleAppStartForm();
  return {
    appName: session?.appName || form?.appName?.trim() || '宝地図アプリ',
    oneLineIdea:
      session?.oneLineIdea ||
      form?.oneLineIdea?.trim() ||
      '自分の夢や目標を宝の地図みたいに置いて、AIが次の一歩にしてくれるアプリ',
  };
}

function advanceOneLocalPhase(plan: DeepBuildPlan): DeepBuildPlan {
  const nextPhases = plan.phases.map((phase) => ({ ...phase }));
  const targetIndex = nextPhases.findIndex((phase) => phase.status !== 'done');

  if (targetIndex === -1) {
    const { currentPhaseId: _currentPhaseId, ...rest } = plan;
    return {
      ...rest,
      overallStatus: 'reviewing',
    };
  }

  const targetPhase = nextPhases[targetIndex];
  if (!targetPhase) return plan;

  nextPhases[targetIndex] = {
    ...targetPhase,
    status: 'done',
  };

  const nextTarget = nextPhases.find((phase) => phase.status !== 'done');
  if (nextTarget && nextTarget.status === 'planned') {
    nextTarget.status = 'issue-ready';
  }

  const allDone = nextPhases.every((phase) => phase.status === 'done');
  const basePlan: DeepBuildPlan = {
    ...plan,
    phases: nextPhases,
    overallStatus: allDone ? 'reviewing' : 'building',
  };

  if (!nextTarget) {
    const { currentPhaseId: _currentPhaseId, ...rest } = basePlan;
    return rest;
  }

  return {
    ...basePlan,
    currentPhaseId: nextTarget.id,
  };
}

export function DeepBuildModePanel() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const plan = useMemo(() => {
    const loaded = loadDeepBuildPlan();
    if (!loaded) return null;
    return markCompletionCandidates(
      syncCurrentDeepBuildPhase(loaded, loadCurrentWorkSession(), loadPrCiLastStatus()),
    );
  }, [revision]);
  const judgement = useMemo(() => (plan ? judgeDeepBuildCompletion(plan) : null), [plan]);
  const progress = useMemo(() => (plan ? getDeepBuildProgress(plan) : null), [plan]);

  function createPlan() {
    const source = buildPlanSource();
    saveDeepBuildPlan(buildDeepBuildPlan(source));
    setRevision((v) => v + 1);
  }

  function advanceLocal() {
    if (!plan) return;
    saveDeepBuildPlan(advanceOneLocalPhase(plan));
    setRevision((v) => v + 1);
  }

  function confirmHumanCheck(phaseId: string) {
    if (!plan) return;
    const updatedPlan: DeepBuildPlan = {
      ...plan,
      phases: plan.phases.map((p) =>
        p.id === phaseId ? { ...p, humanCheckDone: true, completionCandidate: false } : p,
      ),
    };
    saveDeepBuildPlan(updatedPlan);
    setRevision((v) => v + 1);
  }

  function resetPlan() {
    clearDeepBuildPlan();
    setRevision((v) => v + 1);
  }

  if (!plan) {
    return (
      <section className="deepBuildModePanel" aria-label="Deep Build Mode">
        <div className="deepBuildModePanel__header">
          <span>熟成モード</span>
          <h2>完成まで育てる土台</h2>
          <p>
            まだ熟成計画はありません。今のアプリの種から、設計・UI・実装・テスト・修正・仕上げまでの流れを作れます。
          </p>
        </div>
        <button type="button" className="deepBuildModePanel__primary" onClick={createPlan}>
          熟成計画を作る
        </button>
        <p className="deepBuildModePanel__quiet">
          このPhaseではIssue作成・マージ・secret変更などの危険操作は行いません。ローカルに計画を作るだけです。
        </p>
      </section>
    );
  }

  const hasReviewItems = Boolean(judgement && (judgement.missing.length > 0 || judgement.blocking.length > 0));
  const currentPhase = plan.currentPhaseId
    ? plan.phases.find((p) => p.id === plan.currentPhaseId)
    : plan.phases.find((p) => p.status !== 'done');
  const nextAction = getDeepBuildNextAction(currentPhase);

  const CI_STATUS_LABEL: Record<string, string> = {
    passed: '✅ CI成功',
    failed: '❌ CI失敗',
    running: '⏳ CI実行中',
    unknown: '❓ CI不明',
  };

  return (
    <section className="deepBuildModePanel" aria-label="Deep Build Mode">
      <div className="deepBuildModePanel__header">
        <span>熟成モード</span>
        <h2>{plan.appName}</h2>
        <p>{plan.goal}</p>
      </div>

      <div className="deepBuildModePanel__now">
        <span>今</span>
        <strong>{judgement?.title ?? '育成中です'}</strong>
        <p>{judgement?.message ?? 'AIが進められる範囲を整えています。'}</p>
      </div>

      {currentPhase ? (
        <div className="deepBuildModePanel__currentPhase">
          <span className="deepBuildModePanel__currentPhaseLabel">現在のPhase: {currentPhase.title}</span>
          {currentPhase.ciStatus ? (
            <span className="deepBuildModePanel__ciStatus">
              {CI_STATUS_LABEL[currentPhase.ciStatus] ?? currentPhase.ciStatus}
            </span>
          ) : null}
          <div className="deepBuildModePanel__nextAction">次の一手: {nextAction}</div>
          {currentPhase.humanCheckRequired && !currentPhase.humanCheckDone ? (
            <div className="deepBuildModePanel__check">
              <span>ここは人間確認が必要です</span>
              <p>自動で完了扱いにせず、人間が確認してから次へ進めます。</p>
            </div>
          ) : null}
          {currentPhase.completionCandidate ? (
            <div className="deepBuildModePanel__candidate">
              <span>🏁 完了候補</span>
              <p>このPhaseは完了候補です。確認して次へ進みますか？</p>
              <button
                type="button"
                className="deepBuildModePanel__confirmBtn"
                onClick={() => confirmHumanCheck(currentPhase.id)}
              >
                完了を確認する
              </button>
            </div>
          ) : null}
          {currentPhase.prUrl ? (
            <a href={currentPhase.prUrl} target="_blank" rel="noreferrer" className="deepBuildModePanel__link">
              🔗 PRを見る
            </a>
          ) : null}
          {currentPhase.issueUrl ? (
            <a href={currentPhase.issueUrl} target="_blank" rel="noreferrer" className="deepBuildModePanel__link">
              📝 Issueを見る
            </a>
          ) : null}
          {currentPhase.previewUrl ? (
            <a href={currentPhase.previewUrl} target="_blank" rel="noreferrer" className="deepBuildModePanel__link">
              🌐 Previewを開く
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="deepBuildModePanel__progress" aria-label="熟成進捗">
        <div>
          <span>進み具合</span>
          <strong>{progress?.done ?? 0}/{progress?.total ?? 0}</strong>
        </div>
        <div className="deepBuildModePanel__bar" aria-hidden="true">
          <i style={{ width: `${progress?.percent ?? 0}%` }} />
        </div>
      </div>

      <div className="deepBuildModePanel__actions">
        <button type="button" className="deepBuildModePanel__primary" onClick={advanceLocal}>
          ローカルで1段階進める
        </button>
        <button type="button" className="deepBuildModePanel__secondary" onClick={resetPlan}>
          リセット
        </button>
      </div>

      {hasReviewItems ? (
        <div className="deepBuildModePanel__check">
          <span>確認が必要なこと</span>
          {[...(judgement?.blocking ?? []), ...(judgement?.missing ?? [])].map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}

      <details className="deepBuildModePanel__details">
        <summary>内部の熟成Phaseを見る</summary>
        <ol>
          {plan.phases.map((phase) => (
            <li key={phase.id}>
              <strong>{phase.title}</strong>
              <span>{phase.status}</span>
              {phase.humanCheckRequired ? <span className="deepBuildModePanel__candidateBadge">人間確認</span> : null}
              {phase.completionCandidate ? <span className="deepBuildModePanel__candidateBadge">完了候補</span> : null}
              <p>{phase.purpose}</p>
              <details>
                <summary>Agent指示と完了条件</summary>
                <p>{phase.agentInstruction}</p>
                <ul>
                  {phase.doneWhen.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
