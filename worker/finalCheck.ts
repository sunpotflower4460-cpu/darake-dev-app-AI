import { callAnthropic, estimateCostUsd, extractJsonObject, type AnthropicUserContent } from './anthropicClient';
import { appendAudit } from './auditLog';
import { checkBudget, parseBudgetUsd, recordSpend, type BudgetEnv } from './budgetGuard';
import { getProject, saveProject } from './projectRegistry';

type FinalCheckEnv = BudgetEnv & {
  ANTHROPIC_API_KEY?: string;
  DARAKE_FINAL_CHECK_ENABLED?: string;
  VISION_VERIFY_DAILY_BUDGET_USD?: string;
  VISION_VERIFY_MODEL?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MAX_IMAGES = 8;
const MAX_BASE64_LEN = 6_500_000;

const STRICT_SYSTEM = `あなたはリリース前の最終UIレビュアーです。アプリ全体のスクリーンショット群と参照設計図を比較し、設計図どおりに完成しているかを厳しく評価してください。
必ず次のJSONだけで応答してください(前置き禁止):
{ "score": number(0-100), "ready": boolean, "blockers": string[](リリースを止めるべき問題、日本語), "notes": string }`;

const DEVIL_SYSTEM = `あなたは懐疑的なレビュアーです。このアプリが「まだ完成していない」と言える理由をできる限り挙げてください。粗探しが仕事です。
必ず次のJSONだけで応答してください(前置き禁止):
{ "reasonsNotDone": string[](完成していない理由、日本語), "severityHigh": number(重大な理由の数) }`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function parseImages(raw: unknown): Array<{ mediaType: string; base64: string; label?: string }> {
  if (!Array.isArray(raw)) return [];
  const out: Array<{ mediaType: string; base64: string; label?: string }> = [];
  for (const item of raw.slice(0, MAX_IMAGES)) {
    const i = (item ?? {}) as Record<string, unknown>;
    const mediaType = String(i.mediaType ?? '');
    const base64 = String(i.base64 ?? '');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(mediaType)) continue;
    if (!base64 || base64.length > MAX_BASE64_LEN) continue;
    out.push({ mediaType, base64, label: i.label ? String(i.label).slice(0, 120) : undefined });
  }
  return out;
}

function imagesToContent(
  intro: string,
  designAssets: Array<{ mediaType: string; base64: string }>,
  captured: Array<{ mediaType: string; base64: string }>,
): AnthropicUserContent[] {
  const content: AnthropicUserContent[] = [{ type: 'text', text: intro }];
  content.push({ type: 'text', text: '## 参照設計図' });
  for (const d of designAssets) {
    content.push({ type: 'image', source: { type: 'base64', media_type: d.mediaType, data: d.base64 } });
  }
  content.push({ type: 'text', text: '## アプリ全体スクリーンショット' });
  for (const c of captured) {
    content.push({ type: 'image', source: { type: 'base64', media_type: c.mediaType, data: c.base64 } });
  }
  return content;
}

