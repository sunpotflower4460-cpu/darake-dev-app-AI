import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.wakeQueue.v1';

export type DarakeWakeReason =
  | 'issue-create-failed'
  | 'agent-assign-failed'
  | 'pr-candidates-multiple'
  | 'ci-failed-max-retry'
  | 'dangerous-change'
  | 'merge-candidate'
  | 'secret-needed'
  | 'billing-needed'
  | 'app-store-needed'
  | 'unknown';

export type DarakeWakeItem = {
  id: string;
  reason: DarakeWakeReason;
  title: string;
  message: string;
  nextActionLabel: string;
  actionUrl?: string;
  createdAt: string;
  resolvedAt?: string;
};

export function loadWakeQueue(): DarakeWakeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DarakeWakeItem[];
  } catch {
    return [];
  }
}

export function saveWakeQueue(items: DarakeWakeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function addToWakeQueue(
  item: Omit<DarakeWakeItem, 'id' | 'createdAt'>,
): DarakeWakeItem {
  const newItem: DarakeWakeItem = {
    ...item,
    id: `wake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const current = loadWakeQueue();
  saveWakeQueue([...current, newItem]);
  return newItem;
}

export function resolveWakeItem(id: string): void {
  const current = loadWakeQueue();
  const updated = current.map((item) =>
    item.id === id ? { ...item, resolvedAt: new Date().toISOString() } : item,
  );
  saveWakeQueue(updated);
}

export function getUnresolvedWakeItems(): DarakeWakeItem[] {
  return loadWakeQueue().filter((item) => !item.resolvedAt);
}

export function getLatestUnresolvedWakeItem(): DarakeWakeItem | null {
  const unresolved = getUnresolvedWakeItems();
  if (unresolved.length === 0) return null;
  return unresolved[unresolved.length - 1];
}

export function clearResolvedWakeItems(): void {
  const current = loadWakeQueue();
  saveWakeQueue(current.filter((item) => !item.resolvedAt));
}
