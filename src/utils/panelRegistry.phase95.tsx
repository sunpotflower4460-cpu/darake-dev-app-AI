import { PrCiHumanSummaryPanel } from '../components/PrCiHumanSummaryPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE95: PanelRegistryItem[] = [
  {
    id: 'pr-ci-human-summary',
    label: 'PR/CI状態（デモ）',
    group: 'watch',
    phase: 'Phase 95',
    component: <PrCiHumanSummaryPanel />,
    defaultVisible: false,
    priority: 95,
    tags: ['pr', 'ci', 'summary', 'human', 'translate', 'watch'],
  },
];
