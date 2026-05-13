import { DarakeInitialSetupChecklistPanel } from '../components/DarakeInitialSetupChecklistPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE83: PanelRegistryItem[] = [
  {
    id: 'darake-initial-setup-checklist',
    label: 'だらけ初期設定チェックリスト',
    group: 'settings',
    phase: 'Phase 83',
    component: <DarakeInitialSetupChecklistPanel />,
    defaultVisible: true,
    priority: 830,
    tags: ['setup', 'secrets', 'cloudflare', 'github', 'beginner'],
  },
];
