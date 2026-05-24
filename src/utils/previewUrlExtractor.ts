const PREVIEW_HOST_SUFFIXES = ['workers.dev', 'pages.dev', 'vercel.app', 'netlify.app'] as const;
const URL_CANDIDATE_PATTERN = /https?:\/\/[^\s"'<>]+/gi;

function stripTrailingPunctuation(value: string): string {
  return value.replace(/[)\],.;!?]+$/g, '');
}

function isAllowedPreviewHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return PREVIEW_HOST_SUFFIXES.some((suffix) => lower === suffix || lower.endsWith(`.${suffix}`));
}

function normalizePreviewUrl(candidate: string): string | null {
  const trimmed = stripTrailingPunctuation(candidate.trim());
  if (!trimmed || /^javascript:/i.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!isAllowedPreviewHost(parsed.hostname)) {
      return null;
    }
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

function canonicalKey(url: URL): string {
  return `${url.hostname.toLowerCase()}${url.pathname}${url.search}`;
}

export function extractPreviewUrls(text: string): string[] {
  const matches = text.match(URL_CANDIDATE_PATTERN) ?? [];
  const deduped = new Map<string, string>();

  for (const match of matches) {
    const normalized = normalizePreviewUrl(match);
    if (!normalized) continue;

    const parsed = new URL(normalized);
    const key = canonicalKey(parsed);
    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, normalized);
      continue;
    }

    if (existing.startsWith('http://') && normalized.startsWith('https://')) {
      deduped.set(key, normalized);
    }
  }

  return [...deduped.values()];
}

export function extractFirstPreviewUrl(text: string): string | null {
  return extractPreviewUrls(text)[0] ?? null;
}
