import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FuturePanel } from './components/FuturePanel';
import { StatusPanel } from './components/StatusPanel';
import './styles.css';
import './phase2.css';
import './phase25.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <section className="appShell boundaryShell">
      <div className="panel statusModePanel">
        <StatusPanel />
      </div>
      <div className="panel statusModePanel">
        <FuturePanel />
      </div>
    </section>
  </React.StrictMode>,
);
