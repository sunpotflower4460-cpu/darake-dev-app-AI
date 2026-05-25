import { callAnthropic, estimateCostUsd, extractJsonObject } from './anthropicClient';
import { checkBudget, parseBudgetUsd, recordSpend, type BudgetEnv } from './budgetGuard';
import { appendAudit } from './auditLog';

type MetadataDraftEnv = BudgetEnv & {
  ANTHROPIC_API_KEY?: string;
  DARAKE_METADATA_DRAFT_ENABLED?: string;
  BLUEPRINT_AI_DAILY_BUDGET_USD?: string;
  BLUEPRINT_AI_MODEL?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `あなたはアプリストア申請の専門家です。アプリの情報から、申請に必要な下書きを作成してください。
必ず次のスキーマの純粋なJSONだけで応答してください(前置き・コードフェンス禁止):
{
  "privacyPolicyMarkdown": string (日本語のプライバシーポリシー本文。データ収集の有無・問い合わせ先プレースホルダを含む、ホスティングして使える完全な文章),
  "ageRating": {
    "recommended": string (例: "4+" / "12+" など),
    "answers": string[] (年齢区分質問票への回答要点、日本語、3-8項目)
  },
  "reviewNotes": string (審査担当者向けのレビューメモ、日本語、2-4文)
}
データ収集が無い前提が不明な場合は「収集しない」を基本としつつ、確認を促す注記を入れてください。`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function handleDraftMetadata(request: Request, env: MetadataDraftEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (env.DARAKE_METADATA_DRAFT_ENABLED !== 'true') {
    return json({ ok: false, code: 'DISABLED', error: 'メタデータAI下書きはまだ有効化されていません' }, 403);
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json({ ok: false, code: 'MISSING_SECRET', error: 'ANTHROPIC_API_KEYが未設定です' }, 500);
  }

  let body: { appName?: unknown; description?: unknown; collectsData?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }
  const appName = String(body.appName ?? '').trim();
  if (!appName || appName.length > 80) {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'アプリ名を1〜80文字で入力してください' }, 400);
  }
  const description = String(body.description ?? '').slice(0, 2000);
  const collectsData = body.collectsData === true;

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

  const model = env.BLUEPRINT_AI_MODEL?.trim() || DEFAULT_MODEL;
  const userText = [
    `アプリ名: ${appName}`,
    description ? `説明: ${description}` : '',
    `データ収集: ${collectsData ? 'あり' : 'なし(または不明)'}`,
    '',
    'このアプリの申請メタデータ下書きを作成してください。',
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

  let parsed: Record<string, unknown>;
  try {
    parsed = (extractJsonObject(ai.text) ?? {}) as Record<string, unknown>;
  } catch (e) {
    return json({ ok: false, code: 'PARSE_ERROR', error: (e as Error).message }, 502);
  }

  const ratingRaw = (parsed.ageRating ?? {}) as Record<string, unknown>;
  const result = {
    privacyPolicyMarkdown: String(parsed.privacyPolicyMarkdown ?? '').slice(0, 8000),
    ageRating: {
      recommended: String(ratingRaw.recommended ?? '').slice(0, 20),
      answers: Array.isArray(ratingRaw.answers)
        ? (ratingRaw.answers as unknown[])
            .filter((x) => typeof x === 'string')
            .map((x) => String(x).slice(0, 300))
            .slice(0, 12)
        : [],
    },
    reviewNotes: String(parsed.reviewNotes ?? '').slice(0, 2000),
  };

  await appendAudit(env, { scope: appName, kind: 'metadata-drafted', message: `model=${model}` });
  return json({ ok: true, result, model });
}
