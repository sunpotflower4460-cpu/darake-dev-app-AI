import { SubmissionGatePanel } from '../components/SubmissionGatePanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE104: PanelRegistryItem[] = [
  {
    id: 'submission-gate',
    label: '申請前ゲート (一括承認)',
    group: 'submit',
    phase: 'Phase 104',
    component: <SubmissionGatePanel />,
    defaultVisible: true,
    priority: 104,
    tags: ['submit', 'gate', 'app-store', 'play-store', 'phase104'],
    kind: 'real-data',
  },
];
