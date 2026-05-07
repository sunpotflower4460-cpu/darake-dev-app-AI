import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { FirstStartRouteGuardPanel } from '../components/FirstStartRouteGuardPanel';
import { FirstLaunchCarePanel } from '../components/FirstLaunchCarePanel';
import { FirstLaunchCompletionReportPanel } from '../components/FirstLaunchCompletionReportPanel';
import { GentleAppStartFormPanel } from '../components/GentleAppStartFormPanel';
import { GentleBlueprintPreviewPanel } from '../components/GentleBlueprintPreviewPanel';
import { GentleStartCompletionReportPanel } from '../components/GentleStartCompletionReportPanel';
import { PonStartPanel } from '../components/PonStartPanel';
import { GitHubDirectIssueCreatePanel } from '../components/GitHubDirectIssueCreatePanel';
import { GitHubStartPanel } from '../components/GitHubStartPanel';
import { GitHubIssueRecordPanel } from '../components/GitHubIssueRecordPanel';
import { CloudAgentStartPanel } from '../components/CloudAgentStartPanel';
import { GitHubStartProgressPanel } from '../components/GitHubStartProgressPanel';
import { BeginnerNextStepCardPanel } from '../components/BeginnerNextStepCardPanel';
import { FirstStartAdvancedOpenPanel } from '../components/FirstStartAdvancedOpenPanel';
import { FirstAppStartCompletionReportPanel } from '../components/FirstAppStartCompletionReportPanel';

export const PANEL_REGISTRY_PHASE45TO47: PanelRegistryItem[] = [
  {
    id: 'first-start-route-guard',
    label: '初回導線ガード',
    group: 'home',
    phase: '48',
    component: React.createElement(FirstStartRouteGuardPanel),
    defaultVisible: true,
    priority: 254,
    tags: ['darake', 'first-start', 'route-guard', 'beginner'],
  },
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
    id: 'github-direct-issue-create',
    label: 'GitHub Issue直接作成',
    group: 'home',
    phase: '47.05',
    component: React.createElement(GitHubDirectIssueCreatePanel),
    defaultVisible: true,
    priority: 258.4,
    tags: ['darake', 'github', 'issue', 'direct-create', 'first-start', 'home', 'beginner'],
  },
  {
    id: 'github-start',
    label: 'GitHubで始める',
    group: 'home',
    phase: '47.1',
    component: React.createElement(GitHubStartPanel),
    defaultVisible: true,
    priority: 258.5,
    tags: ['darake', 'github', 'first-start', 'home', 'beginner'],
  },
  {
    id: 'github-issue-record',
    label: '作ったIssueを記録する',
    group: 'home',
    phase: '47.2',
    component: React.createElement(GitHubIssueRecordPanel),
    defaultVisible: true,
    priority: 258.6,
    tags: ['darake', 'github', 'issue', 'first-start', 'home', 'beginner'],
  },
  {
    id: 'cloud-agent-start',
    label: 'Cloud Agentに作業を始めてもらう',
    group: 'home',
    phase: '47.2',
    component: React.createElement(CloudAgentStartPanel),
    defaultVisible: true,
    priority: 258.7,
    tags: ['darake', 'cloud-agent', 'first-start', 'home', 'beginner'],
  },
  {
    id: 'github-start-progress',
    label: 'いまここ',
    group: 'home',
    phase: '47.2',
    component: React.createElement(GitHubStartProgressPanel),
    defaultVisible: true,
    priority: 258.8,
    tags: ['darake', 'github', 'progress', 'first-start', 'home', 'beginner'],
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
    id: 'first-start-advanced-open',
    label: '詳細な管制室を開く',
    group: 'home',
    phase: '48.5',
    component: React.createElement(FirstStartAdvancedOpenPanel),
    defaultVisible: true,
    priority: 260,
    tags: ['darake', 'first-start', 'advanced', 'optional'],
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
