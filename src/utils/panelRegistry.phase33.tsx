import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { DarakeAutopilotPolicyPanel } from '../components/DarakeAutopilotPolicyPanel';

export const PANEL_REGISTRY_PHASE33: PanelRegistryItem[] = [
  {
    id: 'darake-autopilot-policy',
    label: 'Darake Autopilot Policy',
    group: 'settings',
    phase: '33 / 33.1',
    component: React.createElement(DarakeAutopilotPolicyPanel),
    defaultVisible: true,
    priority: 270,
    tags: ['darake', 'maximum-darake', 'no-ok', 'autopilot', 'policy', 'safety'],
  },
];
