export type BudgetEnv = {
  RUN_REGISTRY_KV?: KVNamespace;
};

export type BudgetKind = 'blueprint' | 'vision';

function todayKey(kind: BudgetKind): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `budget:${kind}:${yyyy}-${mm}-${dd}`;
}

export async function checkBudget(
  env: BudgetEnv,
  kind: BudgetKind,
  capUsd: number,
): Promise<{ allowed: boolean; spentUsd: number; capUsd: number }> {
  if (!env.RUN_REGISTRY_KV) {
    return { allowed: true, spentUsd: 0, capUsd };
  }
  const raw = await env.RUN_REGISTRY_KV.get(todayKey(kind));
  const spentUsd = raw ? Number(raw) || 0 : 0;
  return { allowed: spentUsd < capUsd, spentUsd, capUsd };
}

export async function recordSpend(
  env: BudgetEnv,
  kind: BudgetKind,
  addUsd: number,
): Promise<number> {
  if (!env.RUN_REGISTRY_KV) return 0;
  const key = todayKey(kind);
  const raw = await env.RUN_REGISTRY_KV.get(key);
  const current = raw ? Number(raw) || 0 : 0;
  const next = current + addUsd;
  await env.RUN_REGISTRY_KV.put(key, String(next), { expirationTtl: 60 * 60 * 48 });
  return next;
}

export function parseBudgetUsd(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
