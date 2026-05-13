import { useEffect, useMemo, useState } from 'react';
import { loadDarakeTaskQueue } from '../utils/darakeTaskQueue';
import { loadBlueprintStock } from '../utils/darakeBlueprintStock';
import { loadCockpitMorningReports } from '../utils/darakeCockpitMorningReport';
import { loadGentleAppStartForm } from '../utils/gentleAppStartForm';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { requestDarakeNavGroupChange } from '../utils/darakeNavGroupChange';

export function DarakeCompactCockpitPanel() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const form = useMemo(() => loadGentleAppStartForm(), [revision]);
  const blueprints = useMemo(() => loadBlueprintStock(), [revision]);
  const tasks = useMemo(() => loadDarakeTaskQueue(), [revision]);
  const reports = useMemo(() => loadCockpitMorningReports(), [revision]);

  const appName =
    form?.appName?.trim() ||
    blueprints[0]?.appName ||
    null;
  const oneLineIdea =
    form?.oneLineIdea?.trim() ||
    blueprints[0]?.oneLineIdea ||
    null;

  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;

  const queued = tasks.filter((t) => t.status === 'queued').length;
  const askLater = tasks.filter((t) => t.status === 'ask-later').length;
  const blockedHard = tasks.filter((t) => t.status === 'blocked-hard').length;
  const done = tasks.filter((t) => t.status === 'done').length;

  let nextAction: string;
  if (blockedHard > 0) {
    nextAction = 'Hard Stopを確認してください';
  } else if (askLater > 0) {
    nextAction = '後で聞くことを確認してください';
  } else if (queued > 0) {
    nextAction = 'タスクキューに進める作業があります';
  } else if (latestReport) {
    nextAction = latestReport.nextRecommendedAction ?? '朝レポートを確認してください';
  } else {
    nextAction = '設計図からタスクを作ってみましょう';
  }

  return (
    <div className="darakeCompactCockpit">
      <div className="darakeCompactCockpit__header">
        <span className="darakeCompactCockpit__badge">管制室</span>
        <h2 className="darakeCompactCockpit__appName">
          {appName ?? 'アプリ名未設定'}
        </h2>
        {oneLineIdea && (
          <p className="darakeCompactCockpit__idea">{oneLineIdea}</p>
        )}
      </div>

      <div className="darakeCompactCockpit__next">
        <span className="darakeCompactCockpit__nextLabel">次に見るもの</span>
        <span className="darakeCompactCockpit__nextAction">{nextAction}</span>
      </div>

      <div className="darakeCompactCockpit__counts">
        <div className={`darakeCompactCockpit__count ${queued > 0 ? 'darakeCompactCockpit__count--active' : ''}`}>
          <span className="darakeCompactCockpit__countNum">{queued}</span>
          <span className="darakeCompactCockpit__countLabel">キュー</span>
        </div>
        <div className={`darakeCompactCockpit__count ${askLater > 0 ? 'darakeCompactCockpit__count--warn' : ''}`}>
          <span className="darakeCompactCockpit__countNum">{askLater}</span>
          <span className="darakeCompactCockpit__countLabel">後で聞く</span>
        </div>
        <div className={`darakeCompactCockpit__count ${blockedHard > 0 ? 'darakeCompactCockpit__count--danger' : ''}`}>
          <span className="darakeCompactCockpit__countNum">{blockedHard}</span>
          <span className="darakeCompactCockpit__countLabel">Hard Stop</span>
        </div>
        <div className="darakeCompactCockpit__count">
          <span className="darakeCompactCockpit__countNum">{done}</span>
          <span className="darakeCompactCockpit__countLabel">完了</span>
        </div>
      </div>

      <div className="darakeCompactCockpit__actions">
        {/* タスクキュー（run グループ）へ */}
        <button
          type="button"
          className="darakeCompactCockpit__btn"
          onClick={() => requestDarakeNavGroupChange('run')}
        >
          タスクを見る
        </button>
        {/* 今夜進めるもの／スリープセッション（run グループ）へ */}
        <button
          type="button"
          className="darakeCompactCockpit__btn"
          onClick={() => requestDarakeNavGroupChange('run')}
        >
          今夜進めるものを見る
        </button>
        <button
          type="button"
          className="darakeCompactCockpit__btn darakeCompactCockpit__btn--secondary"
          onClick={() => requestDarakeNavGroupChange('reports')}
        >
          朝レポート
        </button>
        <button
          type="button"
          className="darakeCompactCockpit__btn darakeCompactCockpit__btn--secondary"
          onClick={() => requestDarakeNavGroupChange('all')}
        >
          詳細を開く
        </button>
      </div>
    </div>
  );
}
