import { PreviewDeployStatusPanel } from '../components/PreviewDeployStatusPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE97: PanelRegistryItem[] = [
  {
    id: 'preview-deploy-status',
    label: 'Preview / Deploy確認',
    group: 'watch',
    phase: 'Phase 97',
    component: <PreviewDeployStatusPanel />,
    defaultVisible: true,
    priority: 97,
    tags: ['preview', 'deploy', 'status', 'version', 'watch'],
  },
];
