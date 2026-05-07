import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { RemoteAutopilotStatusCard } from '../components/RemoteAutopilotStatusCard';

export const PANEL_REGISTRY_PHASE52: PanelRegistryItem[] = [
  {
    id: 'remote-autopilot-status-card',
    label: '裏巡回状態',
    group: 'home',
    phase: '52.1',
    component: React.createElement(RemoteAutopilotStatusCard),
    defaultVisible: true,
    priority: 258.7,
    tags: ['darake', 'autopilot', 'remote', 'home', 'first-start'],
  },
];
