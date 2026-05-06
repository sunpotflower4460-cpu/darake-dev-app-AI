import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { AiReviewCompletionReportPanel } from '../components/AiReviewCompletionReportPanel';
import { AiReviewFixIssueDraftPanel } from '../components/AiReviewFixIssueDraftPanel';
import { AiReviewInputPackPanel } from '../components/AiReviewInputPackPanel';
import { AiReviewResultRecordPanel } from '../components/AiReviewResultRecordPanel';
import { AppFactoryCompletionReportPanel } from '../components/AppFactoryCompletionReportPanel';
import { AppFactoryRoadmapPanel } from '../components/AppFactoryRoadmapPanel';
import { AppIdeaBatchPanel } from '../components/AppIdeaBatchPanel';
import { ExternalNotificationChannelPanel } from '../components/ExternalNotificationChannelPanel';
import { ExternalNotificationCompletionReportPanel } from '../components/ExternalNotificationCompletionReportPanel';
import { GitHubManualOperationGuidePanel } from '../components/GitHubManualOperationGuidePanel';
import { GitHubOperationCandidatePanel } from '../components/GitHubOperationCandidatePanel';
import { GitHubSemiAutomationCompletionReportPanel } from '../components/GitHubSemiAutomationCompletionReportPanel';
import { IdeaToBlueprintConverterPanel } from '../components/IdeaToBlueprintConverterPanel';
import { LaunchPromotionMemoPanel } from '../components/LaunchPromotionMemoPanel';
import { ManualNotificationSendGuidePanel } from '../components/ManualNotificationSendGuidePanel';
import { MonetizationPlanPanel } from '../components/MonetizationPlanPanel';
import { OperationCostChecklistPanel } from '../components/OperationCostChecklistPanel';
import { PrMergeCandidateGatePanel } from '../components/PrMergeCandidateGatePanel';
import { RevenueOperationsReportPanel } from '../components/RevenueOperationsReportPanel';
import { WebhookPayloadDraftPanel } from '../components/WebhookPayloadDraftPanel';
import { WorkflowDispatchCandidateDraftPanel } from '../components/WorkflowDispatchCandidateDraftPanel';

