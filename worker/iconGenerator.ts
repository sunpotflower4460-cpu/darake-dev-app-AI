import { callAnthropic, estimateCostUsd } from './anthropicClient';
import { checkBudget, parseBudgetUsd, recordSpend, type BudgetEnv } from './budgetGuard';
import { appendAudit } from './auditLog';

type IconGenEnv = BudgetEnv & {
  ANTHROPIC_API_KEY?: string;
  DARAKE_ICON_GEN_ENABLED?: string;
  BLUEPRINT_AI_DAILY_BUDGET_USD?: string;
  ICON_GEN_MODEL?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `あなたは熟練したアプリアイコンデザイナーです。指定されたアプリの雰囲気に合う、単体で完結したSVGアプリアイコンを1つ作成してください。

厳守事項:
- viewBox は "0 0 1024 1024"
- 外部参照(画像URL/フォント読み込み)は禁止。すべてSVG要素・グラデーション・パスで表現
- テキストを使う場合は system-ui 等の汎用フォントのみ
- 角丸の背景ベースを置き、中央にシンボルを配置するモダンなアプリアイコン
- 応答は <svg> ... </svg> のマークアップ"のみ"。前置き・説明・コードフェンス禁止`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function extractSvg(text: string): string | null {
  const m = text.match(/<svg[\s\S]*<\/svg>/i);
  if (!m) return null;
  const svg = m[0];
  // Reject external references / scripts for safety.
  if (/<script|xlink:href\s*=\s*["']https?:|href\s*=\s*["']https?:|<image[^>]+https?:/i.test(svg)) {
    return null;
  }
  return svg;
}

export async function handleGenerateIcon(request: Request, env: IconGenEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (env.DARAKE_ICON_GEN_ENABLED !== 'true') {
    return json({ ok: false, code: 'DISABLED', error: 'アイコン生成はまだ有効化されていません' }, 403);
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json({ ok: false, code: 'MISSING_SECRET', error: 'ANTHROPIC_API_KEYが未設定です' }, 500);
  }

  let body: { appName?: unknown; vibe?: unknown; palette?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }

  const appName = String(body.appName ?? '').trim();
  if (!appName || appName.length > 80) {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'アプリ名を1〜80文字で入力してください' }, 400);
  }
  const vibe = body.vibe ? String(body.vibe).slice(0, 300) : '';
  const palette = Array.isArray(body.palette)
    ? (body.palette as unknown[]).filter((c) => typeof c === 'string').slice(0, 8).map((c) => String(c))
    : [];

  const cap = parseBudgetUsd(env.BLUEPRINT_AI_DAILY_BUDGET_USD, 5);
  const budget = await checkBudget(env, 'blueprint', cap);
  if (!budget.allowed) {
    return json(
      {
        ok: false,
        code: 'BUDGET_EXCEEDED',
        error: `本日のAI予算 $${cap.toFixed(2)} を超えました（現在 $${budget.spentUsd.toFixed(2)}）`,
      },
      429,
    );
  }

  const model = env.ICON_GEN_MODEL?.trim() || DEFAULT_MODEL;
  const userText = [
    `アプリ名: ${appName}`,
    vibe ? `雰囲気: ${vibe}` : '',
    palette.length > 0 ? `推奨カラー: ${palette.join(', ')}` : '',
    '',
    'このアプリのアイコンSVGを作成してください。',
  ]
    .filter(Boolean)
    .join('\n');

  const ai = await callAnthropic(env.ANTHROPIC_API_KEY, {
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userText }],
  });
  if (!ai.ok) {
    return json({ ok: false, code: ai.code, error: ai.error }, ai.status >= 400 && ai.status < 600 ? ai.status : 502);
  }
  await recordSpend(env, 'blueprint', estimateCostUsd(model, ai.usage)).catch(() => null);

  const svg = extractSvg(ai.text);
  if (!svg) {
    return json({ ok: false, code: 'PARSE_ERROR', error: '安全なSVGを生成できませんでした' }, 502);
  }

  await appendAudit(env, { scope: appName, kind: 'icon-generated', message: `model=${model}` });
  return json({ ok: true, svg, model });
}
