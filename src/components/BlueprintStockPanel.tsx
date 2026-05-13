import React, { useState, useEffect } from 'react';
import {
  type DarakeBlueprint,
  loadBlueprintStock,
  addBlueprint,
  deleteBlueprint,
  createTasksFromBlueprint,
} from '../utils/darakeBlueprintStock';
import { createSleepSessionFromQueue } from '../utils/darakeSleepSession';

function BlueprintCard({
  blueprint,
  onDelete,
  onDecompose,
  onNightCandidate,
}: {
  blueprint: DarakeBlueprint;
  onDelete: (id: string) => void;
  onDecompose: (bp: DarakeBlueprint) => void;
  onNightCandidate: (bp: DarakeBlueprint) => void;
}) {
  return (
    <div className="blueprintStock__card">
      <div className="blueprintStock__cardHeader">
        <span className="blueprintStock__appName">{blueprint.appName}</span>
        <span className="blueprintStock__phaseCount">{blueprint.phases.length}フェーズ</span>
      </div>
      <div className="blueprintStock__oneLineIdea">{blueprint.oneLineIdea}</div>
      <div className="blueprintStock__cardActions">
        <button
          className="blueprintStock__btn blueprintStock__btn--primary"
          onClick={() => onNightCandidate(blueprint)}
        >
          今夜進める候補にする
        </button>
        <button
          className="blueprintStock__btn blueprintStock__btn--secondary"
          onClick={() => onDecompose(blueprint)}
        >
          タスクに分解する
        </button>
        <button
          className="blueprintStock__btn blueprintStock__btn--danger"
          onClick={() => onDelete(blueprint.id)}
        >
          削除
        </button>
      </div>
    </div>
  );
}

export function BlueprintStockPanel() {
  const [blueprints, setBlueprints] = useState<DarakeBlueprint[]>([]);
  const [message, setMessage] = useState('');
  const [appName, setAppName] = useState('');
  const [oneLineIdea, setOneLineIdea] = useState('');
  const [phaseTitle, setPhaseTitle] = useState('');
  const [phaseGoal, setPhaseGoal] = useState('');
  const [mustNotDo, setMustNotDo] = useState('');

  useEffect(() => {
    setBlueprints(loadBlueprintStock());
  }, []);

  const refresh = () => setBlueprints(loadBlueprintStock());

  const handleDecompose = (bp: DarakeBlueprint) => {
    createTasksFromBlueprint(bp);
    setMessage('タスクキューに追加しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleNightCandidate = (bp: DarakeBlueprint) => {
    const tasks = createTasksFromBlueprint(bp);
    createSleepSessionFromQueue(
      tasks.map((t) => t.id),
      `今夜: ${bp.appName}`
    );
    setMessage(`「${bp.appName}」を今夜のセッションに追加しました`);
    setTimeout(() => setMessage(''), 3000);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteBlueprint(id);
    refresh();
  };

  const handleAdd = () => {
    if (!appName.trim() || !oneLineIdea.trim()) return;
    addBlueprint({
      appName: appName.trim(),
      oneLineIdea: oneLineIdea.trim(),
      mvp: [],
      mustHave: [],
      mustNotDo: mustNotDo ? mustNotDo.split('\n').filter(Boolean) : [],
      phases: phaseTitle
        ? [{ id: 'phase-1', title: phaseTitle.trim(), goal: phaseGoal.trim(), doneDefinition: '', suggestedTasks: [] }]
        : [],
      hardStops: [],
    });
    setAppName('');
    setOneLineIdea('');
    setPhaseTitle('');
    setPhaseGoal('');
    setMustNotDo('');
    refresh();
    setMessage('設計図を保存しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFillDemo = () => {
    setAppName('だらけメモアプリ');
    setOneLineIdea('シンプルな音声メモを毎日続けられるアプリ');
    setPhaseTitle('MVP: 録音＆再生');
    setPhaseGoal('音声メモを録音・再生できる');
    setMustNotDo('課金機能\nSNSシェア');
  };

  return (
    <div className="blueprintStock">
      <div className="blueprintStock__header">
        <h2 className="blueprintStock__title">設計図ストック</h2>
        <span className="blueprintStock__count">{blueprints.length}件</span>
      </div>

      {message && (
        <div className="blueprintStock__message">{message}</div>
      )}

      {blueprints.length === 0 && (
        <div className="blueprintStock__empty">設計図がまだありません</div>
      )}

      {blueprints.map((bp) => (
        <BlueprintCard
          key={bp.id}
          blueprint={bp}
          onDelete={handleDelete}
          onDecompose={handleDecompose}
          onNightCandidate={handleNightCandidate}
        />
      ))}

      <div className="blueprintStock__addForm">
        <h3 className="blueprintStock__formTitle">現在のフォームから設計図を保存</h3>
        <button
          className="blueprintStock__btn blueprintStock__btn--demo"
          onClick={handleFillDemo}
        >
          デモデータを入力
        </button>
        <input
          className="blueprintStock__input"
          type="text"
          placeholder="アプリ名"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />
        <input
          className="blueprintStock__input"
          type="text"
          placeholder="一行アイデア"
          value={oneLineIdea}
          onChange={(e) => setOneLineIdea(e.target.value)}
        />
        <input
          className="blueprintStock__input"
          type="text"
          placeholder="フェーズタイトル（任意）"
          value={phaseTitle}
          onChange={(e) => setPhaseTitle(e.target.value)}
        />
        <input
          className="blueprintStock__input"
          type="text"
          placeholder="フェーズのゴール（任意）"
          value={phaseGoal}
          onChange={(e) => setPhaseGoal(e.target.value)}
        />
        <textarea
          className="blueprintStock__textarea"
          placeholder="やらないこと（改行区切り）"
          value={mustNotDo}
          onChange={(e) => setMustNotDo(e.target.value)}
          rows={3}
        />
        <button
          className="blueprintStock__btn blueprintStock__btn--primary"
          onClick={handleAdd}
        >
          設計図を保存
        </button>
      </div>
    </div>
  );
}
