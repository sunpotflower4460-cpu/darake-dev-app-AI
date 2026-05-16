import { SettingsDiagnosticPanel } from '../components/SettingsDiagnosticPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE91: PanelRegistryItem[] = [
  {
    id: 'settings-diagnostic',
    label: '設定状態を確認する',
    group: 'settings',
    phase: 'Phase 91',
    component: <SettingsDiagnosticPanel />,
    defaultVisible: true,
    priority: 91,
    tags: ['settings', 'diagnostic', 'health', 'check', 'setup'],
    kind: 'real-data',
  },
];
