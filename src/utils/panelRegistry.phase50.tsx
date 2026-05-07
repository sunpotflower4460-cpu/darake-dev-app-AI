import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { AutoFixLoopPanel } from '../components/AutoFixLoopPanel';
import { MergeCandidateCard } from '../components/MergeCandidateCard';

export const PANEL_REGISTRY_PHASE50: PanelRegistryItem[] = [
  {
    id: 'auto-fix-loop-panel',
    label: '自動修正ループ',
    group: 'home',
    phase: '50.1',
    component: React.createElement(AutoFixLoopPanel),
    defaultVisible: true,
    priority: 258.8,
    tags: ['darake', 'agent', 'ci', 'fix', 'auto', 'first-start', 'home'],
  },
  {
    id: 'merge-candidate-card',
    label: 'マージ候補カード',
    group: 'home',
    phase: '50.2',
    component: React.createElement(MergeCandidateCard),
    defaultVisible: true,
    priority: 258.9,
    tags: ['darake', 'agent', 'pr', 'merge', 'first-start', 'home'],
  },
];
