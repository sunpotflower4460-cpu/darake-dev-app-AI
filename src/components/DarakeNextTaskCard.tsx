import React, { useState, useEffect } from 'react';
import {
  loadDarakeTaskQueue,
  getNextRunnableTask,
} from '../utils/darakeTaskQueue';

export function DarakeNextTaskCard() {
  const [nextTask, setNextTask] = useState<ReturnType<typeof getNextRunnableTask>>(null);
  const [hasOtherPending, setHasOtherPending] = useState(false);

  const checkTasks = () => {
    const tasks = loadDarakeTaskQueue();
    const next = getNextRunnableTask(tasks);
    setNextTask(next);
    const hasPending = tasks.some(
      (t) => t.status === 'ask-later' || t.status === 'blocked-hard'
    );
    setHasOtherPending(hasPending);
  };

  useEffect(() => {
    checkTasks();
    const interval = setInterval(checkTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="darakeNextTask">
      <h3 className="darakeNextTask__title">次のタスク</h3>
      {nextTask ? (
        <div className="darakeNextTask__card darakeNextTask__card--active">
          <div className="darakeNextTask__label">次に進めるもの</div>
          <div className="darakeNextTask__taskTitle">{nextTask.title}</div>
          <div className="darakeNextTask__kindBadge">{nextTask.kind}</div>
          <button
            className="darakeNextTask__btn"
            onClick={checkTasks}
          >
            次に進めるタスクを選ぶ
          </button>
        </div>
      ) : hasOtherPending ? (
        <div className="darakeNextTask__card darakeNextTask__card--pending">
          <div className="darakeNextTask__label">後で見るものがあります</div>
          <button className="darakeNextTask__btn" onClick={checkTasks}>
            次に進めるタスクを選ぶ
          </button>
        </div>
      ) : (
        <div className="darakeNextTask__card darakeNextTask__card--empty">
          <div className="darakeNextTask__label">今やることはありません</div>
        </div>
      )}
    </div>
  );
}
