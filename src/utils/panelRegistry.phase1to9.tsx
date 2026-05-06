import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { ActionPreviewPanel } from '../components/ActionPreviewPanel';
import { AutoRunPlanPanel } from '../components/AutoRunPlanPanel';
import { CiWatchPanel } from '../components/CiWatchPanel';
import { DarakeModePanel } from '../components/DarakeModePanel';
import { DryRunArtifactCheckRecordPanel } from '../components/DryRunArtifactCheckRecordPanel';
import { FinalCheckPanel } from '../components/FinalCheckPanel';
import { FuturePanel } from '../components/FuturePanel';
import { InfoPanel } from '../components/InfoPanel';
import { IssueDraftPanel } from '../components/IssueDraftPanel';
import { IssueRecordPanel } from '../components/IssueRecordPanel';
import { LowRiskMergeCandidatePanel } from '../components/LowRiskMergeCandidatePanel';
import { LowRiskPrCandidatePanel } from '../components/LowRiskPrCandidatePanel';
import { ManualGatePanel } from '../components/ManualGatePanel';
import { Phase7SafetyPanel } from '../components/Phase7SafetyPanel';
import { PhaseQueuePanel } from '../components/PhaseQueuePanel';
import { PreviewUrlRecordPanel } from '../components/PreviewUrlRecordPanel';
import { PrCreationPreviewPanel } from '../components/PrCreationPreviewPanel';
import { PrWatchPanel } from '../components/PrWatchPanel';
import { ReviewWatchPanel } from '../components/ReviewWatchPanel';
import { StatusPanel } from '../components/StatusPanel';

export const PANEL_REGISTRY_PHASE1TO9: PanelRegistryItem[] = [
  {
    id: 'darake-mode',
    label: 'だらけモード設定',
    group: 'home',
    phase: '1-2',
    component: React.createElement(DarakeModePanel),
    defaultVisible: true,
    priority: 10,
    tags: ['home', 'settings'],
  },
  {
    id: 'issue-draft',
    label: 'Issue Draft',
    group: 'create',
    phase: '4',
    component: React.createElement(IssueDraftPanel),
    defaultVisible: true,
    priority: 20,
    tags: ['create', 'issue'],
  },
  {
    id: 'final-check',
    label: 'Final Check',
    group: 'create',
    phase: '4',
    component: React.createElement(FinalCheckPanel),
    defaultVisible: true,
    priority: 21,
    tags: ['create', 'readiness-gate'],
  },
  {
    id: 'manual-gate',
    label: 'Manual Gate',
    group: 'create',
    phase: '4',
    component: React.createElement(ManualGatePanel),
    defaultVisible: true,
    priority: 22,
    tags: ['create', 'manual-gate', 'blocked'],
  },
  {
    id: 'issue-record',
    label: 'Issue Record',
    group: 'create',
    phase: '4',
    component: React.createElement(IssueRecordPanel),
    defaultVisible: true,
    priority: 23,
    tags: ['create', 'record'],
  },
  {
    id: 'phase-queue',
    label: 'Phase Queue',
    group: 'create',
    phase: '3',
    component: React.createElement(PhaseQueuePanel),
    defaultVisible: true,
    priority: 24,
    tags: ['create', 'queue'],
  },
  {
    id: 'auto-run-plan',
    label: 'Auto Run Plan',
    group: 'create',
    phase: '6',
    component: React.createElement(AutoRunPlanPanel),
    defaultVisible: true,
    priority: 25,
    tags: ['create', 'plan'],
  },
  {
    id: 'pr-creation-preview',
    label: 'PR Creation Preview',
    group: 'run',
    phase: '5',
    component: React.createElement(PrCreationPreviewPanel),
    defaultVisible: true,
    priority: 30,
    tags: ['run', 'pr'],
  },
  {
    id: 'low-risk-pr',
    label: 'Low Risk PR Candidate',
    group: 'run',
    phase: '5',
    component: React.createElement(LowRiskPrCandidatePanel),
    defaultVisible: true,
    priority: 31,
    tags: ['run', 'pr', 'manual-gate'],
  },
  {
    id: 'low-risk-merge',
    label: 'Low Risk Merge Candidate',
    group: 'run',
    phase: '5',
    component: React.createElement(LowRiskMergeCandidatePanel),
    defaultVisible: true,
    priority: 32,
    tags: ['run', 'merge', 'manual-gate'],
  },
  {
    id: 'pr-watch',
    label: 'PR Watch',
    group: 'run',
    phase: '8',
    component: React.createElement(PrWatchPanel),
    defaultVisible: true,
    priority: 33,
    tags: ['run', 'watch'],
  },
  {
    id: 'ci-watch',
    label: 'CI Watch',
    group: 'run',
    phase: '8',
    component: React.createElement(CiWatchPanel),
    defaultVisible: true,
    priority: 34,
    tags: ['run', 'watch', 'ci'],
  },
  {
    id: 'review-watch',
    label: 'Review Watch',
    group: 'watch',
    phase: '8',
    component: React.createElement(ReviewWatchPanel),
    defaultVisible: true,
    priority: 40,
    tags: ['watch', 'review'],
  },
  {
    id: 'action-preview',
    label: 'Action Preview',
    group: 'watch',
    phase: '7',
    component: React.createElement(ActionPreviewPanel),
    defaultVisible: true,
    priority: 41,
    tags: ['watch'],
  },
  {
    id: 'phase7-safety',
    label: 'Phase 7 Safety',
    group: 'watch',
    phase: '7',
    component: React.createElement(Phase7SafetyPanel),
    defaultVisible: true,
    priority: 42,
    tags: ['watch', 'safety'],
  },
  {
    id: 'preview-url-record',
    label: 'Preview URL Record',
    group: 'watch',
    phase: '8',
    component: React.createElement(PreviewUrlRecordPanel),
    defaultVisible: true,
    priority: 43,
    tags: ['watch', 'record'],
  },
  {
    id: 'status-panel',
    label: 'Status',
    group: 'reports',
    phase: '1-9',
    component: React.createElement(StatusPanel),
    defaultVisible: true,
    priority: 200,
    tags: ['reports'],
  },
  {
    id: 'future-panel',
    label: 'Future',
    group: 'reports',
    phase: '1-9',
    component: React.createElement(FuturePanel),
    defaultVisible: true,
    priority: 201,
    tags: ['reports'],
  },
  {
    id: 'info-panel',
    label: 'Info',
    group: 'reports',
    phase: '1-9',
    component: React.createElement(InfoPanel),
    defaultVisible: true,
    priority: 202,
    tags: ['reports'],
  },
  {
    id: 'dry-run-artifact-record',
    label: 'Dry Run Artifact Check Record',
    group: 'screenshots',
    phase: '9-10',
    component: React.createElement(DryRunArtifactCheckRecordPanel),
    defaultVisible: true,
    priority: 59,
    tags: ['screenshots', 'record'],
  },
];
