import { AgentInstructionFormatPanel } from '../components/AgentInstructionFormatPanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE94: PanelRegistryItem[] = [
  {
    id: 'agent-instruction-format',
    label: 'AI作業指示フォーマット',
    group: 'create',
    phase: 'Phase 94',
    component: <AgentInstructionFormatPanel />,
    defaultVisible: true,
    priority: 94,
    tags: ['agent', 'instruction', 'format', 'cloud-agent', 'codex', 'copilot'],
  },
];
