import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { HumanCheckMinimalPanel } from '../components/HumanCheckMinimalPanel';
import { HumanCheckMinimalSettingsPanel } from '../components/HumanCheckMinimalSettingsPanel';
import { HumanCheckMinimalCompletionReportPanel } from '../components/HumanCheckMinimalCompletionReportPanel';

export const PANEL_REGISTRY_PHASE31: PanelRegistryItem[] = [
  {
    id: 'human-check-minimal',
    label: 'Human Check Minimal Mode',
    group: 'home',
    phase: '31.1/31.2/31.3',
    component: React.createElement(HumanCheckMinimalPanel),
    defaultVisible: true,
    priority: 255,
    tags: ['darake', 'minimal', 'one-action', 'manual-gate', 'copy-only', 'safety'],
  },
  {
    id: 'human-check-minimal-settings',
    label: 'Human Check Minimal Settings',
    group: 'settings',
    phase: '31.4',
    component: React.createElement(HumanCheckMinimalSettingsPanel),
    defaultVisible: true,
    priority: 256,
    tags: ['darake', 'minimal', 'settings', 'safety'],
  },
  {
    id: 'human-check-minimal-completion-report',
    label: 'Human Check Minimal Completion Report',
    group: 'reports',
    phase: '31.5',
    component: React.createElement(HumanCheckMinimalCompletionReportPanel),
    defaultVisible: true,
    priority: 257,
    tags: ['darake', 'minimal', 'reports'],
  },
];
