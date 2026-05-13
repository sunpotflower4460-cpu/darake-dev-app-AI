import React, { useState, useEffect } from 'react';
import {
  type DarakeTask,
  type DarakeTaskKind,
  loadDarakeTaskQueue,
  saveDarakeTaskQueue,
  addDarakeTask,
  moveTaskToAskLater,
  moveTaskToBlockedHard,
  getTaskStatusLabel,
  getTaskStatusTone,
} from '../utils/darakeTaskQueue';

const KIND_LABELS: Record<DarakeTaskKind, string> = {
  blueprint: '設計図',
  'issue-create': 'Issue作成',
  'agent-run': 'Agent実行',
  'pr-watch': 'PR監視',
  'ci-fix': 'CI修正',
  'merge-review': 'マージ確認',
  'post-merge-check': 'マージ後確認',
  'manual-note': 'メモ',
};

function TaskCard({
  task,
  onMoveAskLater,
  onMoveBlockedHard,
}: {
  task: DarakeTask;
  onMoveAskLater: (id: string) => void;
  onMoveBlockedHard: (id: string) => void;
}) {
  const tone = getTaskStatusTone(task.status);
  return (
    <div className={`darakeTaskQueue__card darakeTaskQueue__card--${tone}`}>
      <div className="darakeTaskQueue__cardHeader">
        <span className="darakeTaskQueue__taskTitle">{task.title}</span>
        <span className="darakeTaskQueue__kindBadge">{KIND_LABELS[task.kind]}</span>
      </div>
      <div className="darakeTaskQueue__cardMeta">
        <span className={`darakeTaskQueue__statusLabel darakeTaskQueue__statusLabel--${tone}`}>
          {getTaskStatusLabel(task.status)}
        </span>
        {task.appName && (
          <span className="darakeTaskQueue__appName">{task.appName}</span>
        )}
      </div>
      {(task.status === 'queued' || task.status === 'running') && (
        <div className="darakeTaskQueue__cardActions">
          <button
            className="darakeTaskQueue__btn darakeTaskQueue__btn--amber"
            onClick={() => onMoveAskLater(task.id)}
          >
            後で聞く
          </button>
          <button
            className="darakeTaskQueue__btn darakeTaskQueue__btn--red"
            onClick={() => onMoveBlockedHard(task.id)}
          >
            Hard Stopへ
          </button>
        </div>
      )}
      {task.laterReviewReason && (
        <div className="darakeTaskQueue__reason darakeTaskQueue__reason--amber">
          {task.laterReviewReason}
        </div>
      )}
      {task.hardBlockReason && (
        <div className="darakeTaskQueue__reason darakeTaskQueue__reason--red">
          {task.hardBlockReason}
        </div>
      )}
    </div>
  );
}

