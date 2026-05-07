/**
 * Parse ?wakeAction=TOKEN_ID from the current page URL.
 * Returns the token ID string, or null if not present.
 */
export function getWakeActionTokenId(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('wakeAction');
    return id && id.trim().length > 0 ? id.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Remove ?wakeAction from the browser URL without reloading the page.
 * Call this after the panel has loaded / been dismissed.
 */
export function clearWakeActionFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('wakeAction')) {
      url.searchParams.delete('wakeAction');
      window.history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
    }
  } catch {
    // ignore — URL manipulation is best-effort
  }
}
