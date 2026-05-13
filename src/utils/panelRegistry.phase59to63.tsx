import React from 'react';
import type { PanelRegistryItem } from './panelRegistry';
import { DarakeTaskQueuePanel } from '../components/DarakeTaskQueuePanel';
import { DarakeNextTaskCard } from '../components/DarakeNextTaskCard';
import { BlueprintStockPanel } from '../components/BlueprintStockPanel';
import { SleepSessionPanel } from '../components/SleepSessionPanel';
import { DarakeCockpitMorningReportPanel } from '../components/DarakeCockpitMorningReportPanel';
import { DarakeRehearsalPanel } from '../components/DarakeRehearsalPanel';

export const PANEL_REGISTRY_PHASE59TO63: PanelRegistryItem[] = [
  {
    id: 'darake-task-queue',
    label: 'タスクキュー',
    group: 'run',
    phase: '59.1',
    component: React.createElement(DarakeTaskQueuePanel),
    defaultVisible: true,
    priority: 340,
    tags: ['darake', 'task', 'queue', 'run'],
  },
  {
    id: 'darake-next-task',
    label: '次のタスク',
    group: 'home',
    phase: '59.2',
    component: React.createElement(DarakeNextTaskCard),
    defaultVisible: true,
    priority: 341,
    tags: ['darake', 'task', 'next', 'home'],
  },
  {
    id: 'blueprint-stock',
    label: '設計図ストック',
    group: 'templates',
    phase: '60.1',
    component: React.createElement(BlueprintStockPanel),
    defaultVisible: true,
    priority: 342,
    tags: ['darake', 'blueprint', 'stock', 'templates'],
  },
  {
    id: 'sleep-session',
    label: '今夜進めるもの',
    group: 'run',
    phase: '61.1',
    component: React.createElement(SleepSessionPanel),
    defaultVisible: true,
    priority: 343,
    tags: ['darake', 'sleep', 'session', 'run'],
  },
  {
    id: 'morning-report',
    label: '朝レポート',
    group: 'reports',
    phase: '63.1',
    component: React.createElement(DarakeCockpitMorningReportPanel),
    defaultVisible: true,
    priority: 344,
    tags: ['darake', 'morning', 'report', 'reports'],
  },
  {
    id: 'darake-rehearsal',
    label: '実地リハーサル',
    group: 'home',
    phase: '63.2',
    component: React.createElement(DarakeRehearsalPanel),
    defaultVisible: true,
    priority: 345,
    tags: ['darake', 'rehearsal', 'home'],
  },
];