export function DarakeTaskQueuePanel() {
  const [tasks, setTasks] = useState<DarakeTask[]>([]);
  const [showDone, setShowDone] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newKind, setNewKind] = useState<DarakeTaskKind>('manual-note');

  useEffect(() => {
    setTasks(loadDarakeTaskQueue());
  }, []);

  const refresh = () => setTasks(loadDarakeTaskQueue());

  const handleMoveAskLater = (id: string) => {
    moveTaskToAskLater(id, '後で確認する予定');
    refresh();
  };

  const handleMoveBlockedHard = (id: string) => {
    moveTaskToBlockedHard(id, 'ブロック中');
    refresh();
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    addDarakeTask({
      title: newTitle.trim(),
      kind: newKind,
      status: 'queued',
      priority: 50,
    });
    setNewTitle('');
    refresh();
  };

  const handleMarkDone = (id: string) => {
    const current = loadDarakeTaskQueue();
    const updated = current.map((t) =>
      t.id === id
        ? { ...t, status: 'done' as const, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : t
    );
    saveDarakeTaskQueue(updated);
    refresh();
  };

  const running = tasks.filter((t) => t.status === 'running');
  const queued = tasks.filter((t) => t.status === 'queued');
  const askLater = tasks.filter((t) => t.status === 'ask-later');
  const blockedHard = tasks.filter((t) => t.status === 'blocked-hard');
  const done = tasks.filter((t) => t.status === 'done');

  const totalActive = running.length + queued.length + askLater.length + blockedHard.length;

  return (
    <div className="darakeTaskQueue">
      <div className="darakeTaskQueue__header">
        <h2 className="darakeTaskQueue__title">タスクキュー</h2>
        <span className="darakeTaskQueue__badge">{totalActive}</span>
      </div>

      {tasks.length === 0 && (
        <div className="darakeTaskQueue__empty">今やることはありません</div>
      )}

      {running.length > 0 && (
        <section className="darakeTaskQueue__section darakeTaskQueue__section--green">
          <h3 className="darakeTaskQueue__sectionTitle">進行中</h3>
          {running.map((t) => (
            <TaskCard key={t.id} task={t} onMoveAskLater={handleMoveAskLater} onMoveBlockedHard={handleMoveBlockedHard} />
          ))}
        </section>
      )}

      {queued.length > 0 && (
        <section className="darakeTaskQueue__section darakeTaskQueue__section--blue">
          <h3 className="darakeTaskQueue__sectionTitle">次に進めるもの</h3>
          {queued.map((t) => (
            <div key={t.id}>
              <TaskCard task={t} onMoveAskLater={handleMoveAskLater} onMoveBlockedHard={handleMoveBlockedHard} />
              <button
                className="darakeTaskQueue__btn darakeTaskQueue__btn--green"
                style={{ marginBottom: 8 }}
                onClick={() => handleMarkDone(t.id)}
              >
                完了にする
              </button>
            </div>
          ))}
        </section>
      )}

      {askLater.length > 0 && (
        <section className="darakeTaskQueue__section darakeTaskQueue__section--amber">
          <h3 className="darakeTaskQueue__sectionTitle">後で聞くこと</h3>
          {askLater.map((t) => (
            <TaskCard key={t.id} task={t} onMoveAskLater={handleMoveAskLater} onMoveBlockedHard={handleMoveBlockedHard} />
          ))}
        </section>
      )}

      {blockedHard.length > 0 && (
        <section className="darakeTaskQueue__section darakeTaskQueue__section--red">
          <h3 className="darakeTaskQueue__sectionTitle">Hard Stop</h3>
          {blockedHard.map((t) => (
            <TaskCard key={t.id} task={t} onMoveAskLater={handleMoveAskLater} onMoveBlockedHard={handleMoveBlockedHard} />
          ))}
        </section>
      )}

      {done.length > 0 && (
        <section className="darakeTaskQueue__section darakeTaskQueue__section--gray">
          <div className="darakeTaskQueue__sectionToggle">
            <h3 className="darakeTaskQueue__sectionTitle">完了 ({done.length}件)</h3>
            <button
              className="darakeTaskQueue__toggleBtn"
              onClick={() => setShowDone((v) => !v)}
            >
              {showDone ? '隠す' : '表示'}
            </button>
          </div>
          {showDone && done.map((t) => (
            <TaskCard key={t.id} task={t} onMoveAskLater={handleMoveAskLater} onMoveBlockedHard={handleMoveBlockedHard} />
          ))}
        </section>
      )}

      <div className="darakeTaskQueue__addForm">
        <h3 className="darakeTaskQueue__sectionTitle">タスク追加</h3>
        <input
          className="darakeTaskQueue__input"
          type="text"
          placeholder="タスク名"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <select
          className="darakeTaskQueue__select"
          value={newKind}
          onChange={(e) => setNewKind(e.target.value as DarakeTaskKind)}
        >
          {(Object.keys(KIND_LABELS) as DarakeTaskKind[]).map((k) => (
            <option key={k} value={k}>{KIND_LABELS[k]}</option>
          ))}
        </select>
        <button
          className="darakeTaskQueue__btn darakeTaskQueue__btn--primary"
          onClick={handleAddTask}
        >
          タスク追加
        </button>
      </div>
    </div>
  );
}
