import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { DarakeHealthCheckPanel } from '../components/DarakeHealthCheckPanel';

export const PANEL_REGISTRY_PHASE57: PanelRegistryItem[] = [
  {
    id: 'darake-health-check',
    label: 'だらけ診断',
    group: 'home',
    phase: '57.1',
    component: React.createElement(DarakeHealthCheckPanel),
    defaultVisible: true,
    priority: 258.05,
    tags: ['darake', 'home', 'health', 'check', 'first-start', 'setup', 'diagnosis'],
  },
];
