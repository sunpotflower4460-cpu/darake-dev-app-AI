import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { OneActionCandidatePanel } from '../components/OneActionCandidatePanel';
import { OneActionDecisionRecordPanel } from '../components/OneActionDecisionRecordPanel';
import { OneActionCompletionReportPanel } from '../components/OneActionCompletionReportPanel';

export const PANEL_REGISTRY_PHASE30: PanelRegistryItem[] = [
  {
    id: 'one-action-candidate',
    label: '今日の1件 (One Action Candidate)',
    group: 'home',
    phase: '30.1/30.2',
    component: React.createElement(OneActionCandidatePanel),
    defaultVisible: true,
    priority: 250,
    tags: ['darake', 'one-action', 'minimal', 'manual-gate', 'copy-only', 'safety'],
  },
  {
    id: 'one-action-decision-record',
    label: 'One Action Decision Record',
    group: 'home',
    phase: '30.3',
    component: React.createElement(OneActionDecisionRecordPanel),
    defaultVisible: true,
    priority: 251,
    tags: ['darake', 'one-action', 'manual-gate'],
  },
  {
    id: 'one-action-completion-report',
    label: 'One Action Completion Report',
    group: 'reports',
    phase: '30.4',
    component: React.createElement(OneActionCompletionReportPanel),
    defaultVisible: true,
    priority: 252,
    tags: ['darake', 'one-action', 'reports'],
  },
];
