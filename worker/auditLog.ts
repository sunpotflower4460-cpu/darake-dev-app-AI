export type AuditLogEnv = {
  RUN_REGISTRY_KV?: KVNamespace;
};

export type AuditLogEntry = {
  ts: string;
  scope: string;
  kind: string;
  message: string;
  meta?: Record<string, string | number | boolean>;
};

const AUDIT_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export async function appendAudit(
  env: AuditLogEnv,
  entry: Omit<AuditLogEntry, 'ts'>,
): Promise<void> {
  if (!env.RUN_REGISTRY_KV) return;
  const ts = new Date().toISOString();
  const safeScope = entry.scope.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64) || 'default';
  const key = `audit:${safeScope}:${ts}-${Math.random().toString(36).slice(2, 6)}`;
  const value: AuditLogEntry = { ts, ...entry };
  try {
    await env.RUN_REGISTRY_KV.put(key, JSON.stringify(value), {
      expirationTtl: AUDIT_TTL_SECONDS,
    });
  } catch {
    // Audit logging must never throw into the caller's error path.
  }
}

export async function listAudit(
  env: AuditLogEnv,
  scope: string,
  limit = 50,
): Promise<AuditLogEntry[]> {
  if (!env.RUN_REGISTRY_KV) return [];
  const safeScope = scope.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64) || 'default';
  const list = await env.RUN_REGISTRY_KV.list({
    prefix: `audit:${safeScope}:`,
    limit: Math.min(Math.max(limit, 1), 200),
  });
  const entries: AuditLogEntry[] = [];
  for (const k of list.keys) {
    const raw = await env.RUN_REGISTRY_KV.get(k.name);
    if (!raw) continue;
    try {
      entries.push(JSON.parse(raw) as AuditLogEntry);
    } catch {
      // skip malformed
    }
  }
  entries.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  return entries;
}
