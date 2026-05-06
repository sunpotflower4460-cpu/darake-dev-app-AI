import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { CloudAgentJobBuilderPanel } from '../components/CloudAgentJobBuilderPanel';
import { CloudAgentJobQueuePanel } from '../components/CloudAgentJobQueuePanel';
import { CloudAgentResultRecordPanel } from '../components/CloudAgentResultRecordPanel';
import { CloudAgentRetryInstructionPanel } from '../components/CloudAgentRetryInstructionPanel';
import { NextPhaseRecommendationPanel } from '../components/NextPhaseRecommendationPanel';
import { CloudAgentControlCompletionReportPanel } from '../components/CloudAgentControlCompletionReportPanel';

export const PANEL_REGISTRY_PHASE28: PanelRegistryItem[] = [
  {
    id: 'cloud-agent-job-builder',
    label: 'Cloud Agent Job Builder',
    group: 'create',
    phase: '28.1/28.2',
    component: React.createElement(CloudAgentJobBuilderPanel),
    defaultVisible: true,
    priority: 230,
    tags: ['cloud-agent', 'copy-only', 'manual-gate', 'safety'],
  },
  {
    id: 'cloud-agent-job-queue',
    label: 'Cloud Agent Job Queue',
    group: 'run',
    phase: '28.3',
    component: React.createElement(CloudAgentJobQueuePanel),
    defaultVisible: true,
    priority: 231,
    tags: ['cloud-agent', 'copy-only', 'manual-gate'],
  },
  {
    id: 'cloud-agent-result-record',
    label: 'Cloud Agent Result Record',
    group: 'run',
    phase: '28.4',
    component: React.createElement(CloudAgentResultRecordPanel),
    defaultVisible: true,
    priority: 232,
    tags: ['cloud-agent', 'manual-gate'],
  },
  {
    id: 'cloud-agent-retry-instruction',
    label: 'Cloud Agent Retry Instruction',
    group: 'run',
    phase: '28.5',
    component: React.createElement(CloudAgentRetryInstructionPanel),
    defaultVisible: true,
    priority: 233,
    tags: ['cloud-agent', 'copy-only', 'manual-gate'],
  },
  {
    id: 'next-phase-recommendation',
    label: 'Next Phase Recommendation',
    group: 'create',
    phase: '28.6',
    component: React.createElement(NextPhaseRecommendationPanel),
    defaultVisible: true,
    priority: 234,
    tags: ['cloud-agent', 'copy-only', 'manual-gate'],
  },
  {
    id: 'cloud-agent-control-completion-report',
    label: 'Cloud Agent Control Completion Report',
    group: 'reports',
    phase: '28.7',
    component: React.createElement(CloudAgentControlCompletionReportPanel),
    defaultVisible: true,
    priority: 235,
    tags: ['cloud-agent', 'reports', 'manual-gate'],
  },
];
