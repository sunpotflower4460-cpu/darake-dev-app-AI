import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { GitHubDryRunOperationPanel } from '../components/GitHubDryRunOperationPanel';
import { IssueCreationDryRunPanel } from '../components/IssueCreationDryRunPanel';
import { PrCreationDryRunPanel } from '../components/PrCreationDryRunPanel';
import { WorkflowDispatchDryRunPanel } from '../components/WorkflowDispatchDryRunPanel';
import { MergeDryRunGatePanel } from '../components/MergeDryRunGatePanel';
import { GitHubExecutionRecordPanel } from '../components/GitHubExecutionRecordPanel';
import { GitHubDryRunCompletionReportPanel } from '../components/GitHubDryRunCompletionReportPanel';

export const PANEL_REGISTRY_PHASE27: PanelRegistryItem[] = [
  {
    id: 'github-dry-run-operation',
    label: 'GitHub Dry-run Operation',
    group: 'run',
    phase: '27.1/27.2',
    component: React.createElement(GitHubDryRunOperationPanel),
    defaultVisible: true,
    priority: 220,
    tags: ['dry-run', 'github', 'manual-gate', 'copy-only', 'safety'],
  },
  {
    id: 'issue-creation-dry-run',
    label: 'Issue Creation Dry-run',
    group: 'run',
    phase: '27.3',
    component: React.createElement(IssueCreationDryRunPanel),
    defaultVisible: true,
    priority: 221,
    tags: ['dry-run', 'github', 'copy-only', 'safety'],
  },
  {
    id: 'pr-creation-dry-run',
    label: 'PR Creation Dry-run',
    group: 'run',
    phase: '27.4',
    component: React.createElement(PrCreationDryRunPanel),
    defaultVisible: true,
    priority: 222,
    tags: ['dry-run', 'github', 'copy-only', 'safety'],
  },
  {
    id: 'workflow-dispatch-dry-run',
    label: 'Workflow Dispatch Dry-run',
    group: 'run',
    phase: '27.5',
    component: React.createElement(WorkflowDispatchDryRunPanel),
    defaultVisible: true,
    priority: 223,
    tags: ['dry-run', 'github', 'copy-only', 'manual-gate', 'safety'],
  },
  {
    id: 'merge-dry-run-gate',
    label: 'Merge Dry-run Gate',
    group: 'run',
    phase: '27.6',
    component: React.createElement(MergeDryRunGatePanel),
    defaultVisible: true,
    priority: 224,
    tags: ['dry-run', 'github', 'manual-gate', 'safety'],
  },
  {
    id: 'github-execution-record',
    label: 'GitHub Execution Record',
    group: 'run',
    phase: '27.7',
    component: React.createElement(GitHubExecutionRecordPanel),
    defaultVisible: true,
    priority: 225,
    tags: ['github', 'manual-gate', 'copy-only'],
  },
  {
    id: 'github-dry-run-completion-report',
    label: 'GitHub Dry-run Completion Report',
    group: 'reports',
    phase: '27.8',
    component: React.createElement(GitHubDryRunCompletionReportPanel),
    defaultVisible: true,
    priority: 226,
    tags: ['dry-run', 'github', 'reports', 'safety'],
  },
];
