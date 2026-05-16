import { SafetyGateV2Panel } from '../components/SafetyGateV2Panel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE96: PanelRegistryItem[] = [
  {
    id: 'safety-gate-v2',
    label: '安全ゲート',
    group: 'settings',
    phase: 'Phase 96',
    component: <SafetyGateV2Panel />,
    defaultVisible: true,
    priority: 96,
    tags: ['safety', 'gate', 'stop', 'allow', 'darake', 'rules'],
    kind: 'developer',
  },
];
