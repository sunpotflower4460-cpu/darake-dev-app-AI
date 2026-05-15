import { DeepBuildModePanel } from '../components/DeepBuildModePanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE90: PanelRegistryItem[] = [
  {
    id: 'deep-build-mode',
    label: '熟成モード',
    group: 'run',
    phase: 'Phase 90',
    component: <DeepBuildModePanel />,
    defaultVisible: true,
    priority: 90,
    tags: ['deep-build', 'completion', 'autopilot', 'review', 'darake'],
  },
];
