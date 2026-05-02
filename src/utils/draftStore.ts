import { issueDraft } from '../data/issueDraft';
import type { IssueDraft } from '../data/issueDraft';

const KEY = 'darake.issueDraft.v1';

export function loadDraft(): IssueDraft {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...issueDraft, ...JSON.parse(raw) } : issueDraft;
  } catch {
    return issueDraft;
  }
}

export function saveDraft(draft: IssueDraft): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    return;
  }
}

export function clearDraft(): IssueDraft {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return issueDraft;
  }

  return issueDraft;
}
