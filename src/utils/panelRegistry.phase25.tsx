import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { AiExecutionCandidateDraftPanel } from '../components/AiExecutionCandidateDraftPanel';
import { AiPreparationCompletionReportPanel } from '../components/AiPreparationCompletionReportPanel';
import { AiPromptPackBuilderPanel } from '../components/AiPromptPackBuilderPanel';
import { AiProviderCandidatePanel } from '../components/AiProviderCandidatePanel';
import { AiResultIntakeGuidePanel } from '../components/AiResultIntakeGuidePanel';
import { AiReviewOutputFormatPanel } from '../components/AiReviewOutputFormatPanel';
import { AiTaskTypeRegistryPanel } from '../components/AiTaskTypeRegistryPanel';

export const PANEL_REGISTRY_PHASE25: PanelRegistryItem[] = [
  {
    id: 'ai-provider-candidate',
    label: 'AI Provider Candidate',
    group: 'settings',
    phase: '25.1',
    component: React.createElement(AiProviderCandidatePanel),
    defaultVisible: true,
    priority: 200,
    tags: ['settings', 'ai-review', 'draft'],
  },
  {
    id: 'ai-task-type-registry',
    label: 'AI Task Type Registry',
    group: 'reports',
    phase: '25.2',
    component: React.createElement(AiTaskTypeRegistryPanel),
    defaultVisible: true,
    priority: 201,
    tags: ['reports', 'ai-review'],
  },
  {
    id: 'ai-prompt-pack-builder',
    label: 'AI Prompt Pack Builder',
    group: 'create',
    phase: '25.3',
    component: React.createElement(AiPromptPackBuilderPanel),
    defaultVisible: true,
    priority: 202,
    tags: ['create', 'ai-review', 'manual-gate'],
  },
  {
    id: 'ai-review-output-format',
    label: 'AI Review Output Format',
    group: 'reports',
    phase: '25.4',
    component: React.createElement(AiReviewOutputFormatPanel),
    defaultVisible: true,
    priority: 203,
    tags: ['reports', 'ai-review'],
  },
  {
    id: 'ai-result-intake-guide',
    label: 'AI Result Intake Guide',
    group: 'watch',
    phase: '25.5',
    component: React.createElement(AiResultIntakeGuidePanel),
    defaultVisible: true,
    priority: 204,
    tags: ['watch', 'ai-review', 'manual-gate'],
  },
  {
    id: 'ai-execution-candidate-draft',
    label: 'AI Execution Candidate Draft',
    group: 'settings',
    phase: '25.6',
    component: React.createElement(AiExecutionCandidateDraftPanel),
    defaultVisible: true,
    priority: 205,
    tags: ['settings', 'ai-review', 'draft-only'],
  },
  {
    id: 'ai-preparation-completion-report',
    label: 'AI Preparation Completion Report',
    group: 'reports',
    phase: '25.7',
    component: React.createElement(AiPreparationCompletionReportPanel),
    defaultVisible: true,
    priority: 206,
    tags: ['reports', 'ai-review'],
  },
];
