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
import { ScreenshotManifestToResultBridgePanel } from './components/ScreenshotManifestToResultBridgePanel';
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
import { UiCheckReadinessGatePanel } from './components/UiCheckReadinessGatePanel';
import { UiCheckResultBridgePanel } from './components/UiCheckResultBridgePanel';
import { UiCheckResultRecordPanel } from './components/UiCheckResultRecordPanel';
import { UiMachineCheckDraftPanel } from './components/UiMachineCheckDraftPanel';
import { UiMachineCheckInputPackPanel } from './components/UiMachineCheckInputPackPanel';
import { Phase10ScreenshotUiCompletionReportPanel } from './components/Phase10ScreenshotUiCompletionReportPanel';
// Phase 11
import { NotificationDraftPanel } from './components/NotificationDraftPanel';
import { NotificationDigestPanel } from './components/NotificationDigestPanel';
import { ManualGateNotificationTemplatePanel } from './components/ManualGateNotificationTemplatePanel';
// Phase 12
import { AppStoreMetadataDraftPanel } from './components/AppStoreMetadataDraftPanel';
import { StoreCopyTemplatePanel } from './components/StoreCopyTemplatePanel';
import { PrivacyAgeRatingDraftPanel } from './components/PrivacyAgeRatingDraftPanel';
import { AppStoreScreenshotChecklistPanel } from './components/AppStoreScreenshotChecklistPanel';
import { AppStorePrepCompletionReportPanel } from './components/AppStorePrepCompletionReportPanel';
// Phase 13
import { SubmissionControlRoomPanel } from './components/SubmissionControlRoomPanel';
import { AppStoreConnectInputPackPanel } from './components/AppStoreConnectInputPackPanel';
import { AppStoreConnectApiCandidateDraftPanel } from './components/AppStoreConnectApiCandidateDraftPanel';
import { TestFlightPrepChecklistPanel } from './components/TestFlightPrepChecklistPanel';
import { FinalSubmissionGatePanel } from './components/FinalSubmissionGatePanel';
import { SubmitForReviewManualGuidePanel } from './components/SubmitForReviewManualGuidePanel';
// Phase 14
import { AppReviewRejectionRecordPanel } from './components/AppReviewRejectionRecordPanel';
import { AppReviewResponseDraftPanel } from './components/AppReviewResponseDraftPanel';
import { RejectionFixIssueDraftPanel } from './components/RejectionFixIssueDraftPanel';
import { ResubmissionChecklistPanel } from './components/ResubmissionChecklistPanel';
// Phase 15: Post-Release Operations Room
import { ReleaseRecordPanel } from './components/ReleaseRecordPanel';
import { PostReleaseFeedbackPanel } from './components/PostReleaseFeedbackPanel';
import { FeedbackIssueDraftPanel } from './components/FeedbackIssueDraftPanel';
import { NextUpdatePlanPanel } from './components/NextUpdatePlanPanel';
import { PostReleaseCompletionReportPanel } from './components/PostReleaseCompletionReportPanel';
// Phase 16: Portfolio Control Room
import { AppRegistryPanel } from './components/AppRegistryPanel';
import { PortfolioDashboardPanel } from './components/PortfolioDashboardPanel';
import { TodaysFocusPanel } from './components/TodaysFocusPanel';
import { CrossAppNotificationDigestPanel } from './components/CrossAppNotificationDigestPanel';
import { PortfolioCompletionReportPanel } from './components/PortfolioCompletionReportPanel';
// Phase 17: Template Factory
import { BlueprintGeneratorPanel } from './components/BlueprintGeneratorPanel';
import { CloudAgentInstructionGeneratorPanel } from './components/CloudAgentInstructionGeneratorPanel';
import { IssueDraftBatchGeneratorPanel } from './components/IssueDraftBatchGeneratorPanel';
import { SavedBlueprintsPanel } from './components/SavedBlueprintsPanel';
// Phase 18: Darake Dev OS
import { DarakeNavigationBar } from './components/DarakeNavigationBar';
import { FocusedModePanel } from './components/FocusedModePanel';
import { DarakeHomeSummaryPanel } from './components/DarakeHomeSummaryPanel';
import { DarakeSafetySettingsPanel } from './components/DarakeSafetySettingsPanel';
import { DarakeDevOsCompletionReportPanel } from './components/DarakeDevOsCompletionReportPanel';
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
        <ScreenshotManifestToResultBridgePanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotResultRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <UiCheckReadinessGatePanel />
      </div>
      <div className="panel statusModePanel">
        <ScreenshotToUiCheckBridgePanel />
      </div>
      <div className="panel statusModePanel">
        <UiMachineCheckDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <UiMachineCheckInputPackPanel />
      </div>
      <div className="panel statusModePanel">
        <UiCheckResultBridgePanel />
      </div>
      <div className="panel statusModePanel">
        <UiCheckResultRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <UiCheckCompletionReportPanel />
      </div>
      <div className="panel statusModePanel">
        <Phase10ScreenshotUiCompletionReportPanel />
      </div>
      {/* Phase 11: Notification System */}
      <div className="panel statusModePanel">
        <NotificationDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <NotificationDigestPanel />
      </div>
      <div className="panel statusModePanel">
        <ManualGateNotificationTemplatePanel />
      </div>
      {/* Phase 12: App Store Submission Prep */}
      <div className="panel statusModePanel">
        <AppStoreMetadataDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <StoreCopyTemplatePanel />
      </div>
      <div className="panel statusModePanel">
        <PrivacyAgeRatingDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <AppStoreScreenshotChecklistPanel />
      </div>
      <div className="panel statusModePanel">
        <AppStorePrepCompletionReportPanel />
      </div>
      {/* Phase 13: Submission Control Room */}
      <div className="panel statusModePanel">
        <SubmissionControlRoomPanel />
      </div>
      <div className="panel statusModePanel">
        <AppStoreConnectInputPackPanel />
      </div>
      <div className="panel statusModePanel">
        <AppStoreConnectApiCandidateDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <TestFlightPrepChecklistPanel />
      </div>
      <div className="panel statusModePanel">
        <FinalSubmissionGatePanel />
      </div>
      <div className="panel statusModePanel">
        <SubmitForReviewManualGuidePanel />
      </div>
      {/* Phase 14: Rejection Control Room */}
      <div className="panel statusModePanel">
        <AppReviewRejectionRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <AppReviewResponseDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <RejectionFixIssueDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <ResubmissionChecklistPanel />
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
      {/* Phase 15: Post-Release Operations Room */}
      <div className="panel statusModePanel">
        <ReleaseRecordPanel />
      </div>
      <div className="panel statusModePanel">
        <PostReleaseFeedbackPanel />
      </div>
      <div className="panel statusModePanel">
        <FeedbackIssueDraftPanel />
      </div>
      <div className="panel statusModePanel">
        <NextUpdatePlanPanel />
      </div>
      <div className="panel statusModePanel">
        <PostReleaseCompletionReportPanel />
      </div>
      {/* Phase 16: Portfolio Control Room */}
      <div className="panel statusModePanel">
        <DarakeHomeSummaryPanel />
      </div>
      <div className="panel statusModePanel">
        <AppRegistryPanel />
      </div>
      <div className="panel statusModePanel">
        <PortfolioDashboardPanel />
      </div>
      <div className="panel statusModePanel">
        <TodaysFocusPanel />
      </div>
      <div className="panel statusModePanel">
        <CrossAppNotificationDigestPanel />
      </div>
      <div className="panel statusModePanel">
        <PortfolioCompletionReportPanel />
      </div>
      {/* Phase 17: Template Factory */}
      <div className="panel statusModePanel">
        <BlueprintGeneratorPanel />
      </div>
      <div className="panel statusModePanel">
        <CloudAgentInstructionGeneratorPanel />
      </div>
      <div className="panel statusModePanel">
        <IssueDraftBatchGeneratorPanel />
      </div>
      <div className="panel statusModePanel">
        <SavedBlueprintsPanel />
      </div>
      {/* Phase 18: Darake Dev OS */}
      <div className="panel statusModePanel">
        <DarakeNavigationBar activeGroup="all" onSelect={() => {}} />
      </div>
      <div className="panel statusModePanel">
        <FocusedModePanel />
      </div>
      <div className="panel statusModePanel">
        <DarakeSafetySettingsPanel />
      </div>
      <div className="panel statusModePanel">
        <DarakeDevOsCompletionReportPanel />
      </div>
    </section>
  </React.StrictMode>,
);
