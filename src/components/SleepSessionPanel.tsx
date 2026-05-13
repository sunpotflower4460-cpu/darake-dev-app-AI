import React, { useState, useEffect } from 'react';
import {
  type DarakeSleepSession,
  loadSleepSessions,
  createSleepSessionFromQueue,
  markSleepSessionMorningReady,
} from '../utils/darakeSleepSession';
import {
  loadDarakeTaskQueue,
  type DarakeTask,
} from '../utils/darakeTaskQueue';
import {
  buildCockpitMorningReport,
  saveMorningReport,
} from '../utils/darakeCockpitMorningReport';

const SESSION_STATUS_LABELS: Record<DarakeSleepSession['status'], string> = {
  draft: '下書き',
  ready: '準備完了',
  running: '進行中',
  paused: '一時停止',
  'morning-ready': '朝レポート準備完了',
  done: '完了',
};

const SESSION_STATUS_TONES: Record<DarakeSleepSession['status'], string> = {
  draft: 'gray',
  ready: 'blue',
  running: 'green',
  paused: 'amber',
  'morning-ready': 'green',
  done: 'gray',
};

export function SleepSessionPanel() {
  const [sessions, setSessions] = useState<DarakeSleepSession[]>([]);
  const [queuedTasks, setQueuedTasks] = useState<DarakeTask[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [maxTasks, setMaxTasks] = useState(5);
  const [maxAutoFix, setMaxAutoFix] = useState(3);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSessions(loadSleepSessions());
    setQueuedTasks(loadDarakeTaskQueue().filter((t) => t.status === 'queued'));
  }, []);

  const refresh = () => {
    setSessions(loadSleepSessions());
    setQueuedTasks(loadDarakeTaskQueue().filter((t) => t.status === 'queued'));
  };

  const handleCreateSession = () => {
    createSleepSessionFromQueue(selectedTaskIds, title || undefined);
    setSelectedTaskIds([]);
    setTitle('');
    refresh();
    setMessage('セッションを作成しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleTask = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleMorningReport = (session: DarakeSleepSession) => {
    const allTasks = loadDarakeTaskQueue();
    const sessionTasks = allTasks.filter((t) => session.taskIds.includes(t.id));
    const report = buildCockpitMorningReport(sessionTasks, session);
    saveMorningReport(report);
    markSleepSessionMorningReady(session.id);
    refresh();
    setMessage('朝レポートを作成しました');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="sleepSession">
      <div className="sleepSession__header">
        <h2 className="sleepSession__title">今夜進めるもの</h2>
      </div>

      <div className="sleepSession__note">
        このセッション定義をもとに、Worker/Cron連携で裏巡回できます。
      </div>

      {message && (
        <div className="sleepSession__message">{message}</div>
      )}

      {sessions.length === 0 && (
        <div className="sleepSession__empty">セッションがまだありません</div>
      )}

      {sessions.map((session) => {
        const tone = SESSION_STATUS_TONES[session.status];
        return (
          <div key={session.id} className={`sleepSession__card sleepSession__card--${tone}`}>
            <div className="sleepSession__cardHeader">
              <span className="sleepSession__sessionTitle">{session.title}</span>
              <span className={`sleepSession__statusBadge sleepSession__statusBadge--${tone}`}>
                {SESSION_STATUS_LABELS[session.status]}
              </span>
            </div>
            <div className="sleepSession__cardMeta">
              タスク: {session.taskIds.length}件
            </div>
            <div className="sleepSession__cardActions">
              <button
                className="sleepSession__btn sleepSession__btn--primary"
                onClick={() => handleMorningReport(session)}
              >
                朝レポートを作る
              </button>
            </div>
          </div>
        );
      })}

      <div className="sleepSession__createForm">
        <h3 className="sleepSession__formTitle">セッション作成</h3>
        <input
          className="sleepSession__input"
          type="text"
          placeholder="セッションタイトル（任意）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="sleepSession__numberRow">
          <label className="sleepSession__label">
            最大タスク数
            <input
              className="sleepSession__numberInput"
              type="number"
              min={1}
              max={20}
              value={maxTasks}
              onChange={(e) => setMaxTasks(Number(e.target.value))}
            />
          </label>
          <label className="sleepSession__label">
            最大自動修正回数
            <input
              className="sleepSession__numberInput"
              type="number"
              min={1}
              max={10}
              value={maxAutoFix}
              onChange={(e) => setMaxAutoFix(Number(e.target.value))}
            />
          </label>
        </div>

        {queuedTasks.length > 0 && (
          <div className="sleepSession__taskPicker">
            <div className="sleepSession__taskPickerLabel">追加するタスクを選ぶ</div>
            {queuedTasks.map((t) => (
              <label key={t.id} className="sleepSession__taskCheckbox">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(t.id)}
                  onChange={() => handleToggleTask(t.id)}
                />
                {t.title}
              </label>
            ))}
          </div>
        )}

        <button
          className="sleepSession__btn sleepSession__btn--create"
          onClick={handleCreateSession}
        >
          セッション作成
        </button>
      </div>
    </div>
  );
}
