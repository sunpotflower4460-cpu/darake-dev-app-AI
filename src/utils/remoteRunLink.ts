import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

const STORAGE_KEY = 'darake.remoteRunLink.v1';

export type RemoteRunLink = {
  runId: string;
  appName: string;
  repoUrl: string;
  issueUrl?: string;
  prUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export function loadRemoteRunLink(): RemoteRunLink | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RemoteRunLink;
  } catch {
    return null;
  }
}

export function saveRemoteRunLink(link: RemoteRunLink): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(link));
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function clearRemoteRunLink(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  } catch {
    // ignore
  }
}

export function updateRemoteRunLink(partial: Partial<Omit<RemoteRunLink, 'runId' | 'createdAt'>>): void {
  const existing = loadRemoteRunLink();
  if (!existing) return;
  saveRemoteRunLink({
    ...existing,
    ...partial,
    updatedAt: new Date().toISOString(),
  });
}
