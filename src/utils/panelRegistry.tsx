import React from 'react';
import type { DarakeNavGroupId } from './navigationGroups';

export type PanelRegistryItem = {
  id: string;
  label: string;
  group: DarakeNavGroupId;
  phase: string;
  component: React.ReactNode;
  defaultVisible: boolean;
};

// Registry is populated in main.tsx to avoid circular dependencies
