const PREVIEW_PATTERNS = [
  /https?:\/\/[^\s"'<>()[\]{}]+\.workers\.dev(?:\/[^\s"'<>()[\]{}]*)?/g,
  /https?:\/\/[^\s"'<>()[\]{}]+\.pages\.dev(?:\/[^\s"'<>()[\]{}]*)?/g,
  /https?:\/\/[^\s"'<>()[\]{}]+\.vercel\.app(?:\/[^\s"'<>()[\]{}]*)?/g,
  /https?:\/\/[^\s"'<>()[\]{}]+\.netlify\.app(?:\/[^\s"'<>()[\]{}]*)?/g,
];

function isValidPreviewUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (!parsed.hostname) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract preview deployment URLs from arbitrary text.
 * Recognises workers.dev, pages.dev, vercel.app, netlify.app.
 * - https:// is preferred over http:// (http is upgraded when https equivalent exists)
 * - Duplicates are removed
 * - javascript: and other non-http(s) schemes are blocked
 * - Malformed URLs are excluded
 */
export function extractPreviewUrls(text: string): string[] {
  const httpsUrls = new Set<string>();
  const httpUrls = new Set<string>();

  for (const pattern of PREVIEW_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (!matches) continue;
    for (const raw of matches) {
      if (!isValidPreviewUrl(raw)) continue;
      if (raw.startsWith('https://')) {
        httpsUrls.add(raw);
      } else if (raw.startsWith('http://')) {
        httpUrls.add(raw);
      }
    }
  }

  // Prefer https; only keep http URL when no https equivalent is found
  const result = new Set<string>(httpsUrls);
  for (const url of httpUrls) {
    const httpsVersion = 'https://' + url.slice('http://'.length);
    if (!httpsUrls.has(httpsVersion)) {
      result.add(url);
    }
  }

  return Array.from(result);
}

export function extractFirstPreviewUrl(text: string): string | null {
  const urls = extractPreviewUrls(text);
  return urls[0] ?? null;
}
