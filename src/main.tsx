import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ActionPreviewPanel } from './components/ActionPreviewPanel';
import { AutoRunPlanPanel } from './components/AutoRunPlanPanel';
import { CiWatchPanel } from './components/CiWatchPanel';
import { DarakeModePanel } from './components/DarakeModePanel';
import { DryRunArtifactCheckRecordPanel } from './components/DryRunArtifactCheckRecordPanel';
import { FinalCheckPanel } from './components/FinalCheckPanel';
import { FuturePanel } from './components/FuturePanel';
import { InfoPanel } from './components/InfoPanel';
import { IssueDraftPanel } from './components/IssueDraftPanel';
import { IssueRecordPanel } from './components/IssueRecordPanel';
import { LimitedScreenshotCaptureManualRunGuidePanel } from './components/LimitedScreenshotCaptureManualRunGuidePanel';
import { LimitedScreenshotCaptureWorkflowDraftPanel } from './components/LimitedScreenshotCaptureWorkflowDraftPanel';
import { LimitedScreenshotCaptureWorkflowFileStatusPanel } from './components/LimitedScreenshotCaptureWorkflowFileStatusPanel';
import { LowRiskMergeCandidatePanel } from './components/LowRiskMergeCandidatePanel';
import { LowRiskPrCandidatePanel } from './components/LowRiskPrCandidatePanel';
import { ManualGatePanel } from './components/ManualGatePanel';
import { Phase7SafetyPanel } from './components/Phase7SafetyPanel';
import { PhaseQueuePanel } from './components/PhaseQueuePanel';
import { PlaywrightSetupDryRunDraftPanel } from './components/PlaywrightSetupDryRunDraftPanel';
import { PlaywrightSetupManualRunGuidePanel } from './components/PlaywrightSetupManualRunGuidePanel';
import { PlaywrightSetupReportRecordPanel } from './components/PlaywrightSetupReportRecordPanel';
import { PlaywrightSetupWorkflowFileStatusPanel } from './components/PlaywrightSetupWorkflowFileStatusPanel';
import { PreviewUrlRecordPanel } from './components/PreviewUrlRecordPanel';
import { PrCreationPreviewPanel } from './components/PrCreationPreviewPanel';
import { PrWatchPanel } from './components/PrWatchPanel';
import { RealCaptureWorkflowDraftPanel } from './components/RealCaptureWorkflowDraftPanel';
import { ReviewWatchPanel } from './components/ReviewWatchPanel';
import { ScreenshotCaptureGatePanel } from './components/ScreenshotCaptureGatePanel';
import { ScreenshotCaptureManifestRecordPanel } from './components/ScreenshotCaptureManifestRecordPanel';
import { ScreenshotDryRunArtifactCheckPanel } from './components/ScreenshotDryRunArtifactCheckPanel';
import { ScreenshotJobDraftPanel } from './components/ScreenshotJobDraftPanel';
import { ScreenshotPlanExportPanel } from './components/ScreenshotPlanExportPanel';
import { ScreenshotResultRecordPanel } from './components/ScreenshotResultRecordPanel';
import { ScreenshotRunGatePanel } from './components/ScreenshotRunGatePanel';
import { ScreenshotToUiCheckBridgePanel } from './components/ScreenshotToUiCheckBridgePanel';
import { ScreenshotWorkflowDispatchDraftPanel } from './components/ScreenshotWorkflowDispatchDraftPanel';
import { ScreenshotWorkflowFileStatusPanel } from './components/ScreenshotWorkflowFileStatusPanel';
import { ScreenshotWorkflowManualRunGuidePanel } from './components/ScreenshotWorkflowManualRunGuidePanel';
import { StatusPanel } from './components/StatusPanel';
import { UiCheckCompletionReportPanel } from './components/UiCheckCompletionReportPanel';
import { UiCheckResultRecordPanel } from './components/UiCheckResultRecordPanel';
import { UiMachineCheckDraftPanel } from './components/UiMachineCheckDraftPanel';
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
import './uiCheckResultRecord.css';
import './uiCheckCompletionReport.css';
import './reviewWatch.css';
import './prWatch.css';
import './ciWatch.css';
import './phase7Safety.css';
import './actionPreview.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <section className="appShell boundaryShell">
      <div className="panel statusModePanel">
        <DarakeModePanel />
      </div>
      <div className="panel statusModePanel">
        <IssueDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <FinalCheckPanel />
      </div>
      <div className="panel statusModePanel">
        <ManualGatePanel />
      </div>
      <div className="panel statusModePanel">
        <IssueRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <PhaseQueuePanel />
      </div>
      <div className="panel statusModePanel">
        <AutoRunPlanPanel />
      </div>
      <div className="panel statusModePanel">
        <PrCreationPreviewPanel />
      </div>
      <div className="panel statusModePanel">
        <LowRiskPrCandidatePanel />
      </div>
      <div className="panel statusModePanel">
        <LowRiskMergeCandidatePanel />
      </div>
      <div className="panel statusModePanel">
        <PreviewUrlRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotJobDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotPlanExportPanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotRunGatePanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotWorkflowDispatchDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotWorkflowFileStatusPanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotWorkflowManualRunGuidePanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotDryRunArtifactCheckPanel />
      </div>
      <div className="panel statusModePanel">
        <DryRunArtifactCheckRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotCaptureGatePanel />
      </div>
      <div className="panel statusModePanel">
        <RealCaptureWorkflowDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <PlaywrightSetupDryRunDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <PlaywrightSetupWorkflowFileStatusPanel />
      </div>
      <div className="panel statusModePanel">
        <PlaywrightSetupManualRunGuidePanel />
      </div>
      <div className="panel statusModePanel">
        <PlaywrightSetupReportRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <LimitedScreenshotCaptureWorkflowDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <LimitedScreenshotCaptureWorkflowFileStatusPanel />
      </div>
      <div className="panel statusModePanel">
        <LimitedScreenshotCaptureManualRunGuidePanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotCaptureManifestRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotResultRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotToUiCheckBridgePanel />
      </div>
      <div className="panel statusModePanel">
        <UiMachineCheckDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <UiCheckResultRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <UiCheckCompletionReportPanel />
      </div>
      <div className="panel statusModePanel">
        <ReviewWatchPanel />
      </div>
      <div className="panel statusModePanel">
        <Phase7SafetyPanel />
      </div>
      <div className="panel statusModePanel">
        <ActionPreviewPanel />
      </div>
      <div className="panel statusModePanel">
        <PrWatchPanel />
      </div>
      <div className="panel statusModePanel">
        <CiWatchPanel />
      </div>
      <div className="panel statusModePanel">
        <StatusPanel />
      </div>
      <div className="panel statusModePanel">
        <FuturePanel />
      </div>
      <div className="panel statusModePanel">
        <InfoPanel />
      </div>
    </section>
  </React.StrictMode>,
);
