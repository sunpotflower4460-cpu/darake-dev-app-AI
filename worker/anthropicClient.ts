export type AnthropicTextContent = { type: 'text'; text: string };
export type AnthropicImageContent = {
  type: 'image';
  source: { type: 'base64'; media_type: string; data: string };
};
export type AnthropicUserContent = AnthropicTextContent | AnthropicImageContent;

export type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: AnthropicUserContent[] | string;
};

export type AnthropicRequest = {
  model: string;
  max_tokens: number;
  system?: string;
  messages: AnthropicMessage[];
  thinking?: { type: 'adaptive' } | { type: 'disabled' };
};

export type AnthropicCallResult =
  | {
      ok: true;
      text: string;
      usage: {
        input_tokens: number;
        output_tokens: number;
        cache_creation_input_tokens?: number;
        cache_read_input_tokens?: number;
      };
    }
  | { ok: false; status: number; code: string; error: string };

export async function callAnthropic(
  apiKey: string,
  req: AnthropicRequest,
): Promise<AnthropicCallResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  const body = (await res.json().catch(() => null)) as
    | {
        content?: Array<{ type: string; text?: string }>;
        usage?: {
          input_tokens: number;
          output_tokens: number;
          cache_creation_input_tokens?: number;
          cache_read_input_tokens?: number;
        };
        error?: { type?: string; message?: string };
      }
    | null;

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      code: body?.error?.type ?? 'anthropic_error',
      error: body?.error?.message ?? 'Anthropic API呼び出しに失敗しました',
    };
  }

  const text = (body?.content ?? [])
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text as string)
    .join('');

  if (!text) {
    return {
      ok: false,
      status: 502,
      code: 'EMPTY_RESPONSE',
      error: 'Anthropic応答にテキストがありません',
    };
  }

  return {
    ok: true,
    text,
    usage: body?.usage ?? { input_tokens: 0, output_tokens: 0 },
  };
}

export function estimateCostUsd(
  modelId: string,
  usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number },
): number {
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const billableInput = Math.max(0, usage.input_tokens - cacheRead);
  if (modelId.includes('opus')) {
    return (billableInput * 5 + cacheRead * 0.5 + usage.output_tokens * 25) / 1_000_000;
  }
  if (modelId.includes('haiku')) {
    return (billableInput * 1 + cacheRead * 0.1 + usage.output_tokens * 5) / 1_000_000;
  }
  return (billableInput * 3 + cacheRead * 0.3 + usage.output_tokens * 15) / 1_000_000;
}

export function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('JSONオブジェクトを検出できませんでした');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}
