import { SetupHubV2Panel } from '../components/SetupHubV2Panel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE92: PanelRegistryItem[] = [
  {
    id: 'setup-hub-v2',
    label: '初期設定ここだけ（完全版）',
    group: 'settings',
    phase: 'Phase 92',
    component: <SetupHubV2Panel />,
    defaultVisible: true,
    priority: 92,
    tags: ['setup', 'hub', 'steps', 'copy', 'darake', 'onboarding'],
  },
];
