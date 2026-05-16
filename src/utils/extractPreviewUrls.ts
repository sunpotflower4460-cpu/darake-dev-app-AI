const PREVIEW_URL_PATTERNS = [
  /https?:\/\/[^\s"'<>]+\.workers\.dev[^\s"'<>]*/g,
  /https?:\/\/[^\s"'<>]+\.pages\.dev[^\s"'<>]*/g,
  /https?:\/\/[^\s"'<>]+\.vercel\.app[^\s"'<>]*/g,
  /https?:\/\/[^\s"'<>]+\.netlify\.app[^\s"'<>]*/g,
];

export function extractPreviewUrls(text: string): string[] {
  const found: string[] = [];
  for (const pattern of PREVIEW_URL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches) {
        if (!found.includes(m)) found.push(m);
      }
    }
  }
  return found;
}

export function extractFirstPreviewUrl(text: string): string | null {
  const urls = extractPreviewUrls(text);
  return urls[0] ?? null;
}
