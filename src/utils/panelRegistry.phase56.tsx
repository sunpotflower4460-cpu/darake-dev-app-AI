import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { MainBuildFlowCard } from '../components/MainBuildFlowCard';

export const PANEL_REGISTRY_PHASE56: PanelRegistryItem[] = [
  {
    id: 'main-build-flow-card',
    label: '1本目フローカード',
    group: 'home',
    phase: '56.1',
    component: React.createElement(MainBuildFlowCard),
    defaultVisible: true,
    priority: 258.0,
    tags: ['darake', 'home', 'first-start', 'flow', 'build', 'minimal'],
  },
];
