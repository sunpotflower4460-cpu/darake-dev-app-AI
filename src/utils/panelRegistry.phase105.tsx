import { CompletionConfirmPanel } from '../components/CompletionConfirmPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE105: PanelRegistryItem[] = [
  {
    id: 'completion-confirm',
    label: '完成判定 (本当にそうか?)',
    group: 'reports',
    phase: 'Phase 105',
    component: <CompletionConfirmPanel />,
    defaultVisible: true,
    priority: 105,
    tags: ['completion', 'final-check', 'verify', 'phase105'],
    kind: 'real-data',
  },
];
