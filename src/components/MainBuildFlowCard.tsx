import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { decideMainBuildFlowStep } from '../utils/mainBuildFlowController';
import { loadGentleAppStartForm, saveGentleAppStartForm, buildEmptyGentleAppStartForm } from '../utils/gentleAppStartForm';
import { loadOmakaseStartState } from '../utils/omakaseStartState';
import { loadAgentRunState } from '../utils/agentRunState';
import { loadAutoFixLoopState } from '../utils/autoFixLoopState';
import { loadOrInitDarakeAutopilotState } from '../utils/darakeAutopilotState';
import { loadPostMergeWatchState } from '../utils/postMergeWatch';
import { loadGitHubIssueCreateState } from '../utils/githubIssueCreateState';
import { loadGitHubStartSettings } from '../utils/githubStartSettings';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { runOmakaseStart } from '../utils/runOmakaseStart';
import { APP_PRESETS } from '../utils/appPresets';
import { fetchSetupStatus } from '../utils/setupStatusClient';
import { DarakeTestRunPanel } from './DarakeTestRunPanel';

type SetupOk = boolean | null;

function resolveRepoUrl(): string {
  return (
    loadGitHubIssueCreateState()?.repoUrl ??
    loadGitHubStartSettings()?.repoUrl ??
    ''
  );
}

function checkSetupFromCache(): SetupOk {
  try {
    const raw = sessionStorage.getItem('darake.setupOk.cache');
    if (raw === null) return null;
    return raw === 'true';
  } catch {
    return null;
  }
}

