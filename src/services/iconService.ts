export type IconGenResponse =
  | { ok: true; svg: string; model: string }
  | { ok: false; code: string; error: string };

export async function generateIcon(body: {
  appName: string;
  vibe?: string;
  palette?: string[];
}): Promise<IconGenResponse> {
  try {
    const res = await fetch('/api/darake/icons/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as IconGenResponse | null;
    if (!json) return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}

/** Rasterize an SVG string to a PNG data URL at the given square size. */
export async function svgToPngDataUrl(svg: string, size = 1024): Promise<string> {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.width = size;
    img.height = size;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('SVGの読み込みに失敗しました'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvasコンテキストを取得できません');
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}
