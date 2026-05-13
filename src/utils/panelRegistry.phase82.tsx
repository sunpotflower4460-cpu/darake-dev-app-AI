import { CloudflareAutomationGuidePanel } from '../components/CloudflareAutomationGuidePanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE82: PanelRegistryItem[] = [
  {
    id: 'cloudflare-automation-guide',
    label: 'Cloudflare自動化ガイド',
    group: 'settings',
    phase: 'Phase 82',
    component: <CloudflareAutomationGuidePanel />,
    defaultVisible: true,
    priority: 820,
    tags: ['cloudflare', 'automation', 'setup', 'beginner'],
  },
];
