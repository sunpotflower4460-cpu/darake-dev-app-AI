import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { NoOkAutoAdvanceQueuePanel } from '../components/NoOkAutoAdvanceQueuePanel';
import { SilentBatchLogPanel } from '../components/SilentBatchLogPanel';

export const PANEL_REGISTRY_PHASE34: PanelRegistryItem[] = [
  {
    id: 'no-ok-auto-advance-queue',
    label: 'No-OK Auto Advance Queue',
    group: 'run',
    phase: '34 / 34.1',
    component: React.createElement(NoOkAutoAdvanceQueuePanel),
    defaultVisible: true,
    priority: 271,
    tags: ['darake', 'no-ok', 'batch', 'silent', 'auto-advance', 'safety'],
  },
  {
    id: 'silent-batch-log',
    label: 'Silent Batch Log',
    group: 'reports',
    phase: '34.2',
    component: React.createElement(SilentBatchLogPanel),
    defaultVisible: true,
    priority: 272,
    tags: ['darake', 'no-ok', 'silent', 'batch', 'log', 'reports'],
  },
];
