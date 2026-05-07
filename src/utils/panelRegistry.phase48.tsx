import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { OmakaseStartPanel } from '../components/OmakaseStartPanel';
import { DarakeNowCard } from '../components/DarakeNowCard';
import { DarakeLevelPanel } from '../components/DarakeLevelPanel';

export const PANEL_REGISTRY_PHASE48: PanelRegistryItem[] = [
  {
    id: 'omakase-start',
    label: 'おまかせ開始',
    group: 'home',
    phase: '48.1',
    component: React.createElement(OmakaseStartPanel),
    defaultVisible: true,
    priority: 258.35,
    tags: ['darake', 'omakase', 'first-start', 'home', 'beginner', 'issue'],
  },
  {
    id: 'darake-now-card',
    label: 'いまここ',
    group: 'home',
    phase: '48.2',
    component: React.createElement(DarakeNowCard),
    defaultVisible: true,
    priority: 258.45,
    tags: ['darake', 'now', 'first-start', 'home', 'beginner', 'progress'],
  },
  {
    id: 'darake-level',
    label: 'だらけレベル',
    group: 'settings',
    phase: '48.3',
    component: React.createElement(DarakeLevelPanel),
    defaultVisible: true,
    priority: 310,
    tags: ['darake', 'level', 'settings', 'preference'],
  },
];
