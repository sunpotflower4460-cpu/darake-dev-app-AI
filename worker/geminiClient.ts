export type GeminiImage = { mediaType: string; base64: string };

export type GeminiResult =
  | { ok: true; text: string }
  | { ok: false; status: number; code: string; error: string };

/**
 * Minimal Gemini generateContent call (text + optional images) via REST.
 * Used as a cross-model second opinion in the final completion check.
 */
export async function callGeminiVision(
  apiKey: string,
  model: string,
  systemText: string,
  userText: string,
  images: GeminiImage[],
): Promise<GeminiResult> {
  const parts: Array<Record<string, unknown>> = [{ text: userText }];
  for (const img of images) {
    parts.push({ inline_data: { mime_type: img.mediaType, data: img.base64 } });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemText }] },
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    },
  );

  const body = (await res.json().catch(() => null)) as
    | {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string; status?: string };
      }
    | null;

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      code: body?.error?.status ?? 'gemini_error',
      error: body?.error?.message ?? 'Gemini API呼び出しに失敗しました',
    };
  }

  const text = (body?.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .trim();

  if (!text) {
    return { ok: false, status: 502, code: 'EMPTY_RESPONSE', error: 'Gemini応答が空です' };
  }
  return { ok: true, text };
}
