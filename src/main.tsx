import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ActionPreviewPanel } from './components/ActionPreviewPanel';
import { AutoRunPlanPanel } from './components/AutoRunPlanPanel';
import { CiWatchPanel } from './components/CiWatchPanel';
import { DarakeModePanel } from './components/DarakeModePanel';
import { FinalCheckPanel } from './components/FinalCheckPanel';
import { FuturePanel } from './components/FuturePanel';
import { InfoPanel } from './components/InfoPanel';
import { IssueDraftPanel } from './components/IssueDraftPanel';
import { IssueRecordPanel } from './components/IssueRecordPanel';
import { LowRiskMergeCandidatePanel } from './components/LowRiskMergeCandidatePanel';
import { LowRiskPrCandidatePanel } from './components/LowRiskPrCandidatePanel';
import { ManualGatePanel } from './components/ManualGatePanel';
import { Phase7SafetyPanel } from './components/Phase7SafetyPanel';
import { PhaseQueuePanel } from './components/PhaseQueuePanel';
import { PreviewUrlRecordPanel } from './components/PreviewUrlRecordPanel';
import { PrCreationPreviewPanel } from './components/PrCreationPreviewPanel';
import { PrWatchPanel } from './components/PrWatchPanel';
import { ReviewWatchPanel } from './components/ReviewWatchPanel';
import { ScreenshotJobDraftPanel } from './components/ScreenshotJobDraftPanel';
import { StatusPanel } from './components/StatusPanel';
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
import './screenshotJobDraft.css';
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
