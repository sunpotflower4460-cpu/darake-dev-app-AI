import { issueDraft } from '../data/issueDraft';
import type { IssueDraft } from '../data/issueDraft';

const KEY = 'darake.issueDraft.v1';
const EVENT_NAME = 'darake-issue-draft-updated';

export function loadDraft(): IssueDraft {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...issueDraft, ...JSON.parse(raw) } : issueDraft;
  } catch {
    return issueDraft;
  }
}

function notifyDraftChanged(): void {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function saveDraft(draft: IssueDraft): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
    notifyDraftChanged();
  } catch {
    return;
  }
}

export function clearDraft(): IssueDraft {
  try {
    localStorage.removeItem(KEY);
    notifyDraftChanged();
  } catch {
    return issueDraft;
  }

  return issueDraft;
}

export function subscribeDraftChanges(listener: () => void): () => void {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
