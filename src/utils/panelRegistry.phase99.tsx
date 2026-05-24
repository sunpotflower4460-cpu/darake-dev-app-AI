import { AppStorePrepModePanel } from '../components/AppStorePrepModePanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE99: PanelRegistryItem[] = [
  {
    id: 'app-store-prep-mode',
    label: 'App Store提出準備',
    group: 'submit',
    phase: 'Phase 99',
    component: <AppStorePrepModePanel />,
    defaultVisible: false,
    priority: 99,
    tags: ['appstore', 'submit', 'prep', 'checklist', 'review'],
  },
];
