import { DarakeCurrentWorkPanel } from '../components/DarakeCurrentWorkPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE105TO106: PanelRegistryItem[] = [
  {
    id: 'darake-current-work',
    label: '今の作業',
    group: 'watch',
    phase: 'Phase 105',
    component: <DarakeCurrentWorkPanel />,
    defaultVisible: true,
    priority: 105,
    tags: ['work-session', 'current', 'issue', 'pr', 'preview', 'watch', 'darake'],
  },
];
