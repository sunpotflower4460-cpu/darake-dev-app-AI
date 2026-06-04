import { DarakeBackupPanel } from '../components/DarakeBackupPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE107: PanelRegistryItem[] = [
  {
    id: 'darake-backup',
    label: 'バックアップ & 復元',
    group: 'settings',
    phase: 'Phase 107',
    component: <DarakeBackupPanel />,
    defaultVisible: true,
    priority: 107,
    tags: ['backup', 'import', 'export', 'restore', 'cross-tab', 'settings', 'phase107'],
    kind: 'real-data',
  },
];
