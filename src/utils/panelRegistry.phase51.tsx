import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { DarakeAutopilotPanel } from '../components/DarakeAutopilotPanel';
import { NothingToDoCard } from '../components/NothingToDoCard';

export const PANEL_REGISTRY_PHASE51: PanelRegistryItem[] = [
  {
    id: 'darake-autopilot-panel',
    label: 'だらけ自律運転',
    group: 'home',
    phase: '51.1',
    component: React.createElement(DarakeAutopilotPanel),
    defaultVisible: true,
    priority: 258.5,
    tags: ['darake', 'autopilot', 'agent', 'home', 'first-start'],
  },
  {
    id: 'nothing-to-do-card',
    label: '何もしなくてOK',
    group: 'home',
    phase: '51.2',
    component: React.createElement(NothingToDoCard),
    defaultVisible: true,
    priority: 258.6,
    tags: ['darake', 'autopilot', 'home', 'first-start'],
  },
];
