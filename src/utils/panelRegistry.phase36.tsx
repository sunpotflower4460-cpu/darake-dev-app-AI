import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { DarakePreferenceMemoryPanel } from '../components/DarakePreferenceMemoryPanel';
import { DarakePreferenceCompletionReportPanel } from '../components/DarakePreferenceCompletionReportPanel';

export const PANEL_REGISTRY_PHASE36: PanelRegistryItem[] = [
  {
    id: 'darake-preference-memory',
    label: 'Darake Preference Memory',
    group: 'settings',
    phase: '36.1–36.2',
    component: React.createElement(DarakePreferenceMemoryPanel),
    defaultVisible: true,
    priority: 276,
    tags: ['darake', 'preference', 'auto-hide', 'learning', 'settings'],
  },
  {
    id: 'darake-preference-completion-report',
    label: 'Preference 学習レポート',
    group: 'reports',
    phase: '36.4',
    component: React.createElement(DarakePreferenceCompletionReportPanel),
    defaultVisible: true,
    priority: 277,
    tags: ['darake', 'preference', 'reports', 'completion', 'learning'],
  },
];
