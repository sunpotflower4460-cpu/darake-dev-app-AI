import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
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
import { getWakeActionTokenId, clearWakeActionFromUrl } from './utils/wakeActionRouter';
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

function getFirstStartVisiblePanelIds() {
  const explicitStep = loadFirstStartStep();
  if (explicitStep === 'form') {
    return new Set(['gentle-app-start-form']);
  }
  if (explicitStep === 'pon') {
    return new Set(['omakase-start', 'darake-now-card', 'pon-start', 'github-direct-issue-create', 'github-start', 'github-issue-record', 'cloud-agent-start', 'github-start-progress', 'beginner-next-step-card', 'first-start-advanced-open', 'agent-start', 'agent-run-watch', 'agent-fix-request', 'auto-fix-loop-panel', 'merge-candidate-card', 'darake-autopilot-panel', 'nothing-to-do-card', 'remote-autopilot-status-card']);
  }

  const report = buildFirstAppStartCompletionReport();
  if (!report.onboardingComplete) {
    return new Set(['first-start-route-guard', 'first-launch-care']);
  }
  if (!report.formCanStart) {
    return new Set(['gentle-app-start-form']);
  }
  return new Set(['omakase-start', 'darake-now-card', 'pon-start', 'github-direct-issue-create', 'github-start', 'github-issue-record', 'cloud-agent-start', 'github-start-progress', 'beginner-next-step-card', 'first-start-advanced-open', 'agent-start', 'agent-run-watch', 'agent-fix-request', 'auto-fix-loop-panel', 'merge-candidate-card', 'darake-autopilot-panel', 'nothing-to-do-card', 'remote-autopilot-status-card']);
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
  return 'all';
}

function useDarakeRuntimeRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);
  return revision;
}

function DarakeControlRoom({ firstStartActive }: { firstStartActive: boolean }) {
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

  const filteredPanels = useMemo(() => {
    if (firstStartActive) {
      const visibleIds = getFirstStartVisiblePanelIds();
      return ALL_PANELS.filter((panel) => visibleIds.has(panel.id));
    }

    const mode = getFocusedModeById(focusedMode);
    return ALL_PANELS.filter((panel) => {
      if (activeGroup !== 'all' && panel.group !== activeGroup) return false;
      if (focusedMode !== 'all' && !mode.navGroups.includes(panel.group)) return false;
      return true;
    });
  }, [activeGroup, focusedMode, firstStartActive]);

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
          activeGroup={activeGroup}
          focusedMode={focusedMode}
          totalPanels={ALL_PANELS.length}
          visiblePanels={filteredPanels.length}
          onGroupSelect={setActiveGroup}
          onModeSelect={setFocusedMode}
        />
      </div>
      <div className="panel statusModePanel">
        <DarakeNavigationBar activeGroup={activeGroup} onSelect={setActiveGroup} />
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

function DarakeRoot() {
  const revision = useDarakeRuntimeRevision();
  const firstStartActive = useMemo(
    () => !isFirstStartMinimalModeReleased(),
    [revision],
  );
  const [wakeActionTokenId, setWakeActionTokenId] = useState<string | null>(
    () => getWakeActionTokenId(),
  );

  useEffect(() => {
    document.body.classList.toggle('darake-first-start-active', firstStartActive);
    return () => document.body.classList.remove('darake-first-start-active');
  }, [firstStartActive]);

  function handleWakeActionDismiss() {
    clearWakeActionFromUrl();
    setWakeActionTokenId(null);
  }

  // If opened via notification wake action, show only the WakeActionPanel
  if (wakeActionTokenId) {
    return <WakeActionPanel tokenId={wakeActionTokenId} onDismiss={handleWakeActionDismiss} />;
  }

  return (
    <>
      {!firstStartActive && <App />}
      <section className="appShell boundaryShell">
        <DarakeControlRoom firstStartActive={firstStartActive} />
      </section>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DarakeRoot />
  </React.StrictMode>,
);
