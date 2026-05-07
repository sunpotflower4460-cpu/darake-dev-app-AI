import { useEffect, useMemo, useState, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  loadOrInitDarakeAutopilotState,
  saveDarakeAutopilotState,
  INITIAL_AUTOPILOT_STATE,
} from '../utils/darakeAutopilotState';
import type { DarakeAutopilotState } from '../utils/darakeAutopilotState';
import { runDarakeAutopilot } from '../utils/runDarakeAutopilot';
import {
  startAutopilotPoller,
  loadAutopilotPollerSettings,
  saveAutopilotPollerSettings,
} from '../utils/autopilotPoller';
import type { AutopilotPollerHandle } from '../utils/autopilotPoller';
import { getLatestUnresolvedWakeItem, resolveWakeItem } from '../utils/darakeWakeQueue';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function DarakeAutopilotPanel() {
  const [revision, setRevision] = useState(0);
  const [running, setRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const pollerRef = useRef<AutopilotPollerHandle | null>(null);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const state = useMemo<DarakeAutopilotState>(
    () => loadOrInitDarakeAutopilotState(),
    [revision],
  );

  const pollerSettings = useMemo(() => loadAutopilotPollerSettings(), [revision]);

  const wakeItem = useMemo(() => getLatestUnresolvedWakeItem(), [revision]);

  // Start/stop poller based on settings
  useEffect(() => {
    if (!state.enabled || state.status === 'off') {
      pollerRef.current?.stop();
      pollerRef.current = null;
      return;
    }

    if (!pollerRef.current) {
      pollerRef.current = startAutopilotPoller();
    }

    return () => {
      pollerRef.current?.stop();
      pollerRef.current = null;
    };
  }, [state.enabled, state.status]);

  async function handleStart() {
    if (running) return;
    setRunning(true);
    try {
      await runDarakeAutopilot();
      setRevision((v) => v + 1);
    } finally {
      setRunning(false);
    }
  }

  function handleResolveWake() {
    if (wakeItem) {
      resolveWakeItem(wakeItem.id);
      setRevision((v) => v + 1);
    }
  }

  function handleTogglePoller() {
    const updated = { ...pollerSettings, enabled: !pollerSettings.enabled };
    saveAutopilotPollerSettings(updated);
    if (!updated.enabled) {
      pollerRef.current?.stop();
      pollerRef.current = null;
    } else {
      pollerRef.current?.stop();
      pollerRef.current = startAutopilotPoller();
    }
    setRevision((v) => v + 1);
  }

  function handleDisable() {
    saveDarakeAutopilotState({ ...state, status: 'off', enabled: false });
    pollerRef.current?.stop();
    pollerRef.current = null;
    setRevision((v) => v + 1);
  }

  function handleReset() {
    saveDarakeAutopilotState({ ...INITIAL_AUTOPILOT_STATE });
    setRevision((v) => v + 1);
  }

  const { status, userMessage, nextActionLabel, prUrl, appName, updatedAt } = state;

  // Idle / ready-to-start
  if (status === 'idle' || status === 'starting') {
    return (
      <div className="autopilotPanel">
        <div className="autopilotCard autopilotCard--idle">
          <div className="autopilotTitle">準備できています</div>
          {appName && <div className="autopilotAppName">{appName}</div>}
          <div className="autopilotNextLabel">
            次にやること：<span className="autopilotNextAction">{nextActionLabel}</span>
          </div>
        </div>
        <div className="autopilotBtnRow">
          <button
            type="button"
            className="autopilotBtnPrimary"
            onClick={handleStart}
            disabled={running}
          >
            {running ? '開始中...' : 'この内容で作り始める'}
          </button>
        </div>
        <div className="autopilotPollerNote">
          画面を開いている間だけ、自動で確認します。危ない操作はしません。
        </div>
      </div>
    );
  }

  // Working silently
  if (
    status === 'agent-working' ||
    status === 'watching-pr' ||
    status === 'waiting-for-checks' ||
    status === 'issue-creating'
  ) {
    return (
      <div className="autopilotPanel">
        <div className="autopilotCard autopilotCard--working">
          <div className="autopilotTitle">AIが作業中です</div>
          {appName && <div className="autopilotAppName">{appName}</div>}
          <div className="autopilotNextLabel">
            今やること：<span className="autopilotNextAction">何もしなくてOK</span>
          </div>
          {updatedAt && (
            <div className="autopilotCheckAt">
              最終確認：{new Date(updatedAt).toLocaleTimeString('ja-JP')}
            </div>
          )}
        </div>
        <div className="autopilotBtnRow">
          <button
            type="button"
            className="autopilotBtnSecondary"
            onClick={handleStart}
            disabled={running}
          >
            {running ? '確認中...' : 'いまの状態を確認する'}
          </button>
          <button
            type="button"
            className="autopilotBtnToggle"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? '詳細を閉じる' : '詳細を見る'}
          </button>
        </div>
        {showDetails && (
          <div className="autopilotDetails">
            <div className="autopilotDetailsRow">状態: {status}</div>
            {state.repoUrl && (
              <div className="autopilotDetailsRow">Repo: {state.repoUrl}</div>
            )}
            {state.issueUrl && (
              <div className="autopilotDetailsRow">
                Issue:{' '}
                <a href={state.issueUrl} target="_blank" rel="noopener noreferrer">
                  {state.issueUrl}
                </a>
              </div>
            )}
            {state.prUrl && (
              <div className="autopilotDetailsRow">
                PR:{' '}
                <a href={state.prUrl} target="_blank" rel="noopener noreferrer">
                  {state.prUrl}
                </a>
              </div>
            )}
            <div className="autopilotDetailsRow">
              修正試行: {state.autoFixAttempts} / {state.maxAutoFixAttempts}
            </div>
          </div>
        )}
        <div className="autopilotPollerRow">
          <span className="autopilotPollerNote">
            {pollerSettings.enabled
              ? '自動巡回: ON（画面を開いている間だけ）'
              : '自動巡回: OFF'}
          </span>
          <button
            type="button"
            className="autopilotBtnMicro"
            onClick={handleTogglePoller}
          >
            {pollerSettings.enabled ? '止める' : '再開'}
          </button>
        </div>
      </div>
    );
  }

  // Auto-fixing
  if (status === 'auto-fixing') {
    return (
      <div className="autopilotPanel">
        <div className="autopilotCard autopilotCard--fixing">
          <div className="autopilotTitle">AIに修正をお願いしました</div>
          {appName && <div className="autopilotAppName">{appName}</div>}
          <div className="autopilotNextLabel">
            今やること：<span className="autopilotNextAction">何もしなくてOK</span>
          </div>
          <div className="autopilotSubNote">次の確認まで待っています。</div>
          {updatedAt && (
            <div className="autopilotCheckAt">
              最終確認：{new Date(updatedAt).toLocaleTimeString('ja-JP')}
            </div>
          )}
        </div>
        <div className="autopilotBtnRow">
          <button
            type="button"
            className="autopilotBtnSecondary"
            onClick={handleStart}
            disabled={running}
          >
            {running ? '確認中...' : 'いまの状態を確認する'}
          </button>
          <button
            type="button"
            className="autopilotBtnToggle"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? '詳細を閉じる' : '詳細を見る'}
          </button>
        </div>
        {showDetails && (
          <div className="autopilotDetails">
            <div className="autopilotDetailsRow">{userMessage}</div>
            <div className="autopilotDetailsRow">
              修正試行: {state.autoFixAttempts} / {state.maxAutoFixAttempts}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Merge candidate
  if (status === 'merge-candidate') {
    return (
      <div className="autopilotPanel">
        <div className="autopilotCard autopilotCard--mergeCandidate">
          <div className="autopilotTitle autopilotTitle--success">マージ候補です</div>
          {appName && <div className="autopilotAppName">{appName}</div>}
          <div className="autopilotReason">PRは問題なさそうです。</div>
          <div className="autopilotNextLabel">
            次にやること：<span className="autopilotNextAction">PRを開いて確認してください</span>
          </div>
          <div className="autopilotSubNote">自動マージはしません。</div>
        </div>
        <div className="autopilotBtnRow">
          {prUrl && (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="autopilotBtnPrimary"
            >
              <ExternalLink size={16} /> PRを開く
            </a>
          )}
        </div>
        {wakeItem && !wakeItem.resolvedAt && (
          <div className="autopilotBtnRow">
            <button
              type="button"
              className="autopilotBtnMicro"
              onClick={handleResolveWake}
            >
              確認済みにする
            </button>
          </div>
        )}
        <div className="autopilotBtnRow">
          <button
            type="button"
            className="autopilotBtnMicro"
            onClick={handleReset}
          >
            最初からやり直す
          </button>
        </div>
      </div>
    );
  }

  // Needs human / blocked
  if (status === 'needs-human' || status === 'blocked') {
    return (
      <div className="autopilotPanel">
        <div className="autopilotCard autopilotCard--needsHuman">
          <div className="autopilotTitle autopilotTitle--caution">止まりました</div>
          {appName && <div className="autopilotAppName">{appName}</div>}
          <div className="autopilotReason">
            理由：{state.wakeReason ?? userMessage}
          </div>
          <div className="autopilotNextLabel">
            次にやること：<span className="autopilotNextAction">{nextActionLabel}</span>
          </div>
        </div>
        <div className="autopilotBtnRow">
          {prUrl && (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="autopilotBtnSecondary"
            >
              <ExternalLink size={14} /> 詳細を見る
            </a>
          )}
          <button
            type="button"
            className="autopilotBtnToggle"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? '詳細を閉じる' : '詳細を見る'}
          </button>
        </div>
        {showDetails && (
          <div className="autopilotDetails">
            <div className="autopilotDetailsRow">{userMessage}</div>
            {state.error && (
              <div className="autopilotDetailsRow autopilotDetailsRow--error">
                エラー: {state.error}
              </div>
            )}
          </div>
        )}
        <div className="autopilotBtnRow">
          <button
            type="button"
            className="autopilotBtnMicro"
            onClick={handleReset}
          >
            最初からやり直す
          </button>
        </div>
      </div>
    );
  }

  // Failed
  if (status === 'failed') {
    return (
      <div className="autopilotPanel">
        <div className="autopilotCard autopilotCard--failed">
          <div className="autopilotTitle autopilotTitle--caution">失敗しました</div>
          {appName && <div className="autopilotAppName">{appName}</div>}
          <div className="autopilotReason">{userMessage}</div>
        </div>
        <div className="autopilotBtnRow">
          <button
            type="button"
            className="autopilotBtnPrimary"
            onClick={handleReset}
          >
            最初からやり直す
          </button>
        </div>
      </div>
    );
  }

  // Off
  if (status === 'off') {
    return (
      <div className="autopilotPanel">
        <div className="autopilotCard autopilotCard--idle">
          <div className="autopilotTitle">自律運転はオフです</div>
        </div>
        <div className="autopilotBtnRow">
          <button
            type="button"
            className="autopilotBtnPrimary"
            onClick={handleReset}
          >
            自律運転をオンにする
          </button>
        </div>
      </div>
    );
  }

  // Done
  if (status === 'done') {
    return (
      <div className="autopilotPanel">
        <div className="autopilotCard autopilotCard--mergeCandidate">
          <div className="autopilotTitle autopilotTitle--success">完了しました</div>
          {appName && <div className="autopilotAppName">{appName}</div>}
          <div className="autopilotReason">{userMessage}</div>
        </div>
        <div className="autopilotBtnRow">
          <button
            type="button"
            className="autopilotBtnMicro"
            onClick={handleReset}
          >
            最初からやり直す
          </button>
          <button
            type="button"
            className="autopilotBtnMicro"
            onClick={handleDisable}
          >
            自律運転をオフにする
          </button>
        </div>
      </div>
    );
  }

  return null;
}
