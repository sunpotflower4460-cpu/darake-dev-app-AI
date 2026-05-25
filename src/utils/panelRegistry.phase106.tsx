import { IconGeneratorPanel } from '../components/IconGeneratorPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE106: PanelRegistryItem[] = [
  {
    id: 'icon-generator',
    label: 'アプリアイコン生成',
    group: 'submit',
    phase: 'Phase 106',
    component: <IconGeneratorPanel />,
    defaultVisible: true,
    priority: 106,
    tags: ['icon', 'svg', 'submit', 'ai', 'phase106'],
    kind: 'real-data',
  },
];
