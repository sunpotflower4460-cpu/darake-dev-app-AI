import {
  callAnthropic,
  estimateCostUsd,
  extractJsonObject,
  type AnthropicMessage,
  type AnthropicUserContent,
} from './anthropicClient';
import { checkBudget, parseBudgetUsd, recordSpend, type BudgetEnv } from './budgetGuard';

type BlueprintEnv = BudgetEnv & {
  ANTHROPIC_API_KEY?: string;
  DARAKE_BLUEPRINT_AI_ENABLED?: string;
  BLUEPRINT_AI_DAILY_BUDGET_USD?: string;
  BLUEPRINT_AI_MODEL?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_BUDGET_USD = 5;
const MAX_IMAGES = 8;
const MAX_DESCRIPTION_LEN = 4000;
const MAX_BASE64_LEN = 6_500_000; // ~4.8MB per image after base64

const SYSTEM_PROMPT = `あなたは熟練したプロダクトデザイナー兼テックリードです。ユーザーから渡されたアプリの説明と設計画像を基に、開発を小さなフェーズに分解する設計図を作成してください。

必ず次の純粋なJSONオブジェクト1つだけで応答してください。前置き・コードフェンス・コメントは禁止です。

スキーマ:
{
  "designSummary": string (200-400字、設計の全体像を日本語で要約),
  "visualSpec": {
    "palette": string[] (主要カラーをhex形式で3-6色),
    "typography": string[] (推奨フォント・スタイル特徴を1-3項目),
    "layoutNotes": string[] (レイアウトの特徴を3-6項目、日本語),
    "vibe": string (デザインの雰囲気・トーンを1文で)
  },
  "designAssets": Array<{
    "label": string (画像のファイル名や役割),
    "uiIntent": string (この画像から読み取れるUI意図を1-2文、日本語)
  }> (受け取った画像と同じ順序、同じ個数。画像が0枚なら空配列),
  "plan": {
    "appName": string,
    "phases": Array<{
      "id": string ("phase-1", "phase-2", ... の形式),
      "title": string (フェーズの短い日本語タイトル),
      "purpose": string (このフェーズで達成したいこと、1-2文の日本語),
      "tasks": string[] (具体的な実装タスクのチェックリスト、3-7項目、日本語),
      "doneConditions": string[] (フェーズ完了の判定条件、2-5項目、日本語),
      "manualGates": string[] (人間判断が必要な事項。なければ空配列)
    }> (4-7個)
  }
}

設計のコツ:
- 各フェーズは1つの目的に絞り、PRひとつで完結する粒度にする
- 最初のフェーズはプロジェクト基盤・最小UIスケルトン
- 各フェーズの doneConditions に「該当画面のスクリーンショットが設計画像と一致する」を含める
- 申請・公開関連のフェーズは manualGates に「課金・個人情報・本番リリースは人間承認」を入れる`;

export async function handleGenerateBlueprintFromInput(
  request: Request,
  env: BlueprintEnv,
): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (env.DARAKE_BLUEPRINT_AI_ENABLED !== 'true') {
    return jsonResponse(
      {
        ok: false,
        code: 'DISABLED',
        error: '設計図のAI生成はまだ有効化されていません',
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

  let body: {
    appName?: unknown;
    description?: unknown;
    images?: unknown;
    templateHint?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }

  const appName = String(body.appName ?? '').trim();
  const description = String(body.description ?? '').trim();
  const templateHint = body.templateHint ? String(body.templateHint).trim() : undefined;

  if (!appName || appName.length > 80) {
    return jsonResponse(
      { ok: false, code: 'INVALID_INPUT', error: 'アプリ名を1〜80文字で入力してください' },
      400,
    );
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return jsonResponse(
      {
        ok: false,
        code: 'INVALID_INPUT',
        error: `説明文は${MAX_DESCRIPTION_LEN}文字以下にしてください`,
      },
      400,
    );
  }

  const rawImages = Array.isArray(body.images) ? body.images : [];
  if (rawImages.length > MAX_IMAGES) {
    return jsonResponse(
      { ok: false, code: 'INVALID_INPUT', error: `画像は最大${MAX_IMAGES}枚までです` },
      400,
    );
  }

  type ImageItem = { mediaType: string; base64: string; label?: string };
  const images: ImageItem[] = [];
  for (let i = 0; i < rawImages.length; i += 1) {
    const item = rawImages[i] as { mediaType?: unknown; base64?: unknown; label?: unknown };
    const mediaType = String(item?.mediaType ?? '');
    const base64 = String(item?.base64 ?? '');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(mediaType)) {
      return jsonResponse(
        { ok: false, code: 'INVALID_INPUT', error: `画像${i + 1}: 対応形式はPNG/JPEG/WebPです` },
        400,
      );
    }
    if (!base64 || base64.length > MAX_BASE64_LEN) {
      return jsonResponse(
        { ok: false, code: 'INVALID_INPUT', error: `画像${i + 1}: サイズが大きすぎます` },
        400,
      );
    }
    const label = item?.label ? String(item.label).slice(0, 120) : undefined;
    images.push({ mediaType, base64, label });
  }

  if (!description && images.length === 0) {
    return jsonResponse(
      {
        ok: false,
        code: 'INVALID_INPUT',
        error: '説明文か画像を少なくとも1つ送ってください',
      },
      400,
    );
  }

  const cap = parseBudgetUsd(env.BLUEPRINT_AI_DAILY_BUDGET_USD, DEFAULT_BUDGET_USD);
  const budget = await checkBudget(env, 'blueprint', cap);
  if (!budget.allowed) {
    return jsonResponse(
      {
        ok: false,
        code: 'BUDGET_EXCEEDED',
        error: `本日の設計図AI予算 $${cap.toFixed(2)} を超えました（現在 $${budget.spentUsd.toFixed(2)}）`,
      },
      429,
    );
  }

  const model = env.BLUEPRINT_AI_MODEL?.trim() || DEFAULT_MODEL;

  const userContent: AnthropicUserContent[] = [];
  const labelLines = images.map((img, i) => `画像${i + 1}: ${img.label ?? '(ファイル名なし)'}`);
  userContent.push({
    type: 'text',
    text: [
      `# アプリ名`,
      appName,
      '',
      `# ユーザーからの説明`,
      description || '(説明文なし。画像から推測してください)',
      '',
      templateHint ? `# テンプレートヒント\n${templateHint}\n` : '',
      images.length > 0 ? `# 添付画像（${images.length}枚）\n${labelLines.join('\n')}` : '# 画像なし',
      '',
      `上記の情報からアプリ設計図を生成してください。designAssetsは画像と同じ順序・同じ個数で必ず返してください。`,
    ]
      .filter(Boolean)
      .join('\n'),
  });
  for (const img of images) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
    });
  }

  const messages: AnthropicMessage[] = [{ role: 'user', content: userContent }];

  const aiResult = await callAnthropic(env.ANTHROPIC_API_KEY, {
    model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages,
  });

  if (!aiResult.ok) {
    return jsonResponse(
      { ok: false, code: aiResult.code, error: aiResult.error },
      aiResult.status >= 400 && aiResult.status < 600 ? aiResult.status : 502,
    );
  }

  const spend = estimateCostUsd(model, aiResult.usage);
  await recordSpend(env, 'blueprint', spend).catch(() => null);

  let parsed: unknown;
  try {
    parsed = extractJsonObject(aiResult.text);
  } catch (e) {
    return jsonResponse(
      {
        ok: false,
        code: 'PARSE_ERROR',
        error: `AI応答をJSONとして解釈できませんでした: ${(e as Error).message}`,
      },
      502,
    );
  }

  const normalized = normalizeBlueprintResult(parsed, appName, images);
  if (!normalized.ok) {
    return jsonResponse({ ok: false, code: 'SCHEMA_ERROR', error: normalized.error }, 502);
  }

  return jsonResponse({ ok: true, result: normalized.result, model, spendUsd: spend });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

