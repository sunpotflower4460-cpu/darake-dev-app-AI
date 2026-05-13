import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { DarakeCompactCockpitPanel } from '../components/DarakeCompactCockpitPanel';

export const PANEL_REGISTRY_PHASE65: PanelRegistryItem[] = [
  {
    id: 'darake-compact-cockpit',
    label: 'コンパクト管制室',
    group: 'home',
    phase: '65.1',
    component: React.createElement(DarakeCompactCockpitPanel),
    defaultVisible: true,
    priority: 5,
    tags: ['darake', 'home', 'cockpit', 'compact', 'first-start'],
  },
];
