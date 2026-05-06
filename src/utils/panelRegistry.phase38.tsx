import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { OneScreenCommandCenterPanel } from '../components/OneScreenCommandCenterPanel';
import { DetailsVisibilityPolicyPanel } from '../components/DetailsVisibilityPolicyPanel';
import { OneScreenSettingsPanel } from '../components/OneScreenSettingsPanel';
import { OneScreenCompletionReportPanel } from '../components/OneScreenCompletionReportPanel';

export const PANEL_REGISTRY_PHASE38: PanelRegistryItem[] = [
  {
    id: 'one-screen-command-center',
    label: 'だらけ管制室',
    group: 'home',
    phase: '38.2',
    component: React.createElement(OneScreenCommandCenterPanel),
    defaultVisible: true,
    priority: 270,
    tags: ['darake', 'one-screen', 'maximum-darake', 'dashboard', 'home', 'safety'],
  },
  {
    id: 'details-visibility-policy',
    label: 'Details Visibility Policy',
    group: 'settings',
    phase: '38.3',
    component: React.createElement(DetailsVisibilityPolicyPanel),
    defaultVisible: true,
    priority: 281,
    tags: ['darake', 'one-screen', 'details-hidden', 'settings', 'auto-hide'],
  },
  {
    id: 'one-screen-settings',
    label: 'One Screen Settings',
    group: 'settings',
    phase: '38.4',
    component: React.createElement(OneScreenSettingsPanel),
    defaultVisible: true,
    priority: 282,
    tags: ['darake', 'one-screen', 'settings'],
  },
  {
    id: 'one-screen-completion-report',
    label: 'One Screen 完成レポート',
    group: 'reports',
    phase: '38.5',
    component: React.createElement(OneScreenCompletionReportPanel),
    defaultVisible: true,
    priority: 283,
    tags: ['darake', 'one-screen', 'reports', 'completion'],
  },
];
