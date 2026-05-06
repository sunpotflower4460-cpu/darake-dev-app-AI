import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { RealUseRehearsalPanel } from '../components/RealUseRehearsalPanel';
import { RealUseRehearsalCompletionReportPanel } from '../components/RealUseRehearsalCompletionReportPanel';
import { FrictionCutAuditPanel } from '../components/FrictionCutAuditPanel';
import { FrictionCutCompletionReportPanel } from '../components/FrictionCutCompletionReportPanel';
import { DarakeV1ReadinessPanel } from '../components/DarakeV1ReadinessPanel';
import { DarakeInternalReleaseNotesPanel } from '../components/DarakeInternalReleaseNotesPanel';
import { DarakeV1CompletionReportPanel } from '../components/DarakeV1CompletionReportPanel';

export const PANEL_REGISTRY_PHASE42TO44: PanelRegistryItem[] = [
  // Phase 42: Real-use Rehearsal
  {
    id: 'real-use-rehearsal',
    label: '通し稽古',
    group: 'home',
    phase: '42',
    component: React.createElement(RealUseRehearsalPanel),
    defaultVisible: true,
    priority: 290,
    tags: ['darake', 'rehearsal', 'real-use', 'home'],
  },
  {
    id: 'real-use-rehearsal-completion-report',
    label: '通し稽古 完成レポート',
    group: 'reports',
    phase: '42.5',
    component: React.createElement(RealUseRehearsalCompletionReportPanel),
    defaultVisible: true,
    priority: 291,
    tags: ['darake', 'rehearsal', 'reports', 'completion'],
  },

  // Phase 43: Friction Cut Audit
  {
    id: 'friction-cut-audit',
    label: '手間ゼロ監査',
    group: 'home',
    phase: '43',
    component: React.createElement(FrictionCutAuditPanel),
    defaultVisible: true,
    priority: 295,
    tags: ['darake', 'friction', 'audit', 'home'],
  },
  {
    id: 'friction-cut-completion-report',
    label: 'Friction Cut 完成レポート',
    group: 'reports',
    phase: '43.5',
    component: React.createElement(FrictionCutCompletionReportPanel),
    defaultVisible: true,
    priority: 296,
    tags: ['darake', 'friction', 'reports', 'completion'],
  },

  // Phase 44: Darake v1 Release Prep
  {
    id: 'darake-v1-readiness',
    label: 'だらけ管制室 v1 Readiness',
    group: 'home',
    phase: '44',
    component: React.createElement(DarakeV1ReadinessPanel),
    defaultVisible: true,
    priority: 300,
    tags: ['darake', 'v1', 'readiness', 'home'],
  },
  {
    id: 'darake-internal-release-notes',
    label: '内部リリースノート',
    group: 'reports',
    phase: '44.4',
    component: React.createElement(DarakeInternalReleaseNotesPanel),
    defaultVisible: true,
    priority: 301,
    tags: ['darake', 'v1', 'release-notes', 'reports'],
  },
  {
    id: 'darake-v1-completion-report',
    label: 'だらけ管制室 v1 完成レポート',
    group: 'reports',
    phase: '44.5',
    component: React.createElement(DarakeV1CompletionReportPanel),
    defaultVisible: true,
    priority: 302,
    tags: ['darake', 'v1', 'reports', 'completion'],
  },
];
