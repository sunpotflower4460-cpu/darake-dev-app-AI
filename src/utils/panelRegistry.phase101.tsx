import { AppDesignInputPanel } from '../components/AppDesignInputPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE101: PanelRegistryItem[] = [
  {
    id: 'app-design-input',
    label: '設計図を投げる (画像・テキスト)',
    group: 'create',
    phase: 'Phase 101',
    component: <AppDesignInputPanel />,
    defaultVisible: true,
    priority: 101,
    tags: ['design-input', 'ai', 'blueprint', 'create', 'phase101'],
    kind: 'real-data',
  },
];
