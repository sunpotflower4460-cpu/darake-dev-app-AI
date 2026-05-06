import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { AppRegistryPanel } from '../components/AppRegistryPanel';
import { BlueprintGeneratorPanel } from '../components/BlueprintGeneratorPanel';
import { CloudAgentInstructionGeneratorPanel } from '../components/CloudAgentInstructionGeneratorPanel';
import { CrossAppNotificationDigestPanel } from '../components/CrossAppNotificationDigestPanel';
import { DarakeDevOsCompletionReportPanel } from '../components/DarakeDevOsCompletionReportPanel';
import { DarakeHomeSummaryPanel } from '../components/DarakeHomeSummaryPanel';
import { DarakeSafetySettingsPanel } from '../components/DarakeSafetySettingsPanel';
import { FeedbackIssueDraftPanel } from '../components/FeedbackIssueDraftPanel';
import { IssueDraftBatchGeneratorPanel } from '../components/IssueDraftBatchGeneratorPanel';
import { NextUpdatePlanPanel } from '../components/NextUpdatePlanPanel';
import { PortfolioCompletionReportPanel } from '../components/PortfolioCompletionReportPanel';
import { PortfolioDashboardPanel } from '../components/PortfolioDashboardPanel';
import { PostReleaseCompletionReportPanel } from '../components/PostReleaseCompletionReportPanel';
import { PostReleaseFeedbackPanel } from '../components/PostReleaseFeedbackPanel';
import { ReleaseRecordPanel } from '../components/ReleaseRecordPanel';
import { SavedBlueprintsPanel } from '../components/SavedBlueprintsPanel';
import { TodaysFocusPanel } from '../components/TodaysFocusPanel';

export const PANEL_REGISTRY_PHASE15TO18: PanelRegistryItem[] = [
  // Phase 15: Post-Release Operations
  {
    id: 'release-record',
    label: 'Release Record',
    group: 'post-release',
    phase: '15',
    component: React.createElement(ReleaseRecordPanel),
    defaultVisible: true,
    priority: 100,
    tags: ['post-release', 'record'],
  },
  {
    id: 'post-release-feedback',
    label: 'Post Release Feedback',
    group: 'post-release',
    phase: '15',
    component: React.createElement(PostReleaseFeedbackPanel),
    defaultVisible: true,
    priority: 101,
    tags: ['post-release', 'record'],
  },
  {
    id: 'feedback-issue-draft',
    label: 'Feedback Issue Draft',
    group: 'post-release',
    phase: '15',
    component: React.createElement(FeedbackIssueDraftPanel),
    defaultVisible: true,
    priority: 102,
    tags: ['post-release', 'draft'],
  },
  {
    id: 'next-update-plan',
    label: 'Next Update Plan',
    group: 'post-release',
    phase: '15',
    component: React.createElement(NextUpdatePlanPanel),
    defaultVisible: true,
    priority: 103,
    tags: ['post-release', 'plan'],
  },
  {
    id: 'post-release-completion',
    label: 'Post Release Completion Report',
    group: 'post-release',
    phase: '15',
    component: React.createElement(PostReleaseCompletionReportPanel),
    defaultVisible: true,
    priority: 104,
    tags: ['post-release', 'reports'],
  },
  // Phase 16: Portfolio Control Room
  {
    id: 'darake-home-summary',
    label: 'Darake Home Summary',
    group: 'home',
    phase: '16',
    component: React.createElement(DarakeHomeSummaryPanel),
    defaultVisible: true,
    priority: 5,
    tags: ['home', 'reports'],
  },
  {
    id: 'app-registry',
    label: 'App Registry',
    group: 'portfolio',
    phase: '16',
    component: React.createElement(AppRegistryPanel),
    defaultVisible: true,
    priority: 110,
    tags: ['portfolio', 'record'],
  },
  {
    id: 'portfolio-dashboard',
    label: 'Portfolio Dashboard',
    group: 'portfolio',
    phase: '16',
    component: React.createElement(PortfolioDashboardPanel),
    defaultVisible: true,
    priority: 111,
    tags: ['portfolio', 'reports'],
  },
  {
    id: 'todays-focus',
    label: "Today's Focus",
    group: 'portfolio',
    phase: '16',
    component: React.createElement(TodaysFocusPanel),
    defaultVisible: true,
    priority: 112,
    tags: ['portfolio', 'today'],
  },
  {
    id: 'cross-app-notification',
    label: 'Cross App Notification Digest',
    group: 'portfolio',
    phase: '16',
    component: React.createElement(CrossAppNotificationDigestPanel),
    defaultVisible: true,
    priority: 113,
    tags: ['portfolio', 'reports'],
  },
  {
    id: 'portfolio-completion',
    label: 'Portfolio Completion Report',
    group: 'portfolio',
    phase: '16',
    component: React.createElement(PortfolioCompletionReportPanel),
    defaultVisible: true,
    priority: 114,
    tags: ['portfolio', 'reports'],
  },
  // Phase 17: Template Factory
  {
    id: 'blueprint-generator',
    label: 'Blueprint Generator',
    group: 'templates',
    phase: '17',
    component: React.createElement(BlueprintGeneratorPanel),
    defaultVisible: true,
    priority: 120,
    tags: ['templates'],
  },
  {
    id: 'cloud-agent-instruction-generator',
    label: 'Cloud Agent Instruction Generator',
    group: 'templates',
    phase: '17',
    component: React.createElement(CloudAgentInstructionGeneratorPanel),
    defaultVisible: true,
    priority: 121,
    tags: ['templates'],
  },
  {
    id: 'issue-draft-batch',
    label: 'Issue Draft Batch Generator',
    group: 'templates',
    phase: '17',
    component: React.createElement(IssueDraftBatchGeneratorPanel),
    defaultVisible: true,
    priority: 122,
    tags: ['templates', 'draft'],
  },
  {
    id: 'saved-blueprints',
    label: 'Saved Blueprints',
    group: 'templates',
    phase: '17',
    component: React.createElement(SavedBlueprintsPanel),
    defaultVisible: true,
    priority: 123,
    tags: ['templates', 'record'],
  },
  // Phase 18: Darake Dev OS
  {
    id: 'darake-safety-settings',
    label: 'Darake Safety Settings',
    group: 'settings',
    phase: '18',
    component: React.createElement(DarakeSafetySettingsPanel),
    defaultVisible: true,
    priority: 130,
    tags: ['settings', 'safety'],
  },
  {
    id: 'darake-dev-os-completion',
    label: 'Darake Dev OS Completion Report',
    group: 'reports',
    phase: '18',
    component: React.createElement(DarakeDevOsCompletionReportPanel),
    defaultVisible: true,
    priority: 131,
    tags: ['reports'],
  },
];
