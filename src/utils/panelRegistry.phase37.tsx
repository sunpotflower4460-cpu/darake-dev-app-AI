import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { CompletionFirstDashboardPanel } from '../components/CompletionFirstDashboardPanel';
import { ShortestDarakePathPanel } from '../components/ShortestDarakePathPanel';
import { CompletionFirstReportPanel } from '../components/CompletionFirstReportPanel';

export const PANEL_REGISTRY_PHASE37: PanelRegistryItem[] = [
  {
    id: 'completion-first-dashboard',
    label: 'Completion-first Dashboard',
    group: 'home',
    phase: '37.2',
    component: React.createElement(CompletionFirstDashboardPanel),
    defaultVisible: true,
    priority: 278,
    tags: ['darake', 'completion-first', 'dashboard', 'home'],
  },
  {
    id: 'shortest-darake-path',
    label: '最短だらけルート',
    group: 'home',
    phase: '37.3',
    component: React.createElement(ShortestDarakePathPanel),
    defaultVisible: true,
    priority: 279,
    tags: ['darake', 'completion-first', 'path', 'home'],
  },
  {
    id: 'completion-first-report',
    label: 'Completion-first レポート',
    group: 'reports',
    phase: '37.4',
    component: React.createElement(CompletionFirstReportPanel),
    defaultVisible: true,
    priority: 280,
    tags: ['darake', 'completion-first', 'reports', 'completion'],
  },
];
