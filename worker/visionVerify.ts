import {
  callAnthropic,
  estimateCostUsd,
  extractJsonObject,
  type AnthropicUserContent,
} from './anthropicClient';
import { appendAudit } from './auditLog';
import { checkBudget, parseBudgetUsd, recordSpend, type BudgetEnv } from './budgetGuard';

type VisionVerifyEnv = BudgetEnv & {
  ANTHROPIC_API_KEY?: string;
  DARAKE_VISION_VERIFY_ENABLED?: string;
  VISION_VERIFY_DAILY_BUDGET_USD?: string;
  VISION_VERIFY_MODEL?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_BUDGET_USD = 10;
const MAX_IMAGES_PER_SIDE = 6;
const MAX_BASE64_LEN = 6_500_000;
const RESULT_TTL_SECONDS = 60 * 60 * 24 * 14;

const SYSTEM_PROMPT = `あなたは厳格なUIレビュアーです。次の2セットの画像を比較してください:

1. 参照設計図 (このように見えるべき)
2. 実装スクリーンショット (現状)

実装が参照設計図にどれくらい忠実か評価し、差分があればどう直すかを指示してください。

必ず次のスキーマの純粋なJSONオブジェクト1つだけで応答してください。前置き・コードフェンス禁止。

{
  "score": number (0-100、参照との一致度。100が完全一致),
  "divergences": Array<{
    "area": string (差分箇所、例: "ヘッダー背景色"),
    "severity": "high" | "medium" | "low",
    "fixHint": string (具体的な修正方法、CSS変数名やコンポーネント名を含めて1-2文)
  }> (最大10件、severityが高い順),
  "fixInstructions": string (修正の全体方針を日本語で3-6文)
}

評価方針:
- 配置 (レイアウト構造)・色・タイポグラフィ・余白・主要コンポーネントの存在を重視
- ダミーテキスト・実データの違いは無視
- 微小な差は low、明らかな配色違いや欠けは high
- 完全に一致なら divergences は空配列、score は 95-100`;

export async function handleCompareScreenshots(
  request: Request,
  env: VisionVerifyEnv,
): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (env.DARAKE_VISION_VERIFY_ENABLED !== 'true') {
    return jsonResponse(
      {
        ok: false,
        code: 'DISABLED',
        error: 'スクショ vs 設計図 のAI比較はまだ有効化されていません',
      },
      403,
    );
  }
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse(
      {
        ok: false,
        code: 'MISSING_SECRET',
        error: 'ANTHROPIC_API_KEYがWorker Secretに設定されていません',
      },
      500,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }

  const projectId = String(body.projectId ?? '').trim() || 'manual';
  const phaseId = body.phaseId ? String(body.phaseId).slice(0, 80) : undefined;
  const attempt = Number(body.attempt ?? 1);
  const runId = body.runId ? String(body.runId).slice(0, 120) : undefined;
  const focusHint = body.focusHint ? String(body.focusHint).slice(0, 600) : '';
  const passThreshold = clampNumber(body.passThreshold, 80, 0, 100);

  const designAssets = parseImageArray(body.designAssets);
  const capturedScreenshots = parseImageArray(body.capturedScreenshots);

  if (designAssets.invalid) {
    return jsonResponse(
      { ok: false, code: 'INVALID_INPUT', error: `参照設計図画像: ${designAssets.invalid}` },
      400,
    );
  }
  if (capturedScreenshots.invalid) {
    return jsonResponse(
      { ok: false, code: 'INVALID_INPUT', error: `スクリーンショット: ${capturedScreenshots.invalid}` },
      400,
    );
  }
  if (designAssets.items.length === 0) {
    return jsonResponse(
      { ok: false, code: 'INVALID_INPUT', error: '参照設計図を少なくとも1枚渡してください' },
      400,
    );
  }
  if (capturedScreenshots.items.length === 0) {
    return jsonResponse(
      { ok: false, code: 'INVALID_INPUT', error: 'スクリーンショットを少なくとも1枚渡してください' },
      400,
    );
  }

  const visualSpec = parseVisualSpec(body.visualSpec);
  const prContext = parsePrContext(body.prContext);

  const cap = parseBudgetUsd(env.VISION_VERIFY_DAILY_BUDGET_USD, DEFAULT_BUDGET_USD);
  const budget = await checkBudget(env, 'vision', cap);
  if (!budget.allowed) {
    await appendAudit(env, {
      scope: projectId,
      kind: 'verify-budget-exceeded',
      message: `本日の予算 $${cap.toFixed(2)} を超過 (現在 $${budget.spentUsd.toFixed(2)})`,
    });
    return jsonResponse(
      {
        ok: false,
        code: 'BUDGET_EXCEEDED',
        error: `本日のVision比較予算 $${cap.toFixed(2)} を超えました（現在 $${budget.spentUsd.toFixed(2)}）`,
      },
      429,
    );
  }

  const model = env.VISION_VERIFY_MODEL?.trim() || DEFAULT_MODEL;

  const userContent: AnthropicUserContent[] = [];
  const introLines: string[] = [
    `# 比較ターゲット`,
    `- projectId: ${projectId}`,
    phaseId ? `- phaseId: ${phaseId}` : '',
    `- attempt: ${attempt}`,
    `- pass判定の閾値: score >= ${passThreshold}`,
    '',
    `# 参照設計図 (${designAssets.items.length}枚)`,
    ...designAssets.items.map((img, i) => `- 設計${i + 1}: ${img.label ?? '(name不明)'}`),
    '',
    `# 現在のスクリーンショット (${capturedScreenshots.items.length}枚)`,
    ...capturedScreenshots.items.map(
      (img, i) => `- スクショ${i + 1}: ${img.label ?? '(name不明)'}`,
    ),
  ];

  if (visualSpec) {
    introLines.push('', `# 期待されるvisualSpec`, JSON.stringify(visualSpec));
  }
  if (focusHint) {
    introLines.push('', `# 特に重点的に見てほしいポイント`, focusHint);
  }

  userContent.push({ type: 'text', text: introLines.filter(Boolean).join('\n') });

  userContent.push({ type: 'text', text: '## 参照設計図' });
  for (const img of designAssets.items) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
    });
  }
  userContent.push({ type: 'text', text: '## 実装スクリーンショット' });
  for (const img of capturedScreenshots.items) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
    });
  }

  const aiResult = await callAnthropic(env.ANTHROPIC_API_KEY, {
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  if (!aiResult.ok) {
    await appendAudit(env, {
      scope: projectId,
      kind: 'verify-api-error',
      message: `[${aiResult.code}] ${aiResult.error}`,
      meta: { attempt, status: aiResult.status },
    });
    return jsonResponse(
      { ok: false, code: aiResult.code, error: aiResult.error },
      aiResult.status >= 400 && aiResult.status < 600 ? aiResult.status : 502,
    );
  }

  const spend = estimateCostUsd(model, aiResult.usage);
  await recordSpend(env, 'vision', spend).catch(() => null);

  let parsed: unknown;
  try {
    parsed = extractJsonObject(aiResult.text);
  } catch (e) {
    await appendAudit(env, {
      scope: projectId,
      kind: 'verify-parse-error',
      message: (e as Error).message,
      meta: { attempt },
    });
    return jsonResponse(
      {
        ok: false,
        code: 'PARSE_ERROR',
        error: `AI応答をJSONとして解釈できませんでした: ${(e as Error).message}`,
      },
      502,
    );
  }

  const obj = (parsed ?? {}) as Record<string, unknown>;
  const score = clampNumber(obj.score, 0, 0, 100);
  const divergences = parseDivergences(obj.divergences);
  const fixInstructions = String(obj.fixInstructions ?? '').slice(0, 4000);
  const pass = score >= passThreshold && !divergences.some((d) => d.severity === 'high');

  const resultId = `vr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const fixRequestComment = buildFixRequestComment({
    attempt,
    maxAttempts: 3,
    score,
    divergences,
    fixInstructions,
    prContext,
    visualSpec,
  });

  const result = {
    resultId,
    projectId,
    phaseId,
    attempt,
    pass,
    score,
    divergences,
    fixInstructions,
    fixRequestComment,
    model,
    spendUsd: spend,
    createdAt,
  };

  if (env.RUN_REGISTRY_KV) {
    const key = `vision-result:${safeKvScope(projectId)}:${createdAt}-${resultId}`;
    await env.RUN_REGISTRY_KV.put(key, JSON.stringify(result), {
      expirationTtl: RESULT_TTL_SECONDS,
    }).catch(() => null);
  }

  await appendAudit(env, {
    scope: projectId,
    kind: pass ? 'verify-pass' : 'verify-fail',
    message: `score=${score} divergences=${divergences.length}`,
    meta: { attempt, runId: runId ?? '', spendUsd: spend },
  });

  return jsonResponse({ ok: true, result });
}

export async function handleListVisionResults(
  request: Request,
  env: VisionVerifyEnv,
): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (!env.RUN_REGISTRY_KV) {
    return jsonResponse(
      { ok: false, code: 'MISSING_STORAGE', error: 'RUN_REGISTRY_KVが設定されていません' },
      503,
    );
  }

  let body: { projectId?: unknown; limit?: unknown };
  try {
    body = (await request.json()) as { projectId?: unknown; limit?: unknown };
  } catch {
    return jsonResponse({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }
  const projectId = String(body.projectId ?? 'manual').trim() || 'manual';
  const limit = clampNumber(body.limit, 20, 1, 100);

  const list = await env.RUN_REGISTRY_KV.list({
    prefix: `vision-result:${safeKvScope(projectId)}:`,
    limit,
  });
  const results: unknown[] = [];
  for (const k of list.keys) {
    const raw = await env.RUN_REGISTRY_KV.get(k.name);
    if (!raw) continue;
    try {
      results.push(JSON.parse(raw));
    } catch {
      // skip malformed
    }
  }
  results.sort((a, b) => {
    const ta = (a as { createdAt?: string }).createdAt ?? '';
    const tb = (b as { createdAt?: string }).createdAt ?? '';
    return ta < tb ? 1 : -1;
  });

  return jsonResponse({ ok: true, results });
}

function safeKvScope(s: string): string {
  return s.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64) || 'default';
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

type ParsedImages =
  | { items: Array<{ mediaType: string; base64: string; label?: string }>; invalid?: never }
  | { items: []; invalid: string };

function parseImageArray(raw: unknown): ParsedImages {
  if (!Array.isArray(raw)) return { items: [] };
  if (raw.length > MAX_IMAGES_PER_SIDE) {
    return { items: [], invalid: `画像は最大${MAX_IMAGES_PER_SIDE}枚までです` };
  }
  const items: Array<{ mediaType: string; base64: string; label?: string }> = [];
  for (let i = 0; i < raw.length; i += 1) {
    const item = raw[i] as { mediaType?: unknown; base64?: unknown; label?: unknown };
    const mediaType = String(item?.mediaType ?? '');
    const base64 = String(item?.base64 ?? '');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(mediaType)) {
      return { items: [], invalid: `画像${i + 1}: 対応形式はPNG/JPEG/WebPです` };
    }
    if (!base64 || base64.length > MAX_BASE64_LEN) {
      return { items: [], invalid: `画像${i + 1}: サイズが大きすぎます` };
    }
    items.push({
      mediaType,
      base64,
      label: item?.label ? String(item.label).slice(0, 120) : undefined,
    });
  }
  return { items };
}

function parseVisualSpec(raw: unknown):
  | { palette: string[]; typography: string[]; layoutNotes: string[]; vibe: string }
  | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  return {
    palette: toStringArray(r.palette).slice(0, 12),
    typography: toStringArray(r.typography).slice(0, 6),
    layoutNotes: toStringArray(r.layoutNotes).slice(0, 12),
    vibe: String(r.vibe ?? '').slice(0, 200),
  };
}

function parsePrContext(
  raw: unknown,
): { repoUrl?: string; prNumber?: number; previewUrl?: string } | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  return {
    repoUrl: r.repoUrl ? String(r.repoUrl).slice(0, 300) : undefined,
    prNumber: r.prNumber ? Number(r.prNumber) : undefined,
    previewUrl: r.previewUrl ? String(r.previewUrl).slice(0, 600) : undefined,
  };
}

function parseDivergences(
  raw: unknown,
): Array<{ area: string; severity: 'high' | 'medium' | 'low'; fixHint: string }> {
  if (!Array.isArray(raw)) return [];
  const out: Array<{ area: string; severity: 'high' | 'medium' | 'low'; fixHint: string }> = [];
  for (const item of raw.slice(0, 10)) {
    const i = (item ?? {}) as Record<string, unknown>;
    const severityRaw = String(i.severity ?? 'medium').toLowerCase();
    const severity: 'high' | 'medium' | 'low' =
      severityRaw === 'high' ? 'high' : severityRaw === 'low' ? 'low' : 'medium';
    const area = String(i.area ?? '').slice(0, 200);
    const fixHint = String(i.fixHint ?? '').slice(0, 600);
    if (!area && !fixHint) continue;
    out.push({ area, severity, fixHint });
  }
  out.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  return out;
}

function severityRank(s: 'high' | 'medium' | 'low'): number {
  return s === 'high' ? 0 : s === 'medium' ? 1 : 2;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((s) => s.length > 0)
    .map((s) => s.slice(0, 400));
}

function buildFixRequestComment(args: {
  attempt: number;
  maxAttempts: number;
  score: number;
  divergences: Array<{ area: string; severity: string; fixHint: string }>;
  fixInstructions: string;
  prContext?: { repoUrl?: string; prNumber?: number; previewUrl?: string };
  visualSpec?: { palette: string[]; typography: string[]; layoutNotes: string[]; vibe: string };
}): string {
  const sevTag = (s: string) =>
    s === 'high' ? '[HIGH]' : s === 'medium' ? '[MED] ' : '[LOW] ';
  const lines: string[] = [
    `## だらけ自動修正リクエスト (試行 ${args.attempt}/${args.maxAttempts})`,
    '',
    '### Vision比較結果',
    `- 一致スコア: **${args.score}/100**`,
    '- 主な差分:',
    ...(args.divergences.length > 0
      ? args.divergences.map((d) => `  - ${sevTag(d.severity)} ${d.area}: ${d.fixHint}`)
      : ['  - (なし — でも閾値未達)']),
    '',
    '### 設計参照',
    args.prContext?.previewUrl ? `- 現在のプレビュー: ${args.prContext.previewUrl}` : '',
    args.visualSpec
      ? `- 期待される visualSpec: \`${JSON.stringify(args.visualSpec)}\``
      : '',
    '',
    '### 修正方針',
    args.fixInstructions || '(指示なし)',
    '',
    '### 修正タスク',
    ...(args.divergences.length > 0
      ? args.divergences.map((d) => `- [ ] ${d.area}: ${d.fixHint}`)
      : ['- [ ] スコアを80以上に上げる']),
    '',
    '@copilot 上記の差分を修正してください。修正後、再度CIが緑になることを確認してください。',
  ];
  return lines.filter((l) => l !== '').join('\n');
}
