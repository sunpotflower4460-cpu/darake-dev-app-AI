import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { ManualAiReviewSessionPanel } from '../components/ManualAiReviewSessionPanel';
import { AiReviewResultTriagePanel } from '../components/AiReviewResultTriagePanel';
import { AiReviewToCloudAgentBridgePanel } from '../components/AiReviewToCloudAgentBridgePanel';
import { AiReviewLoopCompletionReportPanel } from '../components/AiReviewLoopCompletionReportPanel';

export const PANEL_REGISTRY_PHASE29: PanelRegistryItem[] = [
  {
    id: 'manual-ai-review-session',
    label: 'Manual AI Review Session',
    group: 'create',
    phase: '29.1/29.2',
    component: React.createElement(ManualAiReviewSessionPanel),
    defaultVisible: true,
    priority: 240,
    tags: ['ai-review', 'copy-only', 'manual-gate', 'safety'],
  },
  {
    id: 'ai-review-result-triage',
    label: 'AI Review Result Triage',
    group: 'create',
    phase: '29.3',
    component: React.createElement(AiReviewResultTriagePanel),
    defaultVisible: true,
    priority: 241,
    tags: ['ai-review', 'manual-gate'],
  },
  {
    id: 'ai-review-to-cloud-agent-bridge',
    label: 'AI Review → Cloud Agent Bridge',
    group: 'create',
    phase: '29.4',
    component: React.createElement(AiReviewToCloudAgentBridgePanel),
    defaultVisible: true,
    priority: 242,
    tags: ['ai-review', 'cloud-agent', 'copy-only', 'manual-gate'],
  },
  {
    id: 'ai-review-loop-completion-report',
    label: 'AI Review Loop Completion Report',
    group: 'reports',
    phase: '29.5',
    component: React.createElement(AiReviewLoopCompletionReportPanel),
    defaultVisible: true,
    priority: 243,
    tags: ['ai-review', 'reports', 'manual-gate'],
  },
];
