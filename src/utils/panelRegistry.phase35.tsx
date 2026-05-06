import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { DarakeReviewInboxPanel } from '../components/DarakeReviewInboxPanel';
import { MaximumDarakeDashboardPanel } from '../components/MaximumDarakeDashboardPanel';
import { NoOkCompletionReportPanel } from '../components/NoOkCompletionReportPanel';

export const PANEL_REGISTRY_PHASE35: PanelRegistryItem[] = [
  {
    id: 'maximum-darake-dashboard',
    label: 'Maximum Darake Dashboard',
    group: 'home',
    phase: '35.2',
    component: React.createElement(MaximumDarakeDashboardPanel),
    defaultVisible: true,
    priority: 273,
    tags: ['darake', 'maximum-darake', 'no-ok', 'dashboard', 'safety'],
  },
  {
    id: 'darake-review-inbox',
    label: 'Darake Review Inbox',
    group: 'home',
    phase: '35 / 35.1',
    component: React.createElement(DarakeReviewInboxPanel),
    defaultVisible: true,
    priority: 274,
    tags: ['darake', 'review-inbox', 'manual-gate', 'no-ok', 'safety'],
  },
  {
    id: 'no-ok-completion-report',
    label: 'No-OK Completion Report',
    group: 'reports',
    phase: '35.3',
    component: React.createElement(NoOkCompletionReportPanel),
    defaultVisible: true,
    priority: 275,
    tags: ['darake', 'no-ok', 'reports', 'completion'],
  },
];
