import { GitHubIssueStablePanel } from '../components/GitHubIssueStablePanel';
import type { PanelRegistryItem } from './panelRegistry';

export const PANEL_REGISTRY_PHASE93: PanelRegistryItem[] = [
  {
    id: 'github-issue-stable',
    label: '作業Issueを作る',
    group: 'create',
    phase: 'Phase 93',
    component: <GitHubIssueStablePanel />,
    defaultVisible: true,
    priority: 93,
    tags: ['issue', 'github', 'create', 'stable', 'fallback'],
  },
];