export const PANEL_REGISTRY_PHASE19TO23: PanelRegistryItem[] = [
  // Phase 19: External Notification Candidate Room
  {
    id: 'external-notification-channel',
    label: 'External Notification Channel',
    group: 'settings',
    phase: '19',
    component: React.createElement(ExternalNotificationChannelPanel),
    defaultVisible: true,
    priority: 140,
    tags: ['settings', 'draft'],
  },
  {
    id: 'webhook-payload-draft',
    label: 'Webhook Payload Draft',
    group: 'settings',
    phase: '19',
    component: React.createElement(WebhookPayloadDraftPanel),
    defaultVisible: true,
    priority: 141,
    tags: ['settings', 'draft'],
  },
  {
    id: 'manual-notification-guide',
    label: 'Manual Notification Send Guide',
    group: 'create',
    phase: '19',
    component: React.createElement(ManualNotificationSendGuidePanel),
    defaultVisible: true,
    priority: 142,
    tags: ['create', 'manual-gate'],
  },
  {
    id: 'external-notification-completion',
    label: 'External Notification Completion Report',
    group: 'reports',
    phase: '19',
    component: React.createElement(ExternalNotificationCompletionReportPanel),
    defaultVisible: true,
    priority: 143,
    tags: ['reports'],
  },
  // Phase 20: GitHub Semi-Automation Room
  {
    id: 'github-operation-candidate',
    label: 'GitHub Operation Candidate',
    group: 'run',
    phase: '20',
    component: React.createElement(GitHubOperationCandidatePanel),
    defaultVisible: true,
    priority: 150,
    tags: ['run', 'manual-gate'],
  },
  {
    id: 'workflow-dispatch-candidate',
    label: 'Workflow Dispatch Candidate Draft',
    group: 'run',
    phase: '20',
    component: React.createElement(WorkflowDispatchCandidateDraftPanel),
    defaultVisible: true,
    priority: 151,
    tags: ['run', 'draft', 'manual-gate'],
  },
  {
    id: 'pr-merge-candidate-gate',
    label: 'PR Merge Candidate Gate',
    group: 'run',
    phase: '20',
    component: React.createElement(PrMergeCandidateGatePanel),
    defaultVisible: true,
    priority: 152,
    tags: ['run', 'manual-gate', 'blocked'],
  },
  {
    id: 'github-manual-operation-guide',
    label: 'GitHub Manual Operation Guide',
    group: 'run',
    phase: '20',
    component: React.createElement(GitHubManualOperationGuidePanel),
    defaultVisible: true,
    priority: 153,
    tags: ['run', 'manual-gate'],
  },
  {
    id: 'github-semi-automation-completion',
    label: 'GitHub Semi-Automation Completion Report',
    group: 'reports',
    phase: '20',
    component: React.createElement(GitHubSemiAutomationCompletionReportPanel),
    defaultVisible: true,
    priority: 154,
    tags: ['reports'],
  },
  // Phase 21: AI Review Integration Room
  {
    id: 'ai-review-input-pack',
    label: 'AI Review Input Pack',
    group: 'create',
    phase: '21',
    component: React.createElement(AiReviewInputPackPanel),
    defaultVisible: true,
    priority: 160,
    tags: ['create', 'ai-review'],
  },
  {
    id: 'ai-review-result-record',
    label: 'AI Review Result Record',
    group: 'watch',
    phase: '21',
    component: React.createElement(AiReviewResultRecordPanel),
    defaultVisible: true,
    priority: 161,
    tags: ['watch', 'ai-review', 'record'],
  },
  {
    id: 'ai-review-fix-issue',
    label: 'AI Review Fix Issue Draft',
    group: 'create',
    phase: '21',
    component: React.createElement(AiReviewFixIssueDraftPanel),
    defaultVisible: true,
    priority: 162,
    tags: ['create', 'ai-review', 'draft'],
  },
  {
    id: 'ai-review-completion',
    label: 'AI Review Completion Report',
    group: 'reports',
    phase: '21',
    component: React.createElement(AiReviewCompletionReportPanel),
    defaultVisible: true,
    priority: 163,
    tags: ['reports', 'ai-review'],
  },
  // Phase 22: Revenue & Operations Notes
  {
    id: 'monetization-plan',
    label: 'Monetization Plan',
    group: 'reports',
    phase: '22',
    component: React.createElement(MonetizationPlanPanel),
    defaultVisible: true,
    priority: 170,
    tags: ['reports', 'plan'],
  },
  {
    id: 'operation-cost-checklist',
    label: 'Operation Cost Checklist',
    group: 'reports',
    phase: '22',
    component: React.createElement(OperationCostChecklistPanel),
    defaultVisible: true,
    priority: 171,
    tags: ['reports'],
  },
  {
    id: 'launch-promotion-memo',
    label: 'Launch Promotion Memo',
    group: 'reports',
    phase: '22',
    component: React.createElement(LaunchPromotionMemoPanel),
    defaultVisible: true,
    priority: 172,
    tags: ['reports', 'draft'],
  },
  {
    id: 'revenue-operations-report',
    label: 'Revenue & Operations Report',
    group: 'reports',
    phase: '22',
    component: React.createElement(RevenueOperationsReportPanel),
    defaultVisible: true,
    priority: 173,
    tags: ['reports'],
  },
  // Phase 23: App Studio Factory Mode
  {
    id: 'app-idea-batch',
    label: 'App Idea Batch',
    group: 'create',
    phase: '23',
    component: React.createElement(AppIdeaBatchPanel),
    defaultVisible: true,
    priority: 180,
    tags: ['create', 'draft'],
  },
  {
    id: 'idea-to-blueprint-converter',
    label: 'Idea to Blueprint Converter',
    group: 'templates',
    phase: '23',
    component: React.createElement(IdeaToBlueprintConverterPanel),
    defaultVisible: true,
    priority: 181,
    tags: ['templates'],
  },
  {
    id: 'app-factory-roadmap',
    label: 'App Factory Roadmap',
    group: 'templates',
    phase: '23',
    component: React.createElement(AppFactoryRoadmapPanel),
    defaultVisible: true,
    priority: 182,
    tags: ['templates', 'plan'],
  },
  {
    id: 'app-factory-completion',
    label: 'App Studio Factory Completion Report',
    group: 'reports',
    phase: '23',
    component: React.createElement(AppFactoryCompletionReportPanel),
    defaultVisible: true,
    priority: 183,
    tags: ['reports'],
  },
];
