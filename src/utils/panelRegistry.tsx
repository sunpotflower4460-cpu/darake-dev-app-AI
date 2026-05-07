import React from 'react';
import type { DarakeNavGroupId } from './navigationGroups';
import { PANEL_REGISTRY_PHASE1TO9 } from './panelRegistry.phase1to9';
import { PANEL_REGISTRY_PHASE10 } from './panelRegistry.phase10';
import { PANEL_REGISTRY_PHASE11TO14 } from './panelRegistry.phase11to14';
import { PANEL_REGISTRY_PHASE15TO18 } from './panelRegistry.phase15to18';
import { PANEL_REGISTRY_PHASE19TO23 } from './panelRegistry.phase19to23';
import { PANEL_REGISTRY_PHASE24 } from './panelRegistry.phase24';
import { PANEL_REGISTRY_PHASE25 } from './panelRegistry.phase25';
import { PANEL_REGISTRY_PHASE26 } from './panelRegistry.phase26';
import { PANEL_REGISTRY_PHASE27 } from './panelRegistry.phase27';
import { PANEL_REGISTRY_PHASE28 } from './panelRegistry.phase28';
import { PANEL_REGISTRY_PHASE29 } from './panelRegistry.phase29';
import { PANEL_REGISTRY_PHASE30 } from './panelRegistry.phase30';
import { PANEL_REGISTRY_PHASE31 } from './panelRegistry.phase31';
import { PANEL_REGISTRY_PHASE32 } from './panelRegistry.phase32';
import { PANEL_REGISTRY_PHASE33 } from './panelRegistry.phase33';
import { PANEL_REGISTRY_PHASE34 } from './panelRegistry.phase34';
import { PANEL_REGISTRY_PHASE35 } from './panelRegistry.phase35';
import { PANEL_REGISTRY_PHASE36 } from './panelRegistry.phase36';
import { PANEL_REGISTRY_PHASE37 } from './panelRegistry.phase37';
import { PANEL_REGISTRY_PHASE38 } from './panelRegistry.phase38';
import { PANEL_REGISTRY_PHASE39TO41 } from './panelRegistry.phase39to41';
import { PANEL_REGISTRY_PHASE42TO44 } from './panelRegistry.phase42to44';
import { PANEL_REGISTRY_PHASE45TO47 } from './panelRegistry.phase45to47';
import { PANEL_REGISTRY_PHASE48 } from './panelRegistry.phase48';
import { PANEL_REGISTRY_PHASE49 } from './panelRegistry.phase49';
import { PANEL_REGISTRY_PHASE50 } from './panelRegistry.phase50';
import { PANEL_REGISTRY_PHASE51 } from './panelRegistry.phase51';

export type PanelRegistryItem = {
  id: string;
  label: string;
  group: DarakeNavGroupId;
  phase: string;
  component: React.ReactNode;
  defaultVisible: boolean;
  priority: number;
  tags: string[];
};

export const ALL_PANELS: PanelRegistryItem[] = [
  ...PANEL_REGISTRY_PHASE1TO9,
  ...PANEL_REGISTRY_PHASE10,
  ...PANEL_REGISTRY_PHASE11TO14,
  ...PANEL_REGISTRY_PHASE15TO18,
  ...PANEL_REGISTRY_PHASE19TO23,
  ...PANEL_REGISTRY_PHASE24,
  ...PANEL_REGISTRY_PHASE25,
  ...PANEL_REGISTRY_PHASE26,
  ...PANEL_REGISTRY_PHASE27,
  ...PANEL_REGISTRY_PHASE28,
  ...PANEL_REGISTRY_PHASE29,
  ...PANEL_REGISTRY_PHASE30,
  ...PANEL_REGISTRY_PHASE31,
  ...PANEL_REGISTRY_PHASE32,
  ...PANEL_REGISTRY_PHASE33,
  ...PANEL_REGISTRY_PHASE34,
  ...PANEL_REGISTRY_PHASE35,
  ...PANEL_REGISTRY_PHASE36,
  ...PANEL_REGISTRY_PHASE37,
  ...PANEL_REGISTRY_PHASE38,
  ...PANEL_REGISTRY_PHASE39TO41,
  ...PANEL_REGISTRY_PHASE42TO44,
  ...PANEL_REGISTRY_PHASE45TO47,
  ...PANEL_REGISTRY_PHASE48,
  ...PANEL_REGISTRY_PHASE49,
  ...PANEL_REGISTRY_PHASE50,
  ...PANEL_REGISTRY_PHASE51,
].sort((a, b) => a.priority - b.priority);
