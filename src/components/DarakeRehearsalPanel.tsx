import React, { useState } from 'react';
import { addBlueprint, createTasksFromBlueprint } from '../utils/darakeBlueprintStock';
import {
  updateDarakeTask,
  moveTaskToAskLater,
  moveTaskToBlockedHard,
} from '../utils/darakeTaskQueue';
import { createSleepSessionFromQueue } from '../utils/darakeSleepSession';
import {
  buildCockpitMorningReport,
  saveMorningReport,
} from '../utils/darakeCockpitMorningReport';
import { loadDarakeTaskQueue } from '../utils/darakeTaskQueue';

const REHEARSAL_STEPS = [
  'モックの設計図を作成',
  '設計図からタスクを生成（Blueprint / Issue作成 / Agent実行 / PR監視 / マージ後確認）',
  '1つのタスクを「完了」にマーク',
  '1つのタスクを「後で聞く」に移動',
  '1つのタスクを「Hard Stop」にマーク',
  '今夜のSleepSessionを作成',
  '朝レポートを生成・保存',
];

export function DarakeRehearsalPanel() {
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);

  const handleRehearsal = () => {
    setRunning(true);

    const bp = addBlueprint({
      appName: 'リハーサルアプリ',
      oneLineIdea: 'だらけ実地リハーサル用のモックアプリ',
      targetUser: 'だらけ開発者',
      platform: 'iOS',
      mvp: ['録音・再生'],
      mustHave: ['シンプルUI'],
      mustNotDo: ['課金機能', 'SNS連携'],
      phases: [
        {
          id: 'phase-1',
          title: 'MVP: 録音・再生',
          goal: '音声を録音・再生できる',
          doneDefinition: 'TestFlightで動作確認済み',
          suggestedTasks: ['音声録音UI', '再生機能'],
        },
        {
          id: 'phase-2',
          title: '品質改善',
          goal: 'クラッシュゼロ',
          doneDefinition: '1週間クラッシュなし',
          suggestedTasks: ['クラッシュ修正', 'メモリ最適化'],
        },
      ],
      hardStops: ['個人情報収集は絶対にしない'],
      notes: 'リハーサル用データ',
    });

    const tasks = createTasksFromBlueprint(bp);

    if (tasks.length >= 1) {
      updateDarakeTask(tasks[0].id, {
        status: 'done',
        completedAt: new Date().toISOString(),
      });
    }
    if (tasks.length >= 2) {
      moveTaskToAskLater(tasks[1].id, '依存するIssueが未解決');
    }
    if (tasks.length >= 3) {
      moveTaskToBlockedHard(tasks[2].id, 'CIが赤い・手動対応が必要');
    }

    const session = createSleepSessionFromQueue(
      tasks.map((t) => t.id),
      'リハーサルセッション'
    );

    const allTasks = loadDarakeTaskQueue();
    const sessionTasks = allTasks.filter((t) => session.taskIds.includes(t.id));
    const report = buildCockpitMorningReport(sessionTasks, session);
    saveMorningReport(report);

    setRunning(false);
    setDone(true);
  };

  return (
    <div className="darakeRehearsal">
      <div className="darakeRehearsal__header">
        <h2 className="darakeRehearsal__title">だらけ実地リハーサル</h2>
      </div>

      <div className="darakeRehearsal__description">
        ワンクリックでリハーサルデータを作成します。Task Queue / Sleep Session / 朝レポートの動作を確認できます。
      </div>

      <div className="darakeRehearsal__steps">
        <div className="darakeRehearsal__stepsTitle">リハーサルでシミュレートすること：</div>
        <ol className="darakeRehearsal__stepList">
          {REHEARSAL_STEPS.map((step, i) => (
            <li key={i} className="darakeRehearsal__stepItem">{step}</li>
          ))}
        </ol>
      </div>

      {!done ? (
        <button
          className="darakeRehearsal__btn"
          onClick={handleRehearsal}
          disabled={running}
        >
          {running ? '作成中...' : 'だらけ実地リハーサルを作る'}
        </button>
      ) : (
        <div className="darakeRehearsal__result">
          リハーサルデータを作成しました。{'\n'}
          Task Queue / Sleep Session / Morning Report を確認してください。
        </div>
      )}
    </div>
  );
}
