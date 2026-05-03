import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DarakeModePanel } from './components/DarakeModePanel';
import { FinalCheckPanel } from './components/FinalCheckPanel';
import { FuturePanel } from './components/FuturePanel';
import { InfoPanel } from './components/InfoPanel';
import { IssueDraftPanel } from './components/IssueDraftPanel';
import { IssueRecordPanel } from './components/IssueRecordPanel';
import { ManualGatePanel } from './components/ManualGatePanel';
import { PrWatchPanel } from './components/PrWatchPanel';
import { ReviewWatchPanel } from './components/ReviewWatchPanel';
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
import './reviewWatch.css';
import './prWatch.css';

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
        <ReviewWatchPanel />
      </div>
      <div className="panel statusModePanel">
        <PrWatchPanel />
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
