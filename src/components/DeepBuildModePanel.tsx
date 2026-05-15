import { useEffect, useMemo, useState } from 'react';
import { buildDeepBuildPlan } from '../utils/buildDeepBuildPlan';
import { judgeDeepBuildCompletion, getDeepBuildProgress } from '../utils/deepBuildCompletionJudge';
import { clearDeepBuildPlan, loadDeepBuildPlan, saveDeepBuildPlan } from '../utils/deepBuildPlanStorage';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { loadGentleAppStartForm } from '../utils/gentleAppStartForm';
import type { DeepBuildPlan } from '../utils/deepBuildPlan';

function buildPlanSource(): { appName: string; oneLineIdea: string } {
  const form = loadGentleAppStartForm();
  return {
    appName: form?.appName?.trim() || '宝地図アプリ',
    oneLineIdea:
      form?.oneLineIdea?.trim() ||
      '自分の夢や目標を宝の地図みたいに置いて、AIが次の一歩にしてくれるアプリ',
  };
}

function advanceOneLocalPhase(plan: DeepBuildPlan): DeepBuildPlan {
  const nextPhases = plan.phases.map((phase) => ({ ...phase }));
  const targetIndex = nextPhases.findIndex((phase) => phase.status !== 'done');

  if (targetIndex === -1) {
    return {
      ...plan,
      overallStatus: 'reviewing',
    };
  }

  nextPhases[targetIndex] = {
    ...nextPhases[targetIndex],
    status: 'done',
  };

  const nextTarget = nextPhases.find((phase) => phase.status !== 'done');
  if (nextTarget && nextTarget.status === 'planned') {
    nextTarget.status = 'issue-ready';
  }

  const allDone = nextPhases.every((phase) => phase.status === 'done');

  return {
    ...plan,
    phases: nextPhases,
    currentPhaseId: nextTarget?.id,
    overallStatus: allDone ? 'reviewing' : 'building',
  };
}

export function DeepBuildModePanel() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const plan = useMemo(() => loadDeepBuildPlan(), [revision]);
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

      {(judgement?.missing.length || judgement?.blocking.length) ? (
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
