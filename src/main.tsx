import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DarakeHumanOnePageCockpit } from './components/DarakeHumanOnePageCockpit';
import { DarakeNavigationBar } from './components/DarakeNavigationBar';
import { DarakeTopCommandPanel } from './components/DarakeTopCommandPanel';
import { FocusedModePanel } from './components/FocusedModePanel';
import { WakeActionPanel } from './components/WakeActionPanel';
import { ALL_PANELS } from './utils/panelRegistry';
import { getFocusedModeById, loadFocusedModeId, saveFocusedModeId } from './utils/focusedMode';
import type { FocusedModeId } from './utils/focusedMode';
import type { DarakeNavGroupId } from './utils/navigationGroups';
import { buildFirstAppStartCompletionReport } from './utils/firstAppStartCompletionReport';
import { isFirstStartMinimalModeReleased } from './utils/firstStartMinimalMode';
import { loadFirstStartStep } from './utils/firstStartStep';
import { subscribeDarakeRuntimeEvents } from './utils/darakeRuntimeEvents';
import { getWakeActionTokenIdFromUrl, clearWakeActionFromUrl } from './utils/wakeActionRouter';
import {
  DARAKE_NAV_GROUP_CHANGE_EVENT,
  type DarakeNavGroupChangeDetail,
} from './utils/darakeNavGroupChange';
import {
  DARAKE_HUMAN_VIEW_MODE_CHANGE_EVENT,
  loadDarakeHumanViewMode,
  requestDarakeHumanViewModeChange,
  type DarakeHumanViewMode,
  type DarakeHumanViewModeChangeDetail,
} from './utils/darakeHumanViewMode';
import './styleImports';

const VALID_NAV_GROUPS = new Set<string>([
  'all',
  'home',
  'create',
  'run',
  'watch',
  'screenshots',
  'submit',
  'post-release',
  'portfolio',
  'templates',
  'reports',
  'settings',
  'first-start',
]);

const FIRST_START_PON_VISIBLE_PANEL_IDS = [
  'darake-compact-cockpit',
  'main-build-flow-card',
  'darake-health-check',
  'omakase-start',
  'darake-now-card',
  'pon-start',
  'darake-task-queue',
  'darake-next-task',
  'blueprint-stock',
  'sleep-session',
  'morning-report',
  'darake-rehearsal',
  'github-direct-issue-create',
  'github-start',
  'github-issue-record',
  'cloud-agent-start',
  'github-start-progress',
  'beginner-next-step-card',
  'first-start-advanced-open',
  'agent-start',
  'agent-run-watch',
  'agent-fix-request',
  'auto-fix-loop-panel',
  'merge-candidate-card',
  'darake-autopilot-panel',
  'nothing-to-do-card',
  'remote-autopilot-status-card',
];

function getFirstStartVisiblePanelIds() {
  const explicitStep = loadFirstStartStep();
  if (explicitStep === 'form') {
    return new Set(['gentle-app-start-form']);
  }
  if (explicitStep === 'pon') {
    return new Set(FIRST_START_PON_VISIBLE_PANEL_IDS);
  }

  const report = buildFirstAppStartCompletionReport();
  if (!report.onboardingComplete) {
    return new Set(['first-start-route-guard', 'first-launch-care']);
  }
  if (!report.formCanStart) {
    return new Set(['gentle-app-start-form']);
  }
  return new Set(FIRST_START_PON_VISIBLE_PANEL_IDS);
}

function loadSavedNavGroup(): DarakeNavGroupId | 'all' {
  try {
    const stored = localStorage.getItem('darake.navGroup.v1');
    if (stored && VALID_NAV_GROUPS.has(stored)) {
      return stored as DarakeNavGroupId | 'all';
    }
  } catch {
    // ignore
  }
  return 'home';
}

function useDarakeRuntimeRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);
  return revision;
}

function useDarakeHumanMode(): DarakeHumanViewMode {
  const [mode, setMode] = useState<DarakeHumanViewMode>(loadDarakeHumanViewMode);

  useEffect(() => {
    function onModeChange(e: Event) {
      const detail = (e as CustomEvent<DarakeHumanViewModeChangeDetail>).detail;
      setMode(detail.mode);
    }
    window.addEventListener(DARAKE_HUMAN_VIEW_MODE_CHANGE_EVENT, onModeChange);
    return () => window.removeEventListener(DARAKE_HUMAN_VIEW_MODE_CHANGE_EVENT, onModeChange);
  }, []);

  return mode;
}

