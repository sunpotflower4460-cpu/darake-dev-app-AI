import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DarakeNavigationBar } from './components/DarakeNavigationBar';
import { DarakeTopCommandPanel } from './components/DarakeTopCommandPanel';
import { FocusedModePanel } from './components/FocusedModePanel';
import { ALL_PANELS } from './utils/panelRegistry';
import { getFocusedModeById, loadFocusedModeId, saveFocusedModeId } from './utils/focusedMode';
import type { FocusedModeId } from './utils/focusedMode';
import type { DarakeNavGroupId } from './utils/navigationGroups';
// CSS imports — all existing CSS preserved
import './styles.css';
import './phase2.css';
import './phase25.css';
import './repoSnapshot.css';
import './darakeMode.css';
import './issueDraft.css';
import './issueEdit.css';
import './finalCheck.css';
import './manualGate.css';
import './issueRecord.css';
import './phaseQueue.css';
import './autoRunPlan.css';
import './prCreationPreview.css';
import './lowRiskPrCandidate.css';
import './lowRiskMergeCandidate.css';
import './previewUrlRecord.css';
import './dryRunArtifactCheckRecord.css';
import './limitedScreenshotCaptureManualRunGuide.css';
import './limitedScreenshotCaptureWorkflowDraft.css';
import './limitedScreenshotCaptureWorkflowFileStatus.css';
import './playwrightSetupDryRunDraft.css';
import './playwrightSetupManualRunGuide.css';
import './playwrightSetupReportRecord.css';
import './playwrightSetupWorkflowFileStatus.css';
import './realCaptureWorkflowDraft.css';
import './screenshotCaptureGate.css';
import './screenshotCaptureManifestRecord.css';
import './screenshotManifestToResultBridge.css';
import './screenshotDryRunArtifactCheck.css';
import './screenshotJobDraft.css';
import './screenshotPlanExport.css';
import './screenshotResultRecord.css';
import './screenshotRunGate.css';
import './screenshotToUiCheckBridge.css';
import './screenshotWorkflowDispatchDraft.css';
import './screenshotWorkflowFileStatus.css';
import './screenshotWorkflowManualRunGuide.css';
import './uiMachineCheckDraft.css';
import './uiCheckReadinessGate.css';
import './uiMachineCheckInputPack.css';
import './uiCheckResultBridge.css';
import './uiCheckResultRecord.css';
import './uiCheckCompletionReport.css';
import './phase10ScreenshotUiCompletionReport.css';
import './notificationDraft.css';
import './notificationDigest.css';
import './appStoreMetadataDraft.css';
import './submissionControlRoom.css';
import './rejectionControlRoom.css';
import './reviewWatch.css';
import './phase15to18.css';
import './phase19to23.css';
import './prWatch.css';
import './ciWatch.css';
import './phase7Safety.css';
import './actionPreview.css';
// Phase 24 CSS
import './phase24.css';
import './currentIntegrationAudit.css';
import './safetyInvariantAudit.css';
import './localStorageKeyRegistry.css';
import './phase24IntegrationCompletionReport.css';
import './darakeTopCommand.css';

function loadSavedNavGroup(): DarakeNavGroupId | 'all' {
  try {
    return (localStorage.getItem('darake.navGroup.v1') as DarakeNavGroupId | 'all') ?? 'all';
  } catch {
    return 'all';
  }
}

function DarakeControlRoom() {
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
    const mode = getFocusedModeById(focusedMode);
    return ALL_PANELS.filter((panel) => {
      if (activeGroup !== 'all' && panel.group !== activeGroup) return false;
      if (focusedMode !== 'all' && !mode.navGroups.includes(panel.group)) return false;
      return true;
    }).sort((a, b) => a.priority - b.priority);
  }, [activeGroup, focusedMode]);

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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <section className="appShell boundaryShell">
      <DarakeControlRoom />
    </section>
  </React.StrictMode>,
);