export async function handleFinalCheck(request: Request, env: FinalCheckEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (env.DARAKE_FINAL_CHECK_ENABLED !== 'true') {
    return json({ ok: false, code: 'DISABLED', error: '最終完成判定はまだ有効化されていません' }, 403);
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json({ ok: false, code: 'MISSING_SECRET', error: 'ANTHROPIC_API_KEYが未設定です' }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }

  const projectId = String(body.projectId ?? 'manual').trim() || 'manual';
  const previewUrl = body.previewUrl ? String(body.previewUrl).slice(0, 600) : undefined;
  const designAssets = parseImages(body.designAssets);
  const captured = parseImages(body.capturedScreenshots);

  if (designAssets.length === 0 || captured.length === 0) {
    return json(
      { ok: false, code: 'INVALID_INPUT', error: '参照設計図とスクリーンショットを両方渡してください' },
      400,
    );
  }

  const cap = parseBudgetUsd(env.VISION_VERIFY_DAILY_BUDGET_USD, 10);
  const budget = await checkBudget(env, 'vision', cap);
  if (!budget.allowed) {
    return json(
      {
        ok: false,
        code: 'BUDGET_EXCEEDED',
        error: `本日の予算 $${cap.toFixed(2)} を超えました（現在 $${budget.spentUsd.toFixed(2)}）`,
      },
      429,
    );
  }

  const model = env.VISION_VERIFY_MODEL?.trim() || DEFAULT_MODEL;

  // Pass 1 — strict comparison.
  const strict = await callAnthropic(env.ANTHROPIC_API_KEY, {
    model,
    max_tokens: 3072,
    system: STRICT_SYSTEM,
    messages: [
      {
        role: 'user',
        content: imagesToContent(
          `# 最終判定 (厳格)\nprojectId: ${projectId}\n設計図どおりに完成しているか評価してください。`,
          designAssets,
          captured,
        ),
      },
    ],
  });
  if (!strict.ok) {
    return json({ ok: false, code: strict.code, error: strict.error }, 502);
  }
  await recordSpend(env, 'vision', estimateCostUsd(model, strict.usage)).catch(() => null);

  // Pass 2 — devil's advocate ("really done?").
  const devil = await callAnthropic(env.ANTHROPIC_API_KEY, {
    model,
    max_tokens: 2048,
    system: DEVIL_SYSTEM,
    messages: [
      {
        role: 'user',
        content: imagesToContent(
          `# 本当に完成か?\nprojectId: ${projectId}\nこのアプリが完成していないと言える理由を挙げてください。`,
          designAssets,
          captured,
        ),
      },
    ],
  });
  if (!devil.ok) {
    return json({ ok: false, code: devil.code, error: devil.error }, 502);
  }
  await recordSpend(env, 'vision', estimateCostUsd(model, devil.usage)).catch(() => null);

  let strictObj: Record<string, unknown> = {};
  let devilObj: Record<string, unknown> = {};
  try {
    strictObj = (extractJsonObject(strict.text) ?? {}) as Record<string, unknown>;
    devilObj = (extractJsonObject(devil.text) ?? {}) as Record<string, unknown>;
  } catch (e) {
    return json({ ok: false, code: 'PARSE_ERROR', error: (e as Error).message }, 502);
  }

  const score = clamp(strictObj.score, 0, 0, 100);
  const blockers = strArr(strictObj.blockers);
  const reasonsNotDone = strArr(devilObj.reasonsNotDone);
  const severityHigh = clamp(devilObj.severityHigh, 0, 0, 99);
  const strictReady = strictObj.ready === true;

  // Complete only when both passes agree: high score, no blockers, no high-severity doubts.
  const complete = strictReady && score >= 90 && blockers.length === 0 && severityHigh === 0;

  const result = {
    projectId,
    complete,
    score,
    blockers,
    reasonsNotDone,
    notes: String(strictObj.notes ?? '').slice(0, 1000),
    previewUrl,
    createdAt: new Date().toISOString(),
  };

  // Update project status if it exists.
  if (env.RUN_REGISTRY_KV && projectId !== 'manual') {
    const project = await getProject(env.RUN_REGISTRY_KV, projectId);
    if (project) {
      await saveProject(env.RUN_REGISTRY_KV, {
        ...project,
        status: complete ? 'awaiting-user' : 'verifying',
        updatedAt: new Date().toISOString(),
      });
    }
  }

  await appendAudit(env, {
    scope: projectId,
    kind: complete ? 'final-check-complete' : 'final-check-incomplete',
    message: `score=${score} blockers=${blockers.length} doubts=${reasonsNotDone.length}`,
  });

  return json({ ok: true, result });
}

function clamp(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function strArr(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean)
    .map((s) => s.slice(0, 400))
    .slice(0, 20);
}
