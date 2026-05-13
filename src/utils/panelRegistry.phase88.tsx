import { DarakeSetupHubPanel } from '../components/DarakeSetupHubPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE88: PanelRegistryItem[] = [
  {
    id: 'darake-setup-hub',
    label: '初期設定ここだけ',
    group: 'settings',
    phase: 'Phase 88',
    component: <DarakeSetupHubPanel />,
    defaultVisible: true,
    priority: 88,
    tags: ['setup', 'hub', 'darake', 'shortcut', 'copy'],
  },
];
