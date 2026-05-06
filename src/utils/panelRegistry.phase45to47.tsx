import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { FirstLaunchCarePanel } from '../components/FirstLaunchCarePanel';
import { FirstLaunchCompletionReportPanel } from '../components/FirstLaunchCompletionReportPanel';
import { GentleAppStartFormPanel } from '../components/GentleAppStartFormPanel';
import { GentleBlueprintPreviewPanel } from '../components/GentleBlueprintPreviewPanel';
import { GentleStartCompletionReportPanel } from '../components/GentleStartCompletionReportPanel';
import { PonStartPanel } from '../components/PonStartPanel';
import { BeginnerNextStepCardPanel } from '../components/BeginnerNextStepCardPanel';
import { FirstAppStartCompletionReportPanel } from '../components/FirstAppStartCompletionReportPanel';

export const PANEL_REGISTRY_PHASE45TO47: PanelRegistryItem[] = [
  // Phase 45: First Launch Care Onboarding
  {
    id: 'first-launch-care',
    label: '初回介護オンボーディング',
    group: 'home',
    phase: '45',
    component: React.createElement(FirstLaunchCarePanel),
    defaultVisible: true,
    priority: 255,
    tags: ['darake', 'onboarding', 'first-start', 'home', 'beginner'],
  },
  {
    id: 'first-launch-completion-report',
    label: '初回介護 完成レポート',
    group: 'reports',
    phase: '45.3',
    component: React.createElement(FirstLaunchCompletionReportPanel),
    defaultVisible: true,
    priority: 305,
    tags: ['darake', 'onboarding', 'first-start', 'reports', 'completion'],
  },

  // Phase 46: Gentle App Start Form
  {
    id: 'gentle-app-start-form',
    label: 'やさしいフォーム',
    group: 'home',
    phase: '46',
    component: React.createElement(GentleAppStartFormPanel),
    defaultVisible: true,
    priority: 256,
    tags: ['darake', 'form', 'first-start', 'home', 'beginner'],
  },
  {
    id: 'gentle-blueprint-preview',
    label: 'やさしい設計書プレビュー',
    group: 'home',
    phase: '46.4',
    component: React.createElement(GentleBlueprintPreviewPanel),
    defaultVisible: true,
    priority: 257,
    tags: ['darake', 'blueprint', 'first-start', 'home', 'beginner'],
  },
  {
    id: 'gentle-start-completion-report',
    label: 'やさしい開始 完成レポート',
    group: 'reports',
    phase: '46.5',
    component: React.createElement(GentleStartCompletionReportPanel),
    defaultVisible: true,
    priority: 306,
    tags: ['darake', 'form', 'first-start', 'reports', 'completion'],
  },

  // Phase 47: Pon Start Pack
  {
    id: 'pon-start',
    label: 'ぽん開始パック',
    group: 'home',
    phase: '47',
    component: React.createElement(PonStartPanel),
    defaultVisible: true,
    priority: 258,
    tags: ['darake', 'pon-start', 'first-start', 'home', 'beginner'],
  },
  {
    id: 'beginner-next-step-card',
    label: '次はこれだけ',
    group: 'home',
    phase: '47.3',
    component: React.createElement(BeginnerNextStepCardPanel),
    defaultVisible: true,
    priority: 259,
    tags: ['darake', 'beginner', 'first-start', 'home', 'next-step'],
  },
  {
    id: 'first-app-start-completion-report',
    label: 'First App Start 完成レポート',
    group: 'reports',
    phase: '47.5',
    component: React.createElement(FirstAppStartCompletionReportPanel),
    defaultVisible: true,
    priority: 307,
    tags: ['darake', 'first-start', 'reports', 'completion'],
  },
];
