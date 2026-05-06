import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { AppReviewRejectionRecordPanel } from '../components/AppReviewRejectionRecordPanel';
import { AppReviewResponseDraftPanel } from '../components/AppReviewResponseDraftPanel';
import { AppStoreConnectApiCandidateDraftPanel } from '../components/AppStoreConnectApiCandidateDraftPanel';
import { AppStoreConnectInputPackPanel } from '../components/AppStoreConnectInputPackPanel';
import { AppStoreMetadataDraftPanel } from '../components/AppStoreMetadataDraftPanel';
import { AppStorePrepCompletionReportPanel } from '../components/AppStorePrepCompletionReportPanel';
import { AppStoreScreenshotChecklistPanel } from '../components/AppStoreScreenshotChecklistPanel';
import { FinalSubmissionGatePanel } from '../components/FinalSubmissionGatePanel';
import { ManualGateNotificationTemplatePanel } from '../components/ManualGateNotificationTemplatePanel';
import { NotificationDigestPanel } from '../components/NotificationDigestPanel';
import { NotificationDraftPanel } from '../components/NotificationDraftPanel';
import { PrivacyAgeRatingDraftPanel } from '../components/PrivacyAgeRatingDraftPanel';
import { RejectionFixIssueDraftPanel } from '../components/RejectionFixIssueDraftPanel';
import { ResubmissionChecklistPanel } from '../components/ResubmissionChecklistPanel';
import { StoreCopyTemplatePanel } from '../components/StoreCopyTemplatePanel';
import { SubmissionControlRoomPanel } from '../components/SubmissionControlRoomPanel';
import { SubmitForReviewManualGuidePanel } from '../components/SubmitForReviewManualGuidePanel';
import { TestFlightPrepChecklistPanel } from '../components/TestFlightPrepChecklistPanel';

export const PANEL_REGISTRY_PHASE11TO14: PanelRegistryItem[] = [
  // Phase 11: Notification System
  {
    id: 'notification-draft',
    label: 'Notification Draft',
    group: 'submit',
    phase: '11',
    component: React.createElement(NotificationDraftPanel),
    defaultVisible: true,
    priority: 80,
    tags: ['submit', 'draft'],
  },
  {
    id: 'notification-digest',
    label: 'Notification Digest',
    group: 'submit',
    phase: '11',
    component: React.createElement(NotificationDigestPanel),
    defaultVisible: true,
    priority: 81,
    tags: ['submit', 'reports'],
  },
  {
    id: 'manual-gate-notification',
    label: 'Manual Gate Notification Template',
    group: 'submit',
    phase: '11',
    component: React.createElement(ManualGateNotificationTemplatePanel),
    defaultVisible: true,
    priority: 82,
    tags: ['submit', 'manual-gate'],
  },
  // Phase 12: App Store Prep
  {
    id: 'app-store-metadata',
    label: 'App Store Metadata Draft',
    group: 'submit',
    phase: '12',
    component: React.createElement(AppStoreMetadataDraftPanel),
    defaultVisible: true,
    priority: 83,
    tags: ['submit', 'draft'],
  },
  {
    id: 'store-copy-template',
    label: 'Store Copy Template',
    group: 'submit',
    phase: '12',
    component: React.createElement(StoreCopyTemplatePanel),
    defaultVisible: true,
    priority: 84,
    tags: ['submit', 'templates'],
  },
  {
    id: 'privacy-age-rating',
    label: 'Privacy Age Rating Draft',
    group: 'submit',
    phase: '12',
    component: React.createElement(PrivacyAgeRatingDraftPanel),
    defaultVisible: true,
    priority: 85,
    tags: ['submit', 'draft'],
  },
  {
    id: 'app-store-screenshot-checklist',
    label: 'App Store Screenshot Checklist',
    group: 'submit',
    phase: '12',
    component: React.createElement(AppStoreScreenshotChecklistPanel),
    defaultVisible: true,
    priority: 86,
    tags: ['submit', 'readiness-gate'],
  },
  {
    id: 'app-store-prep-completion',
    label: 'App Store Prep Completion Report',
    group: 'submit',
    phase: '12',
    component: React.createElement(AppStorePrepCompletionReportPanel),
    defaultVisible: true,
    priority: 87,
    tags: ['submit', 'reports'],
  },
  // Phase 13: Submission Control Room
  {
    id: 'submission-control-room',
    label: 'Submission Control Room',
    group: 'submit',
    phase: '13',
    component: React.createElement(SubmissionControlRoomPanel),
    defaultVisible: true,
    priority: 88,
    tags: ['submit', 'manual-gate', 'blocked'],
  },
  {
    id: 'app-store-connect-input',
    label: 'App Store Connect Input Pack',
    group: 'submit',
    phase: '13',
    component: React.createElement(AppStoreConnectInputPackPanel),
    defaultVisible: true,
    priority: 89,
    tags: ['submit'],
  },
  {
    id: 'app-store-connect-api-candidate',
    label: 'App Store Connect API Candidate Draft',
    group: 'submit',
    phase: '13',
    component: React.createElement(AppStoreConnectApiCandidateDraftPanel),
    defaultVisible: true,
    priority: 90,
    tags: ['submit', 'draft'],
  },
  {
    id: 'test-flight-prep',
    label: 'TestFlight Prep Checklist',
    group: 'submit',
    phase: '13',
    component: React.createElement(TestFlightPrepChecklistPanel),
    defaultVisible: true,
    priority: 91,
    tags: ['submit', 'readiness-gate'],
  },
  {
    id: 'final-submission-gate',
    label: 'Final Submission Gate',
    group: 'submit',
    phase: '13',
    component: React.createElement(FinalSubmissionGatePanel),
    defaultVisible: true,
    priority: 92,
    tags: ['submit', 'manual-gate', 'blocked'],
  },
  {
    id: 'submit-for-review-guide',
    label: 'Submit for Review Manual Guide',
    group: 'submit',
    phase: '13',
    component: React.createElement(SubmitForReviewManualGuidePanel),
    defaultVisible: true,
    priority: 93,
    tags: ['submit', 'manual-gate'],
  },
  // Phase 14: Rejection Control Room
  {
    id: 'rejection-record',
    label: 'App Review Rejection Record',
    group: 'submit',
    phase: '14',
    component: React.createElement(AppReviewRejectionRecordPanel),
    defaultVisible: true,
    priority: 94,
    tags: ['submit', 'record'],
  },
  {
    id: 'rejection-response-draft',
    label: 'App Review Response Draft',
    group: 'submit',
    phase: '14',
    component: React.createElement(AppReviewResponseDraftPanel),
    defaultVisible: true,
    priority: 95,
    tags: ['submit', 'draft'],
  },
  {
    id: 'rejection-fix-issue',
    label: 'Rejection Fix Issue Draft',
    group: 'submit',
    phase: '14',
    component: React.createElement(RejectionFixIssueDraftPanel),
    defaultVisible: true,
    priority: 96,
    tags: ['submit', 'draft'],
  },
  {
    id: 'resubmission-checklist',
    label: 'Resubmission Checklist',
    group: 'submit',
    phase: '14',
    component: React.createElement(ResubmissionChecklistPanel),
    defaultVisible: true,
    priority: 97,
    tags: ['submit', 'readiness-gate'],
  },
];
