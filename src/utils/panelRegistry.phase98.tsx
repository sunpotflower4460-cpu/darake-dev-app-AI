import { AppCreationFlowPanel } from '../components/AppCreationFlowPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE98: PanelRegistryItem[] = [
  {
    id: 'app-creation-flow',
    label: 'アプリ制作フロー',
    group: 'create',
    phase: 'Phase 98',
    component: <AppCreationFlowPanel />,
    defaultVisible: true,
    priority: 98,
    tags: ['app', 'creation', 'flow', 'start', 'darake', 'v1'],
  },
];
