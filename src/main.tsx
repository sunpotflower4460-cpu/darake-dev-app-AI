import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DarakeModePanel } from './components/DarakeModePanel';
import { FuturePanel } from './components/FuturePanel';
import { InfoPanel } from './components/InfoPanel';
import { IssueDraftPanel } from './components/IssueDraftPanel';
import { StatusPanel } from './components/StatusPanel';
import './styles.css';
import './phase2.css';
import './phase25.css';
import './repoSnapshot.css';
import './darakeMode.css';
import './issueDraft.css';
import './issueEdit.css';

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