type NormalizeResult =
  | {
      ok: true;
      result: {
        plan: {
          appName: string;
          phases: Array<{
            id: string;
            title: string;
            purpose: string;
            tasks: string[];
            doneConditions: string[];
            manualGates: string[];
          }>;
        };
        designSummary: string;
        designAssets: Array<{ id: string; mediaType: string; uiIntent: string; label?: string }>;
        visualSpec: {
          palette: string[];
          typography: string[];
          layoutNotes: string[];
          vibe: string;
        };
      };
    }
  | { ok: false; error: string };

function normalizeBlueprintResult(
  raw: unknown,
  fallbackAppName: string,
  images: Array<{ mediaType: string; label?: string }>,
): NormalizeResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: '応答がオブジェクトではありません' };
  }
  const r = raw as Record<string, unknown>;
  const planRaw = r.plan as Record<string, unknown> | undefined;
  if (!planRaw || !Array.isArray(planRaw.phases)) {
    return { ok: false, error: 'plan.phases が見つかりません' };
  }
  const phases = (planRaw.phases as unknown[]).map((p, idx) => {
    const obj = (p ?? {}) as Record<string, unknown>;
    return {
      id: String(obj.id ?? `phase-${idx + 1}`),
      title: String(obj.title ?? `フェーズ${idx + 1}`).slice(0, 120),
      purpose: String(obj.purpose ?? '').slice(0, 600),
      tasks: toStringArray(obj.tasks).slice(0, 20),
      doneConditions: toStringArray(obj.doneConditions).slice(0, 20),
      manualGates: toStringArray(obj.manualGates).slice(0, 20),
    };
  });
  if (phases.length === 0) {
    return { ok: false, error: 'phasesが0件です' };
  }

  const visualRaw = (r.visualSpec ?? {}) as Record<string, unknown>;
  const visualSpec = {
    palette: toStringArray(visualRaw.palette).slice(0, 12),
    typography: toStringArray(visualRaw.typography).slice(0, 6),
    layoutNotes: toStringArray(visualRaw.layoutNotes).slice(0, 12),
    vibe: String(visualRaw.vibe ?? '').slice(0, 200),
  };

  const assetsRaw = Array.isArray(r.designAssets) ? (r.designAssets as unknown[]) : [];
  const designAssets = images.map((img, idx) => {
    const a = (assetsRaw[idx] ?? {}) as Record<string, unknown>;
    return {
      id: `asset-${idx + 1}`,
      mediaType: img.mediaType,
      uiIntent: String(a.uiIntent ?? '').slice(0, 400),
      label: a.label ? String(a.label).slice(0, 120) : img.label,
    };
  });

  return {
    ok: true,
    result: {
      plan: {
        appName: String(planRaw.appName ?? fallbackAppName).slice(0, 120),
        phases,
      },
      designSummary: String(r.designSummary ?? '').slice(0, 2000),
      designAssets,
      visualSpec,
    },
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((s) => s.length > 0)
    .map((s) => s.slice(0, 400));
}
