import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { AgentStartPanel } from '../components/AgentStartPanel';
import { AgentRunWatchPanel } from '../components/AgentRunWatchPanel';
import { AgentFixRequestPanel } from '../components/AgentFixRequestPanel';

export const PANEL_REGISTRY_PHASE49: PanelRegistryItem[] = [
  {
    id: 'agent-start',
    label: 'AIに作業をお願いする',
    group: 'home',
    phase: '49.1',
    component: React.createElement(AgentStartPanel),
    defaultVisible: true,
    priority: 258.5,
    tags: ['darake', 'agent', 'first-start', 'home', 'beginner', 'issue', 'copilot'],
  },
  {
    id: 'agent-run-watch',
    label: 'AI作業監視',
    group: 'home',
    phase: '49.2',
    component: React.createElement(AgentRunWatchPanel),
    defaultVisible: true,
    priority: 258.6,
    tags: ['darake', 'agent', 'pr', 'watch', 'first-start', 'home'],
  },
  {
    id: 'agent-fix-request',
    label: 'AI修正依頼',
    group: 'home',
    phase: '49.3',
    component: React.createElement(AgentFixRequestPanel),
    defaultVisible: true,
    priority: 258.7,
    tags: ['darake', 'agent', 'ci', 'fix', 'first-start', 'home'],
  },
];
