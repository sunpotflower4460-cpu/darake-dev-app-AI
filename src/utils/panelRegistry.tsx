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
import { PANEL_REGISTRY_PHASE52 } from './panelRegistry.phase52';
import { PANEL_REGISTRY_PHASE54 } from './panelRegistry.phase54';
import { PANEL_REGISTRY_PHASE55 } from './panelRegistry.phase55';
import { PANEL_REGISTRY_PHASE56 } from './panelRegistry.phase56';
import { PANEL_REGISTRY_PHASE57 } from './panelRegistry.phase57';
import { PANEL_REGISTRY_PHASE59TO63 } from './panelRegistry.phase59to63';
import { PANEL_REGISTRY_PHASE65 } from './panelRegistry.phase65';
import { PANEL_REGISTRY_PHASE82 } from './panelRegistry.phase82';
import { PANEL_REGISTRY_PHASE83 } from './panelRegistry.phase83';
import { PANEL_REGISTRY_PHASE88 } from './panelRegistry.phase88';
import { PANEL_REGISTRY_PHASE91 } from './panelRegistry.phase91';
import { PANEL_REGISTRY_PHASE92 } from './panelRegistry.phase92';
import { PANEL_REGISTRY_PHASE93 } from './panelRegistry.phase93';
import { PANEL_REGISTRY_PHASE94 } from './panelRegistry.phase94';
import { PANEL_REGISTRY_PHASE95 } from './panelRegistry.phase95';
import { PANEL_REGISTRY_PHASE96 } from './panelRegistry.phase96';
import { PANEL_REGISTRY_PHASE97 } from './panelRegistry.phase97';
import { PANEL_REGISTRY_PHASE98 } from './panelRegistry.phase98';
import { PANEL_REGISTRY_PHASE99 } from './panelRegistry.phase99';
import { PANEL_REGISTRY_PHASE100 } from './panelRegistry.phase100';
import { PANEL_REGISTRY_PHASE101 } from './panelRegistry.phase101';
import { PANEL_REGISTRY_PHASE102 } from './panelRegistry.phase102';
import { PANEL_REGISTRY_PHASE103 } from './panelRegistry.phase103';

export type PanelRegistryItem = {
  id: string;
  label: string;
  group: DarakeNavGroupId;
  phase: string;
  component: React.ReactNode;
  defaultVisible: boolean;
  priority: number;
  tags: string[];
  kind?: 'real-data' | 'demo' | 'manual-note' | 'developer';
};

export const ALL_PANELS: PanelRegistryItem[] = [
  ...PANEL_REGISTRY_PHASE88,
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
  ...PANEL_REGISTRY_PHASE52,
  ...PANEL_REGISTRY_PHASE54,
  ...PANEL_REGISTRY_PHASE55,
  ...PANEL_REGISTRY_PHASE56,
  ...PANEL_REGISTRY_PHASE57,
  ...PANEL_REGISTRY_PHASE59TO63,
  ...PANEL_REGISTRY_PHASE65,
  ...PANEL_REGISTRY_PHASE82,
  ...PANEL_REGISTRY_PHASE83,
  ...PANEL_REGISTRY_PHASE91,
  ...PANEL_REGISTRY_PHASE92,
  ...PANEL_REGISTRY_PHASE93,
  ...PANEL_REGISTRY_PHASE94,
  ...PANEL_REGISTRY_PHASE95,
  ...PANEL_REGISTRY_PHASE96,
  ...PANEL_REGISTRY_PHASE97,
  ...PANEL_REGISTRY_PHASE98,
  ...PANEL_REGISTRY_PHASE99,
  ...PANEL_REGISTRY_PHASE100,
  ...PANEL_REGISTRY_PHASE101,
  ...PANEL_REGISTRY_PHASE102,
  ...PANEL_REGISTRY_PHASE103,
].sort((a, b) => a.priority - b.priority);
