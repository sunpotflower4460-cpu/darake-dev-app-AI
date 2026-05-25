// Dynamic repo allowlist: static GITHUB_ALLOWED_REPOS env (immutable baseline)
// merged with a KV-backed list that the project bootstrap appends to, so
// auto-created repos are permitted without a redeploy.

export type AllowlistEnv = {
  GITHUB_ALLOWED_REPOS?: string;
  RUN_REGISTRY_KV?: KVNamespace;
};

const KV_ALLOWLIST_KEY = 'index:allowed-repos';

function staticList(env: AllowlistEnv): string[] {
  return (env.GITHUB_ALLOWED_REPOS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function kvList(env: AllowlistEnv): Promise<string[]> {
  if (!env.RUN_REGISTRY_KV) return [];
  const raw = await env.RUN_REGISTRY_KV.get(KV_ALLOWLIST_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.map((s) => s.toLowerCase()) : [];
  } catch {
    return [];
  }
}

/**
 * Returns true if the repo is allowed.
 * - If the static allowlist is empty, everything is allowed (preserves the
 *   previous permissive default).
 * - If the static allowlist is set, allow when the repo matches it OR is in
 *   the KV-backed dynamic list.
 */
export async function isAllowedRepoAsync(fullName: string, env: AllowlistEnv): Promise<boolean> {
  const statics = staticList(env);
  if (statics.length === 0) return true;
  const target = fullName.toLowerCase();
  if (statics.includes(target)) return true;
  const dynamic = await kvList(env);
  return dynamic.includes(target);
}

export async function addAllowedRepo(env: AllowlistEnv, fullName: string): Promise<void> {
  if (!env.RUN_REGISTRY_KV) return;
  const target = fullName.toLowerCase();
  const dynamic = await kvList(env);
  if (dynamic.includes(target)) return;
  dynamic.push(target);
  await env.RUN_REGISTRY_KV.put(KV_ALLOWLIST_KEY, JSON.stringify(dynamic));
}
