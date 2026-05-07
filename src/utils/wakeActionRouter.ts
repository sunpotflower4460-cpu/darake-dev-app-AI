const WAKE_ACTION_PARAM = 'wakeAction';

/**
 * Read the wakeAction token ID from the current URL query string.
 * Returns null if not present.
 */
export function getWakeActionTokenIdFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const tokenId = params.get(WAKE_ACTION_PARAM);
    return tokenId && tokenId.trim() ? tokenId.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Remove the wakeAction param from the URL without a page reload.
 */
export function clearWakeActionFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(WAKE_ACTION_PARAM);
    window.history.replaceState(null, '', url.toString());
  } catch {
    // ignore
  }
}
