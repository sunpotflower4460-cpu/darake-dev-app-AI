export type AppLifecycleStage =
  | 'idea'
  | 'planning'
  | 'development'
  | 'testing'
  | 'submission-prep'
  | 'in-review'
  | 'released'
  | 'post-release'
  | 'paused'
  | 'archived';

export type RegisteredApp = {
  id: string;
  name: string;
  repoUrl: string;
  platform: Array<'ios' | 'android' | 'web' | 'desktop'>;
  lifecycleStage: AppLifecycleStage;
  priority: 'low' | 'medium' | 'high' | 'dream-core';
  currentPhase: string;
  nextAction: string;
  riskLevel: 'safe' | 'review-needed' | 'manual-gate' | 'blocked';
  lastUpdatedAt: string;
  notes: string;
};

const STORAGE_KEY = 'darake.appRegistry.v1';

export function buildInitialApp(): RegisteredApp {
  return {
    id: `app-${Date.now()}`,
    name: '',
    repoUrl: '',
    platform: ['ios'],
    lifecycleStage: 'idea',
    priority: 'medium',
    currentPhase: '',
    nextAction: '',
    riskLevel: 'safe',
    lastUpdatedAt: new Date().toISOString(),
    notes: '',
  };
}

export function loadAppRegistry(): RegisteredApp[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RegisteredApp[];
  } catch {
    return [];
  }
}

export function saveAppRegistry(apps: RegisteredApp[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

export function addApp(apps: RegisteredApp[], app: RegisteredApp): RegisteredApp[] {
  return [...apps, app];
}

export function updateApp(apps: RegisteredApp[], updated: RegisteredApp): RegisteredApp[] {
  return apps.map((a) => (a.id === updated.id ? updated : a));
}

export function deleteApp(apps: RegisteredApp[], id: string): RegisteredApp[] {
  return apps.filter((a) => a.id !== id);
}

export function filterByStage(apps: RegisteredApp[], stage: AppLifecycleStage): RegisteredApp[] {
  return apps.filter((a) => a.lifecycleStage === stage);
}

export function filterByPriority(apps: RegisteredApp[], priority: RegisteredApp['priority']): RegisteredApp[] {
  return apps.filter((a) => a.priority === priority);
}

export function summarizeAppRegistry(apps: RegisteredApp[]): string {
  const counts: Partial<Record<AppLifecycleStage, number>> = {};
  apps.forEach((a) => {
    counts[a.lifecycleStage] = (counts[a.lifecycleStage] ?? 0) + 1;
  });
  const lines = Object.entries(counts).map(([stage, n]) => `- ${stage}: ${n}件`);
  return [`## アプリ登録一覧 (${apps.length}件)`, ...lines].join('\n');
}
