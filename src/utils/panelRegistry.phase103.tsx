import { MultiProjectDashboardPanel } from '../components/MultiProjectDashboardPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE103: PanelRegistryItem[] = [
  {
    id: 'multi-project-dashboard',
    label: '並列プロジェクト ダッシュボード',
    group: 'portfolio',
    phase: 'Phase 103',
    component: <MultiProjectDashboardPanel />,
    defaultVisible: true,
    priority: 103,
    tags: ['portfolio', 'projects', 'parallel', 'dashboard', 'phase103'],
    kind: 'real-data',
  },
];
