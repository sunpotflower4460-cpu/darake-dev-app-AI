import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { AutoMergeSettingsPanel } from '../components/AutoMergeSettingsPanel';
import { MergeSafetyCard } from '../components/MergeSafetyCard';
import { PostMergeWatchCard } from '../components/PostMergeWatchCard';
import { RollbackSuggestionCard } from '../components/RollbackSuggestionCard';
import { DarakeSetupChecklistPanel } from '../components/DarakeSetupChecklistPanel';
import { DarakeTestRunPanel } from '../components/DarakeTestRunPanel';
import { FirstStartMinimalDashboard } from '../components/FirstStartMinimalDashboard';

export const PANEL_REGISTRY_PHASE55: PanelRegistryItem[] = [
  {
    id: 'first-start-minimal-dashboard',
    label: 'だらけ最小ダッシュボード',
    group: 'home',
    phase: '55.1',
    component: React.createElement(FirstStartMinimalDashboard),
    defaultVisible: true,
    priority: 330,
    tags: ['darake', 'home', 'first-start', 'minimal', 'dashboard'],
  },
  {
    id: 'merge-safety-card',
    label: 'マージ安全カード',
    group: 'home',
    phase: '55.2',
    component: React.createElement(MergeSafetyCard),
    defaultVisible: true,
    priority: 331,
    tags: ['darake', 'merge', 'safety', 'home', 'first-start'],
  },
  {
    id: 'post-merge-watch-card',
    label: 'マージ後監視カード',
    group: 'home',
    phase: '55.3',
    component: React.createElement(PostMergeWatchCard),
    defaultVisible: true,
    priority: 332,
    tags: ['darake', 'merge', 'watch', 'home', 'first-start'],
  },
  {
    id: 'rollback-suggestion-card',
    label: 'ロールバック手順カード',
    group: 'home',
    phase: '55.4',
    component: React.createElement(RollbackSuggestionCard),
    defaultVisible: true,
    priority: 333,
    tags: ['darake', 'rollback', 'home', 'first-start'],
  },
  {
    id: 'auto-merge-settings-panel',
    label: '自動マージ設定',
    group: 'settings',
    phase: '55.5',
    component: React.createElement(AutoMergeSettingsPanel),
    defaultVisible: true,
    priority: 334,
    tags: ['darake', 'settings', 'merge', 'auto'],
  },
  {
    id: 'darake-setup-checklist',
    label: 'Cloudflare / GitHub 設定チェック',
    group: 'settings',
    phase: '55.6',
    component: React.createElement(DarakeSetupChecklistPanel),
    defaultVisible: true,
    priority: 335,
    tags: ['darake', 'settings', 'cloudflare', 'github', 'setup', 'checklist'],
  },
  {
    id: 'darake-test-run-panel',
    label: '実地テストランナー',
    group: 'home',
    phase: '55.7',
    component: React.createElement(DarakeTestRunPanel),
    defaultVisible: true,
    priority: 336,
    tags: ['darake', 'test', 'run', 'preset', 'home'],
  },
];
