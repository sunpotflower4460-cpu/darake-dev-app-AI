import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { AutoProgressSimulationPanel } from '../components/AutoProgressSimulationPanel';
import { StopPointPredictorPanel } from '../components/StopPointPredictorPanel';
import { CompletionReportForecastPanel } from '../components/CompletionReportForecastPanel';
import { AutoProgressSimulationCompletionReportPanel } from '../components/AutoProgressSimulationCompletionReportPanel';

export const PANEL_REGISTRY_PHASE32: PanelRegistryItem[] = [
  {
    id: 'auto-progress-simulation',
    label: 'Auto Progress Simulation',
    group: 'run',
    phase: '32.1/32.2',
    component: React.createElement(AutoProgressSimulationPanel),
    defaultVisible: true,
    priority: 260,
    tags: ['darake', 'simulation', 'one-action', 'copy-only', 'safety'],
  },
  {
    id: 'stop-point-predictor',
    label: 'Stop Point Predictor',
    group: 'run',
    phase: '32.3',
    component: React.createElement(StopPointPredictorPanel),
    defaultVisible: true,
    priority: 261,
    tags: ['darake', 'simulation', 'manual-gate', 'safety'],
  },
  {
    id: 'completion-report-forecast',
    label: 'Completion Report Forecast',
    group: 'reports',
    phase: '32.4',
    component: React.createElement(CompletionReportForecastPanel),
    defaultVisible: true,
    priority: 262,
    tags: ['darake', 'simulation', 'reports'],
  },
  {
    id: 'auto-progress-simulation-completion-report',
    label: 'Auto Progress Simulation Completion Report',
    group: 'reports',
    phase: '32.5',
    component: React.createElement(AutoProgressSimulationCompletionReportPanel),
    defaultVisible: true,
    priority: 263,
    tags: ['darake', 'simulation', 'reports'],
  },
];
