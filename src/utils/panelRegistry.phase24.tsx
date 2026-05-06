import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { CurrentIntegrationAuditPanel } from '../components/CurrentIntegrationAuditPanel';
import { LocalStorageKeyRegistryPanel } from '../components/LocalStorageKeyRegistryPanel';
import { Phase24IntegrationCompletionReportPanel } from '../components/Phase24IntegrationCompletionReportPanel';
import { SafetyInvariantAuditPanel } from '../components/SafetyInvariantAuditPanel';

export const PANEL_REGISTRY_PHASE24: PanelRegistryItem[] = [
  {
    id: 'current-integration-audit',
    label: 'Current Integration Audit',
    group: 'reports',
    phase: '24.1',
    component: React.createElement(CurrentIntegrationAuditPanel),
    defaultVisible: true,
    priority: 190,
    tags: ['reports', 'audit'],
  },
  {
    id: 'safety-invariant-audit',
    label: 'Safety Invariant Audit',
    group: 'settings',
    phase: '24.5',
    component: React.createElement(SafetyInvariantAuditPanel),
    defaultVisible: true,
    priority: 191,
    tags: ['settings', 'safety', 'audit'],
  },
  {
    id: 'localstorage-key-registry',
    label: 'LocalStorage Key Registry',
    group: 'settings',
    phase: '24.6',
    component: React.createElement(LocalStorageKeyRegistryPanel),
    defaultVisible: true,
    priority: 192,
    tags: ['settings', 'audit'],
  },
  {
    id: 'phase24-completion',
    label: 'Phase 24 Integration Completion Report',
    group: 'reports',
    phase: '24.7',
    component: React.createElement(Phase24IntegrationCompletionReportPanel),
    defaultVisible: true,
    priority: 193,
    tags: ['reports', 'audit'],
  },
];
