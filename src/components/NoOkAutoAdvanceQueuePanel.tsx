import { useState } from 'react';
import { ListChecks, Copy, Check, Plus, Trash2, Play } from 'lucide-react';
import {
  loadAutoAdvanceQueue,
  saveAutoAdvanceQueue,
  buildAutoAdvanceTask,
  runLocalAutoAdvanceSimulation,
  summarizeAutoAdvanceQueue,
  formatAutoAdvanceQueueMarkdown,
  TASK_TYPE_LABELS,
  TASK_STATUS_ICONS,
} from '../utils/noOkAutoAdvanceQueue';
import type {
  AutoAdvanceTask,
  AutoAdvanceTaskType,
  AutoAdvanceTaskStatus,
} from '../utils/noOkAutoAdvanceQueue';

type CopyState = 'idle' | 'copied' | 'failed';

const TASK_TYPES: AutoAdvanceTaskType[] = [
  'generate-report',
  'generate-dry-run',
  'generate-prompt-pack',
  'generate-cloud-agent-instruction',
  'generate-notification-draft',
  'update-readiness-gate',
  'update-safety-audit',
  'update-next-action',
];

const STATUS_ORDER: AutoAdvanceTaskStatus[] = [
  'blocked',
  'needs-human',
  'queued',
  'auto-completed',
  'skipped-by-policy',
];

export function NoOkAutoAdvanceQueuePanel() {
  const [tasks, setTasks] = useState(() => loadAutoAdvanceQueue());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AutoAdvanceTaskType>('generate-report');

  function save(updated: AutoAdvanceTask[]) {
    saveAutoAdvanceQueue(updated);
    setTasks(updated);
  }

  function handleAddTask() {
    if (!newTitle.trim()) return;
    const task = buildAutoAdvanceTask({ type: newType, title: newTitle.trim() });
    save([task, ...tasks]);
    setNewTitle('');
  }

  function handleRunSimulation() {
    save(runLocalAutoAdvanceSimulation(tasks));
  }

  function handleDeleteTask(id: string) {
    save(tasks.filter((t) => t.id !== id));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAutoAdvanceQueueMarkdown(tasks));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const grouped = STATUS_ORDER.reduce<Record<AutoAdvanceTaskStatus, AutoAdvanceTask[]>>(
    (acc, s) => ({ ...acc, [s]: [] }),
    {} as Record<AutoAdvanceTaskStatus, AutoAdvanceTask[]>
  );
  tasks.forEach((t) => grouped[t.status].push(t));

  const counts = {
    'auto-completed': grouped['auto-completed'].length,
    'queued': grouped['queued'].length,
    'blocked': grouped['blocked'].length,
    'needs-human': grouped['needs-human'].length,
    'skipped-by-policy': grouped['skipped-by-policy'].length,
  };

  return (
    <div className="phase34Panel">
      <div className="phase34Hero">
        <ListChecks />
        <div>
          <p className="eyebrow">Phase 34 / 34.1</p>
          <h3>No-OK Auto Advance Queue</h3>
          <p>OKなしで進めてよいlocal taskを自動完了扱いにします。外部実行は一切しません。</p>
        </div>
      </div>

      <div className="phase34SafetyBox">
        ⛔ 外部実行しません。local / draft 生成・判定・記録のみ。GitHub API・外部API・secret保存なし。
      </div>

      <div className="phase34SummaryGrid">
        <section><h4>自動完了</h4><p>{counts['auto-completed']}</p></section>
        <section><h4>queued</h4><p>{counts['queued']}</p></section>
        <section><h4>blocked</h4><p>{counts['blocked']}</p></section>
        <section><h4>人間必要</h4><p>{counts['needs-human']}</p></section>
        <section><h4>スキップ</h4><p>{counts['skipped-by-policy']}</p></section>
      </div>

      <div className="phase34Section">
        <h4>タスクを追加</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            className="phase34Input"
            placeholder="タイトル *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <select
            className="phase34Select"
            value={newType}
            onChange={(e) => setNewType(e.target.value as AutoAdvanceTaskType)}
          >
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <button className="phase34SmallBtn" onClick={handleAddTask}>
            <Plus size={13} /> 追加
          </button>
        </div>
      </div>

      <div className="phase34BtnRow">
        <button className="phase34SmallBtn" onClick={handleRunSimulation}>
          <Play size={13} /> ローカル自動進行シミュレーション
        </button>
      </div>

      {tasks.length === 0 && (
        <div className="phase34Section">
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            タスクがありません。上のフォームから追加してください。
          </p>
        </div>
      )}

      {summarizeAutoAdvanceQueue(tasks) && tasks.length > 0 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          {summarizeAutoAdvanceQueue(tasks)}
        </div>
      )}

      {STATUS_ORDER.map((status) => {
        const group = grouped[status];
        if (group.length === 0) return null;
        return (
          <div key={status} className="phase34Section">
            <h4>
              {TASK_STATUS_ICONS[status]} {status} ({group.length}件)
            </h4>
            <div style={{ display: 'grid', gap: 8 }}>
              {group.map((task) => (
                <div key={task.id} className={`phase34TaskCard ${task.status}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`phase34StatusBadge ${task.status}`}>
                      {TASK_STATUS_ICONS[task.status]} {task.status}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{task.title}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                    {TASK_TYPE_LABELS[task.type]}
                  </div>
                  {task.reason && (
                    <div style={{ fontSize: '0.78rem' }}>reason: {task.reason}</div>
                  )}
                  {task.outputSummary && (
                    <div style={{ fontSize: '0.78rem', color: '#1a5a30' }}>{task.outputSummary}</div>
                  )}
                  {task.blockers.length > 0 && (
                    <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: '0.76rem', color: '#8b2020' }}>
                      {task.blockers.map((b, i) => <li key={i}>🚫 {b}</li>)}
                    </ul>
                  )}
                  {task.warnings.length > 0 && (
                    <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: '0.76rem', color: '#8a5e12' }}>
                      {task.warnings.map((w, i) => <li key={i}>⚠️ {w}</li>)}
                    </ul>
                  )}
                  <button
                    className="phase34SmallBtn"
                    style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#992020', borderColor: 'rgba(220,80,80,0.3)' }}
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 size={11} /> 削除
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {tasks.length > 0 && (
        <div className="phase34BtnRow">
          <button className={`phase34CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
            {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} 全MDコピー
          </button>
        </div>
      )}
    </div>
  );
}
