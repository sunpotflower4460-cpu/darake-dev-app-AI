import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { DarakeFinalFormPanel } from '../components/DarakeFinalFormPanel';
import { DarakeFinalFormDetailsDrawer } from '../components/DarakeFinalFormDetailsDrawer';
import { DarakeSleepModePanel } from '../components/DarakeSleepModePanel';
import { DarakeSleepModeCompletionReportPanel } from '../components/DarakeSleepModeCompletionReportPanel';
import { DarakeMorningReportPanel } from '../components/DarakeMorningReportPanel';
import { DarakeMorningReportCompletionReportPanel } from '../components/DarakeMorningReportCompletionReportPanel';
import { DarakeFinalFormCompletionReportPanel } from '../components/DarakeFinalFormCompletionReportPanel';
import { buildDarakeFinalFormState } from './darakeFinalFormState';
import { getFinalFormVisibilityPolicy } from './finalFormVisibilityPolicy';

const _visibilityPolicy = getFinalFormVisibilityPolicy();

export const PANEL_REGISTRY_PHASE39TO41: PanelRegistryItem[] = [
  {
    id: 'darake-final-form',
    label: 'だらけ管制室 Final Form',
    group: 'home',
    phase: '41',
    component: React.createElement(DarakeFinalFormPanel),
    defaultVisible: true,
    priority: 260,
    tags: ['darake', 'final-form', 'maximum-darake', 'home', 'sleep-mode', 'morning-report'],
  },
  {
    id: 'darake-sleep-mode',
    label: 'スリープモード',
    group: 'home',
    phase: '39',
    component: React.createElement(DarakeSleepModePanel),
    defaultVisible: true,
    priority: 261,
    tags: ['darake', 'sleep-mode', 'home', 'auto-handled'],
  },
  {
    id: 'darake-morning-report',
    label: 'モーニングレポート',
    group: 'home',
    phase: '40',
    component: React.createElement(DarakeMorningReportPanel),
    defaultVisible: true,
    priority: 262,
    tags: ['darake', 'morning-report', 'home', 'daily'],
  },
  {
    id: 'darake-final-form-drawer',
    label: 'Final Form 詳細ドロワー',
    group: 'home',
    phase: '41.1',
    component: React.createElement(DarakeFinalFormDetailsDrawer, {
      state: buildDarakeFinalFormState(),
    }),
    defaultVisible: false,
    priority: 263,
    tags: ['darake', 'final-form', 'drawer', 'details', 'home'],
  },
  {
    id: 'darake-sleep-mode-completion-report',
    label: 'スリープモード完成レポート',
    group: 'reports',
    phase: '39.5',
    component: React.createElement(DarakeSleepModeCompletionReportPanel),
    defaultVisible: true,
    priority: 284,
    tags: ['darake', 'sleep-mode', 'reports', 'completion'],
  },
  {
    id: 'darake-morning-report-completion-report',
    label: 'モーニングレポート完成レポート',
    group: 'reports',
    phase: '40.5',
    component: React.createElement(DarakeMorningReportCompletionReportPanel),
    defaultVisible: true,
    priority: 285,
    tags: ['darake', 'morning-report', 'reports', 'completion'],
  },
  {
    id: 'darake-final-form-completion-report',
    label: 'Final Form 完成レポート',
    group: 'reports',
    phase: '41.5',
    component: React.createElement(DarakeFinalFormCompletionReportPanel),
    defaultVisible: true,
    priority: 286,
    tags: ['darake', 'final-form', 'reports', 'completion'],
  },
  {
    id: 'final-form-visibility-policy',
    label: 'Final Form Visibility Policy',
    group: 'settings',
    phase: '41.3',
    component: React.createElement('div', { className: 'phase41Panel', style: { maxWidth: '100%' } },
      React.createElement('strong', null, 'Visibility Policy'),
      React.createElement('p', { style: { fontSize: '0.85rem', color: '#555', marginTop: 8 } },
        `alwaysShow: ${_visibilityPolicy.alwaysShow.join(', ')}`
      ),
      React.createElement('p', { style: { fontSize: '0.85rem', color: '#555' } },
        `alwaysHide: ${_visibilityPolicy.alwaysHide.join(', ')}`
      ),
      React.createElement('p', { style: { fontSize: '0.85rem', color: '#555' } },
        `neverHide: ${_visibilityPolicy.neverHide.join(', ')}`
      ),
    ),
    defaultVisible: true,
    priority: 287,
    tags: ['darake', 'final-form', 'visibility', 'settings', 'policy'],
  },
];
