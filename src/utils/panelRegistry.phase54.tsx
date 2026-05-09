import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { SettingsHealthCenter } from '../components/SettingsHealthCenter';

export const PANEL_REGISTRY_PHASE54: PanelRegistryItem[] = [
  {
    id: 'settings-health-center',
    label: '設定チェックセンター',
    group: 'settings',
    phase: '54.1',
    component: React.createElement(SettingsHealthCenter),
    defaultVisible: true,
    priority: 320,
    tags: ['darake', 'settings', 'health', 'cloudflare', 'github', 'kv', 'telegram'],
  },
];
