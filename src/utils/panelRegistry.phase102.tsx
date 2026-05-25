import { VisionVerifyPanel } from '../components/VisionVerifyPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE102: PanelRegistryItem[] = [
  {
    id: 'vision-verify',
    label: 'スクショ vs 設計図 判定',
    group: 'screenshots',
    phase: 'Phase 102',
    component: <VisionVerifyPanel />,
    defaultVisible: true,
    priority: 102,
    tags: ['vision', 'verify', 'screenshot', 'compare', 'phase102'],
    kind: 'real-data',
  },
];
