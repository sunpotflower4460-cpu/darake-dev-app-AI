import { DarakeMothershipV1Panel } from '../components/DarakeMothershipV1Panel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE100: PanelRegistryItem[] = [
  {
    id: 'darake-mothership-v1',
    label: 'だらけ開発母艦 v1',
    group: 'home',
    phase: 'Phase 100',
    component: <DarakeMothershipV1Panel />,
    defaultVisible: true,
    priority: 100,
    tags: ['mothership', 'v1', 'complete', 'darake', 'home'],
  },
];