function DarakeControlRoom({
  firstStartActive,
  forceAllPanels = false,
}: {
  firstStartActive: boolean;
  forceAllPanels?: boolean;
}) {
  const [activeGroup, setActiveGroup] = useState<DarakeNavGroupId | 'all'>(loadSavedNavGroup);
  const [focusedMode, setFocusedMode] = useState<FocusedModeId>(loadFocusedModeId);

  useEffect(() => {
    try {
      localStorage.setItem('darake.navGroup.v1', activeGroup);
    } catch {
      // ignore
    }
  }, [activeGroup]);

  useEffect(() => {
    saveFocusedModeId(focusedMode);
  }, [focusedMode]);

  useEffect(() => {
    function onNavChange(e: Event) {
      const detail = (e as CustomEvent<DarakeNavGroupChangeDetail>).detail;
      setActiveGroup(detail.group);
    }
    window.addEventListener(DARAKE_NAV_GROUP_CHANGE_EVENT, onNavChange);
    return () => window.removeEventListener(DARAKE_NAV_GROUP_CHANGE_EVENT, onNavChange);
  }, []);

  const filteredPanels = useMemo(() => {
    if (firstStartActive) {
      const visibleIds = getFirstStartVisiblePanelIds();
      return ALL_PANELS.filter((panel) => visibleIds.has(panel.id));
    }

    if (forceAllPanels) {
      return ALL_PANELS;
    }

    const mode = getFocusedModeById(focusedMode);
    return ALL_PANELS.filter((panel) => {
      if (activeGroup !== 'all' && panel.group !== activeGroup) return false;
      if (focusedMode !== 'all' && !mode.navGroups.includes(panel.group)) return false;
      return true;
    });
  }, [activeGroup, focusedMode, firstStartActive, forceAllPanels]);

  if (firstStartActive) {
    return (
      <>
        {filteredPanels.map((item) => (
          <div key={item.id} className="panel statusModePanel">
            {item.component}
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="panel statusModePanel">
        <DarakeTopCommandPanel
          activeGroup={forceAllPanels ? 'all' : activeGroup}
          focusedMode={focusedMode}
          totalPanels={ALL_PANELS.length}
          visiblePanels={filteredPanels.length}
          onGroupSelect={setActiveGroup}
          onModeSelect={setFocusedMode}
        />
      </div>
      <div className="panel statusModePanel">
        <DarakeNavigationBar activeGroup={forceAllPanels ? 'all' : activeGroup} onSelect={setActiveGroup} />
      </div>
      <div className="panel statusModePanel">
        <FocusedModePanel value={focusedMode} onModeChange={setFocusedMode} />
      </div>
      {filteredPanels.map((item) => (
        <div key={item.id} className="panel statusModePanel">
          {item.component}
        </div>
      ))}
    </>
  );
}

function DarakeDetailsShell({ mode }: { mode: Exclude<DarakeHumanViewMode, 'human'> }) {
  return (
    <div className="darakeHumanDetailsShell">
      <div className="darakeHumanDetailsShell__bar">
        <button
          type="button"
          className="darakeHumanDetailsShell__button darakeHumanDetailsShell__button--primary"
          onClick={() => requestDarakeHumanViewModeChange('human')}
        >
          1ページに戻る
        </button>
      </div>
      {mode === 'debug' && (
        <details className="darakeAppDetailsCollapse">
          <summary className="darakeAppDetailsCollapse__summary">
            詳細な説明を見る（Darake Dev App AI / Gate）
          </summary>
          <App />
        </details>
      )}
      <section className="appShell boundaryShell">
        <DarakeControlRoom firstStartActive={false} forceAllPanels={mode === 'debug'} />
      </section>
    </div>
  );
}

function DarakeRoot() {
  const revision = useDarakeRuntimeRevision();
  const humanMode = useDarakeHumanMode();
  const firstStartActive = useMemo(
    () => !isFirstStartMinimalModeReleased(),
    [revision],
  );

  // Detect ?wakeAction=TOKEN_ID in URL
  const [wakeTokenId, setWakeTokenId] = useState<string | null>(() =>
    getWakeActionTokenIdFromUrl(),
  );

  function handleWakeActionDismiss() {
    clearWakeActionFromUrl();
    setWakeTokenId(null);
  }

  useEffect(() => {
    document.body.classList.toggle('darake-first-start-active', firstStartActive);
    return () => document.body.classList.remove('darake-first-start-active');
  }, [firstStartActive]);

  return (
    <>
      {firstStartActive ? (
        <section className="appShell boundaryShell">
          <DarakeControlRoom firstStartActive={firstStartActive} />
        </section>
      ) : humanMode === 'human' ? (
        <DarakeHumanOnePageCockpit />
      ) : (
        <DarakeDetailsShell mode={humanMode} />
      )}
      {wakeTokenId && (
        <div className="wakeActionOverlay">
          <div className="wakeActionOverlay__inner">
            <WakeActionPanel
              tokenId={wakeTokenId}
              onDismiss={handleWakeActionDismiss}
            />
            <button
              type="button"
              className="wakeActionOverlay__dismiss"
              onClick={handleWakeActionDismiss}
            >
              閉じる（通常画面に戻る）
            </button>
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DarakeRoot />
  </React.StrictMode>,
);