function saveSetupCache(ok: boolean): void {
  try {
    sessionStorage.setItem('darake.setupOk.cache', ok ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function MainBuildFlowCard() {
  const [revision, setRevision] = useState(0);
  const [setupOk, setSetupOk] = useState<SetupOk>(checkSetupFromCache);
  const [showDetails, setShowDetails] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  // Fetch setup status once on mount (and cache in sessionStorage)
  useEffect(() => {
    if (setupOk !== null) return; // already have a value
    fetchSetupStatus()
      .then((status) => {
        const ok =
          status.githubToken === 'set' &&
          status.githubIssueCreateEnabled &&
          status.allowedReposConfigured;
        setSetupOk(ok);
        saveSetupCache(ok);
      })
      .catch(() => {
        // If the Worker is unreachable, don't block the user
        setSetupOk(null);
      });
  }, []);

  const decision = useMemo(() => {
    const form = loadGentleAppStartForm();
    const omakase = loadOmakaseStartState();
    const agentRun = loadAgentRunState();
    const autoFixLoop = loadAutoFixLoopState();
    const autopilot = loadOrInitDarakeAutopilotState();
    const postMergeWatch = loadPostMergeWatchState();
    const repoUrl = resolveRepoUrl();

    return decideMainBuildFlowStep({
      form,
      omakase,
      agentRun,
      autoFixLoop,
      autopilot,
      postMergeWatch,
      repoUrl,
      setupOk,
    });
  }, [revision, setupOk]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleApplyPreset() {
    const preset = APP_PRESETS.find((p) => p.id === 'treasure-map-memo');
    if (!preset) return;
    const base = buildEmptyGentleAppStartForm();
    saveGentleAppStartForm({
      ...base,
      appName: preset.appName,
      oneLineIdea: preset.oneLineIdea,
      targetUser: preset.targetUser,
      platform: preset.platform as typeof base.platform,
      mainFeeling: preset.mainFeeling as typeof base.mainFeeling,
      firstGoal: preset.firstGoal as typeof base.firstGoal,
      uiTemplate: 'map-board',
      mustHave: preset.mustHave,
      mustNotDo: preset.mustNotDo,
      notes: preset.notes,
    });
  }

  async function handleStart() {
    setIsStarting(true);
    setStartError(null);
    try {
      await runOmakaseStart();
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : '不明なエラーが発生しました。',
      );
    } finally {
      setIsStarting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const { step } = decision;

  const isQuiet =
    step === 'starting' ||
    step === 'agent-working' ||
    step === 'pr-watching' ||
    step === 'auto-fixing' ||
    step === 'post-merge-watching';

  const isAlert =
    step === 'needs-human' || step === 'blocked';

  const isMerge = step === 'merge-candidate';
  const isDone = step === 'done';
  const isPreset = step === 'preset-suggested';
  const isSetup = step === 'setup-needed';
  const isReady = step === 'ready-to-start';

  let cardMod = '';
  if (isQuiet) cardMod = 'mainBuildFlowCard--quiet';
  else if (isAlert) cardMod = 'mainBuildFlowCard--alert';
  else if (isMerge) cardMod = 'mainBuildFlowCard--merge';
  else if (isDone) cardMod = 'mainBuildFlowCard--done';
  else if (isPreset || isReady) cardMod = 'mainBuildFlowCard--action';
  else if (isSetup) cardMod = 'mainBuildFlowCard--setup';

  return (
    <div className={`mainBuildFlowCard ${cardMod}`}>
      {/* Status badge */}
      {isQuiet && (
        <div className="mainBuildFlowCard__badge mainBuildFlowCard__badge--quiet">
          作業中
        </div>
      )}
      {isAlert && (
        <div className="mainBuildFlowCard__badge mainBuildFlowCard__badge--alert">
          止まりました
        </div>
      )}
      {isMerge && (
        <div className="mainBuildFlowCard__badge mainBuildFlowCard__badge--merge">
          マージ候補
        </div>
      )}
      {isDone && (
        <div className="mainBuildFlowCard__badge mainBuildFlowCard__badge--done">
          完了
        </div>
      )}

      {/* Title */}
      <div className="mainBuildFlowCard__title">{decision.title}</div>

      {/* Message */}
      <div className="mainBuildFlowCard__message">{decision.message}</div>

      {/* Wake reason (for blocked/needs-human) */}
      {decision.wakeReason && isAlert && (
        <div className="mainBuildFlowCard__reason">
          {decision.wakeReason}
        </div>
      )}

      {/* Start error */}
      {startError && (
        <div className="mainBuildFlowCard__error">{startError}</div>
      )}

      {/* Primary action */}
      {isPreset && (
        <div className="mainBuildFlowCard__actions">
          <button
            type="button"
            className="mainBuildFlowCard__btn mainBuildFlowCard__btn--primary"
            onClick={handleApplyPreset}
          >
            宝地図メモ帳で始める
          </button>
          <button
            type="button"
            className="mainBuildFlowCard__btn mainBuildFlowCard__btn--secondary"
            onClick={() => {
              // Just mark revision so the form fills in
            }}
          >
            自分でフォームに入力する
          </button>
        </div>
      )}

      {isReady && (
        <div className="mainBuildFlowCard__actions">
          <button
            type="button"
            className="mainBuildFlowCard__btn mainBuildFlowCard__btn--primary"
            onClick={handleStart}
            disabled={isStarting}
          >
            {isStarting ? '準備中...' : 'この内容で作り始める'}
          </button>
        </div>
      )}

      {isSetup && (
        <div className="mainBuildFlowCard__actions">
          <button
            type="button"
            className="mainBuildFlowCard__btn mainBuildFlowCard__btn--secondary"
            onClick={() => setShowDetails((v) => !v)}
          >
            設定を確認する
          </button>
        </div>
      )}

      {isMerge && decision.prUrl && (
        <div className="mainBuildFlowCard__actions">
          <a
            href={decision.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mainBuildFlowCard__btn mainBuildFlowCard__btn--primary"
          >
            <ExternalLink size={14} style={{ marginRight: 4 }} />
            PRを開く
          </a>
        </div>
      )}

      {isAlert && (
        <div className="mainBuildFlowCard__actions">
          {decision.prUrl && (
            <a
              href={decision.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mainBuildFlowCard__btn mainBuildFlowCard__btn--secondary"
            >
              <ExternalLink size={14} style={{ marginRight: 4 }} />
              PRを開く
            </a>
          )}
          {decision.issueUrl && (
            <a
              href={decision.issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mainBuildFlowCard__btn mainBuildFlowCard__btn--secondary"
            >
              <ExternalLink size={14} style={{ marginRight: 4 }} />
              Issueを開く
            </a>
          )}
        </div>
      )}

      {/* Details toggle */}
      <div className="mainBuildFlowCard__detailsToggle">
        <button
          type="button"
          className="mainBuildFlowCard__detailsBtn"
          onClick={() => setShowDetails((v) => !v)}
        >
          {showDetails ? (
            <>
              <ChevronUp size={13} /> 詳細を閉じる
            </>
          ) : (
            <>
              <ChevronDown size={13} /> 詳細を見る
            </>
          )}
        </button>
      </div>

      {/* Collapsed details */}
      {showDetails && (
        <div className="mainBuildFlowCard__details">
          {/* Test run link */}
          <div className="mainBuildFlowCard__detailsSection">
            <div className="mainBuildFlowCard__detailsLabel">実地テスト</div>
            <DarakeTestRunPanel />
          </div>
        </div>
      )}
    </div>
  );
}
