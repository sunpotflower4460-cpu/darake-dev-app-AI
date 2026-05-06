import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { NotificationDryRunTargetPanel } from '../components/NotificationDryRunTargetPanel';
import { NotificationPayloadDryRunBuilderPanel } from '../components/NotificationPayloadDryRunBuilderPanel';
import { NotificationSafetyGatePanel } from '../components/NotificationSafetyGatePanel';
import { ManualNotificationSendPackPanel } from '../components/ManualNotificationSendPackPanel';
import { NotificationSentRecordPanel } from '../components/NotificationSentRecordPanel';
import { ExternalNotificationDryRunCompletionReportPanel } from '../components/ExternalNotificationDryRunCompletionReportPanel';

export const PANEL_REGISTRY_PHASE26: PanelRegistryItem[] = [
  {
    id: 'notification-dry-run-target',
    label: 'Notification Dry-run Target',
    group: 'watch',
    phase: '26.1',
    component: React.createElement(NotificationDryRunTargetPanel),
    defaultVisible: true,
    priority: 210,
    tags: ['notification', 'dry-run', 'copy-only', 'external', 'safety'],
  },
  {
    id: 'notification-payload-dry-run-builder',
    label: 'Notification Payload Dry-run Builder',
    group: 'create',
    phase: '26.2',
    component: React.createElement(NotificationPayloadDryRunBuilderPanel),
    defaultVisible: true,
    priority: 211,
    tags: ['notification', 'dry-run', 'copy-only', 'manual-gate'],
  },
  {
    id: 'notification-safety-gate',
    label: 'Notification Safety Gate',
    group: 'watch',
    phase: '26.3',
    component: React.createElement(NotificationSafetyGatePanel),
    defaultVisible: true,
    priority: 212,
    tags: ['notification', 'safety', 'dry-run', 'manual-gate'],
  },
  {
    id: 'manual-notification-send-pack',
    label: 'Manual Notification Send Pack',
    group: 'create',
    phase: '26.4',
    component: React.createElement(ManualNotificationSendPackPanel),
    defaultVisible: true,
    priority: 213,
    tags: ['notification', 'manual-gate', 'copy-only', 'external'],
  },
  {
    id: 'notification-sent-record',
    label: 'Notification Sent Record',
    group: 'watch',
    phase: '26.5',
    component: React.createElement(NotificationSentRecordPanel),
    defaultVisible: true,
    priority: 214,
    tags: ['notification', 'dry-run', 'manual-gate'],
  },
  {
    id: 'external-notification-dry-run-completion-report',
    label: 'External Notification Dry-run Completion Report',
    group: 'reports',
    phase: '26.6',
    component: React.createElement(ExternalNotificationDryRunCompletionReportPanel),
    defaultVisible: true,
    priority: 215,
    tags: ['notification', 'dry-run', 'external', 'safety', 'reports'],
  },
];
